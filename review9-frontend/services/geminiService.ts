'use client';

import { GoogleGenAI, Type } from "@google/genai";
import { APP_CONFIG } from "@/config";
import { SubscriptionPlan } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export const geminiService = {
    async generateInterviewQuestions(role: string, resumeText: string, plan: SubscriptionPlan) {
        const planConfig = APP_CONFIG.PLANS[plan];
        const model = plan === SubscriptionPlan.FREE ? APP_CONFIG.MODELS.FLASH : APP_CONFIG.MODELS.PRIMARY;
        const count = planConfig.fixedQuestionCount;

        const prompt = `
      Task: Analyze the following resume text and the job role provided. Generate ${count} highly relevant interview questions.
      
      Job Role: ${role}
      Resume Content: "${resumeText}"
      Plan Level: ${plan}

      Guidelines:
      1. If FREE: Questions should be fundamental, standard, and clear.
      2. If PRO/ULTRA: Questions should be multi-layered, deep-diving into specific skills on the resume.
      
      Output Format: Return ONLY a JSON array of strings.
    `;

        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are an elite technical interviewer. You extract maximum signal from candidates. Use JSON format.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            });
            const parsed = JSON.parse(response.text || '[]');
            return parsed.length > 0 ? parsed : APP_CONFIG.INTERVIEW.fallbackQuestions;
        } catch (error) {
            console.error("Gemini Question Generation Error:", error);
            return APP_CONFIG.INTERVIEW.fallbackQuestions;
        }
    },

    async getDynamicResponse(context: string, candidateAnswer: string, currentStep: number, plan: SubscriptionPlan) {
        const model = plan === SubscriptionPlan.FREE ? APP_CONFIG.MODELS.FLASH : APP_CONFIG.MODELS.PRIMARY;
        const maxWords = APP_CONFIG.SPEECH.acknowledgmentMaxLength;

        const prompt = `
      Current Question Context: ${context}
      Candidate's Answer: "${candidateAnswer}"
      
      Instructions:
      1. Briefly acknowledge their answer.
      2. Provide a bridge to the next topic.
      
      Constraints:
      - TOTAL word count must be under ${maxWords} words.
      - Do NOT ask a new question.
      
      Structure: [Acknowledgment]. [Transition].
    `;

        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a professional, concise AI interviewer. You bridges topics smoothly.",
                    temperature: 0.7,
                }
            });
            return response.text?.trim() || "Thank you. Let's proceed.";
        } catch (error) {
            return "Got it. Moving on.";
        }
    },

    async evaluateInterview(resumeText: string, transcript: { q: string, a: string }[], role: string) {
        const metrics = APP_CONFIG.EVALUATION.metrics;

        const prompt = `
      STRICT EVALUATION TASK:
      Review the interview data for the role: ${role}.
      
      RESUME: "${resumeText}"
      TRANSCRIPT: ${JSON.stringify(transcript)}
      
      SCORING RULES:
      1. Evaluate on: ${metrics.join(', ')}.
      2. Each metric is scored 0-100.
      3. Decision: Is the candidate a "fit" for the company? (TRUE/FALSE)
      4. Reasoning: Must be strictly evidence-based from the resume and transcript.
      
      Output MUST be a JSON object.
    `;

        try {
            const response = await ai.models.generateContent({
                model: APP_CONFIG.MODELS.PRIMARY,
                contents: prompt,
                config: {
                    systemInstruction: APP_CONFIG.EVALUATION.systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            overallScore: { type: Type.NUMBER },
                            metrics: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        score: { type: Type.NUMBER },
                                        feedback: { type: Type.STRING }
                                    },
                                    required: ['name', 'score', 'feedback']
                                }
                            },
                            isFit: { type: Type.BOOLEAN },
                            reasoning: { type: Type.STRING },
                            behavioralNote: { type: Type.STRING }
                        },
                        required: ['overallScore', 'metrics', 'isFit', 'reasoning', 'behavioralNote']
                    }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) {
            console.error("Evaluation Error:", error);
            return {
                overallScore: APP_CONFIG.EVALUATION.defaultScore,
                metrics: [],
                isFit: false,
                reasoning: "System encountered an error during detailed evaluation.",
                behavioralNote: "Audit failed to process transcript."
            };
        }
    }
};
