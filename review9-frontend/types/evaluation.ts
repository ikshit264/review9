export interface EvaluationMetric {
    name: string;
    score: number;
    feedback: string;
}

export interface FinalEvaluation {
    overallScore: number;
    metrics: EvaluationMetric[];
    isFit: boolean;
    reasoning: string;
    behavioralNote?: string;
}
