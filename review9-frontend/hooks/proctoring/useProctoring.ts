import { useRef, useEffect, useCallback, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface ProctoringEvent {
    type: 'multiple_faces' | 'no_face' | 'attention_deviation';
    timestamp: Date;
    severity: 'low' | 'medium';
}

interface useProctoringProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    enabled: boolean;
    onEvent: (event: ProctoringEvent) => void;
}

const FPS = 3;
const FRAME_INTERVAL = 1000 / FPS;

// Thresholds
const MULTI_FACE_THRESHOLD_MS = 3000;
const NO_FACE_THRESHOLD_MS = 5000;
const ATTENTION_DEVIATION_THRESHOLD_MS = 6000;
const YAW_THRESHOLD = 30; // degrees
const PITCH_THRESHOLD = 25; // degrees

export const useProctoring = ({ videoRef, enabled, onEvent }: useProctoringProps) => {
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const lastProcessedTimeRef = useRef<number>(0);
    const requestRef = useRef<number>();

    // State for signal tracking (durations)
    const signalsRef = useRef({
        multipleFacesStart: 0,
        noFaceStart: 0,
        attentionDeviationStart: 0,
        lastMultipleFacesLogged: 0,
        lastNoFaceLogged: 0,
        lastAttentionLogged: 0,
    });

    const [isInitializing, setIsInitializing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [metrics, setMetrics] = useState({
        faces: 0,
        yaw: 0,
        pitch: 0,
    });

    // Lazy Initialization
    useEffect(() => {
        if (!enabled || landmarkerRef.current || isInitializing) return;

        const init = async () => {
            console.log("[Proctoring] Initializing FaceLandmarker...");
            setIsInitializing(true);
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );
                const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: false,
                    runningMode: "VIDEO",
                    numFaces: 2
                });
                landmarkerRef.current = faceLandmarker;
                console.log("[Proctoring] FaceLandmarker Ready");
                setIsReady(true);
            } catch (error) {
                console.error("[Proctoring] Failed to initialize FaceLandmarker:", error);
            } finally {
                setIsInitializing(false);
            }
        };

        init();
    }, [enabled, isInitializing]);

    const processFrame = useCallback((time: number) => {
        if (!enabled || !landmarkerRef.current || !videoRef.current) {
            return;
        }

        // Rate limiting
        if (time - lastProcessedTimeRef.current < FRAME_INTERVAL) {
            requestRef.current = requestAnimationFrame(processFrame);
            return;
        }
        lastProcessedTimeRef.current = time;

        // Skip if video is not ready
        if (videoRef.current.readyState < 2 || videoRef.current.paused || videoRef.current.ended) {
            requestRef.current = requestAnimationFrame(processFrame);
            return;
        }

        try {
            const results = landmarkerRef.current.detectForVideo(videoRef.current, time);
            const facesCount = results.faceLandmarks.length;

            if (facesCount > 0 || Math.random() < 0.1) { // Log 10% of zero-face frames to avoid spam but still see heartbeat
                // console.log(`[Proctoring] Faces: ${facesCount}`);
            }

            const now = Date.now();
            let yaw = 0;
            let pitch = 0;

            // 1. Multi-Face Detection
            if (facesCount > 1) {
                if (signalsRef.current.multipleFacesStart === 0) {
                    signalsRef.current.multipleFacesStart = now;
                    console.log("[Proctoring] Multi-face detection started...");
                } else if (now - signalsRef.current.multipleFacesStart >= MULTI_FACE_THRESHOLD_MS) {
                    if (now - signalsRef.current.lastMultipleFacesLogged > 10000) { // Cooldown 10s
                        console.warn("[Proctoring] Multi-face threshold reached. Triggering event.");
                        onEvent({ type: 'multiple_faces', timestamp: new Date(), severity: 'medium' });
                        signalsRef.current.lastMultipleFacesLogged = now;
                    }
                }
            } else {
                if (signalsRef.current.multipleFacesStart !== 0) {
                    console.log("[Proctoring] Multi-face signal cleared.");
                }
                signalsRef.current.multipleFacesStart = 0;
            }

            // 2. No-Face Detection
            if (facesCount === 0) {
                if (signalsRef.current.noFaceStart === 0) {
                    signalsRef.current.noFaceStart = now;
                    console.log("[Proctoring] No face detection started...");
                } else if (now - signalsRef.current.noFaceStart >= NO_FACE_THRESHOLD_MS) {
                    if (now - signalsRef.current.lastNoFaceLogged > 10000) { // Cooldown 10s
                        console.warn("[Proctoring] No face threshold reached. Triggering event.");
                        onEvent({ type: 'no_face', timestamp: new Date(), severity: 'low' });
                        signalsRef.current.lastNoFaceLogged = now;
                    }
                }
            } else {
                if (signalsRef.current.noFaceStart !== 0) {
                    console.log("[Proctoring] Face detected, signal cleared.");
                }
                signalsRef.current.noFaceStart = 0;
            }

            // 3. Attention Detection (Head Pose)
            if (facesCount === 1) {
                const landmarks = results.faceLandmarks[0];

                // Simple Pose Inference using key landmarks
                // Indices: 1 (nose tip), 152 (chin), 33 (left eye corner), 263 (right eye corner)
                const nose = landmarks[1];
                const chin = landmarks[152];
                const leftEye = landmarks[33];
                const rightEye = landmarks[263];

                // Yaw calculation (simplified: horizontal asymmetry between nose and eye corners)
                const dL = Math.sqrt(Math.pow(nose.x - leftEye.x, 2) + Math.pow(nose.y - leftEye.y, 2));
                const dR = Math.sqrt(Math.pow(nose.x - rightEye.x, 2) + Math.pow(nose.y - rightEye.y, 2));
                yaw = Math.abs((dL - dR) / (dL + dR)) * 100; // Rough estimate of rotation

                // Pitch calculation (simplified: vertical position of nose between chin and forehead/eyes)
                const verticalRatio = (nose.y - leftEye.y) / (chin.y - leftEye.y);
                pitch = Math.abs(verticalRatio - 0.5) * 100;

                if (yaw > YAW_THRESHOLD || pitch > PITCH_THRESHOLD) {
                    if (signalsRef.current.attentionDeviationStart === 0) {
                        signalsRef.current.attentionDeviationStart = now;
                    } else if (now - signalsRef.current.attentionDeviationStart >= ATTENTION_DEVIATION_THRESHOLD_MS) {
                        if (now - signalsRef.current.lastAttentionLogged > 15000) { // Cooldown 15s
                            onEvent({ type: 'attention_deviation', timestamp: new Date(), severity: 'low' });
                            signalsRef.current.lastAttentionLogged = now;
                        }
                    }
                } else {
                    signalsRef.current.attentionDeviationStart = 0;
                }
            } else {
                signalsRef.current.attentionDeviationStart = 0;
            }

            // Update metrics state less frequently to improve performance
            const shouldUpdateMetrics = facesCount !== metrics.faces || time % 10 < 1;
            if (shouldUpdateMetrics) {
                setMetrics({
                    faces: facesCount,
                    yaw: Math.round(yaw),
                    pitch: Math.round(pitch),
                });
            }

        } catch (err) {
            console.error("[Proctoring] Frame processing error:", err);
        }

        requestRef.current = requestAnimationFrame(processFrame);
    }, [enabled, onEvent, videoRef]);

    useEffect(() => {
        if (enabled && isReady) {
            requestRef.current = requestAnimationFrame(processFrame);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [enabled, isReady, processFrame]);

    useEffect(() => {
        return () => {
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
                landmarkerRef.current = null;
            }
        };
    }, []);

    return { isReady, isInitializing, metrics };
};
