"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let GeminiService = class GeminiService {
    constructor(configService) {
        this.configService = configService;
        this.MODEL_NAME = 'gemini-2.5-flash';
        this.LOG_FILE = path.join(process.cwd(), 'gemini-debug.log');
        const apiKey = this.configService.get('NEST_GEMINI_API_KEY');
        this.logToFile(`\n${'='.repeat(80)}`);
        this.logToFile(`Gemini Service Initializing... with ${apiKey}`);
        this.logToFile(`--- Gemini Service Initialized at ${new Date().toISOString()} ---`);
        this.logToFile(`${'='.repeat(80)}`);
        if (!apiKey) {
            this.logToFile('❌ CRITICAL: GEMINI_API_KEY is not set!');
            this.logToFile('❌ Get your API key from: https://aistudio.google.com/app/apikey');
            this.logToFile('❌ Add to .env file: GEMINI_API_KEY=your_key_here');
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.logToFile(`✅ API Key found (length: ${apiKey.length})`);
        this.logToFile(`✅ Using model: ${this.MODEL_NAME}`);
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.logToFile('✅ Google Generative AI SDK initialized');
        this.logToFile(`${'='.repeat(80)}\n`);
    }
    logToFile(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        try {
            fs.appendFileSync(this.LOG_FILE, logMessage);
        }
        catch (e) {
        }
        console.log(message);
    }
    getModel(temperature = 0.1) {
        return this.genAI.getGenerativeModel({
            model: this.MODEL_NAME,
            generationConfig: {
                temperature,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
            safetySettings: [
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
        });
    }
    async callGemini(prompt, temperature = 0.1, maxRetries = 3) {
        this.logToFile(`\n[API Call] Starting...`);
        this.logToFile(`[API Call] Prompt length: ${prompt.length} characters`);
        this.logToFile(`[API Call] Temperature: ${temperature}`);
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logToFile(`[Attempt ${attempt}/${maxRetries}] Generating content...`);
                const model = this.getModel(temperature);
                const result = await model.generateContent(prompt);
                const response = result.response;
                if (!response.text()) {
                    const blockReason = response.promptFeedback?.blockReason;
                    if (blockReason) {
                        this.logToFile(`❌ Content blocked: ${blockReason}`);
                        throw new Error(`Content blocked by safety filters: ${blockReason}`);
                    }
                    throw new Error('No text in response');
                }
                const text = response.text();
                this.logToFile(`✅ Success! Response length: ${text.length} characters`);
                if (response.usageMetadata) {
                    this.logToFile(`[Tokens] Prompt: ${response.usageMetadata.promptTokenCount}, ` +
                        `Response: ${response.usageMetadata.candidatesTokenCount}, ` +
                        `Total: ${response.usageMetadata.totalTokenCount}`);
                }
                return text;
            }
            catch (error) {
                this.logToFile(`❌ Attempt ${attempt} failed: ${error.message}`);
                if (error.message?.includes('429') || error.message?.includes('quota')) {
                    this.logToFile('⚠️ Rate limit hit. Waiting before retry...');
                    if (attempt < maxRetries) {
                        const waitTime = Math.pow(2, attempt) * 1000;
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                }
                if (error.message?.includes('API key')) {
                    this.logToFile('❌ API Key error detected!');
                    this.logToFile('❌ Your API key may be expired or invalid');
                    this.logToFile('❌ Get a new key from: https://aistudio.google.com/app/apikey');
                    throw new Error('Invalid or expired API key. Please update your GEMINI_API_KEY in .env');
                }
                if (attempt === maxRetries) {
                    this.logToFile(`❌ All ${maxRetries} attempts failed`);
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
        throw new Error('Max retries exceeded');
    }
    async generateQuestions(input, count) {
        const hasCustomQuestions = input.customQuestions && input.customQuestions.length > 0;
        const customQuestionsText = hasCustomQuestions
            ? `\n\nIMPORTANT - MANDATORY QUESTIONS:\nYou MUST include ALL of these specific questions in your response:\n${input.customQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n`
            : '';
        const aiRequirementsText = input.aiSpecificRequirements
            ? `\n\nSPECIFIC REQUIREMENTS TO FOCUS ON:\n${input.aiSpecificRequirements}\n`
            : '';
        const additionalQuestionsNeeded = hasCustomQuestions ? Math.max(0, count - input.customQuestions.length) : count;
        const prompt = `You are an expert technical interviewer for a ${input.roleCategory} role titled "${input.jobTitle}".

Job Description:
${input.jobDescription}${aiRequirementsText}${customQuestionsText}

Candidate Resume:
${input.resumeText || 'Not provided'}

${hasCustomQuestions
            ? `Generate a JSON array containing ALL ${input.customQuestions.length} mandatory questions listed above, plus ${additionalQuestionsNeeded} additional technical/behavioral questions based on the job requirements.\n\nTotal questions to return: ${count}`
            : `Generate ${count} distinct interview questions (mix of technical and behavioral) based on the above details.`}

IMPORTANT: Return ONLY a valid JSON array of strings. No markdown, no explanation, just the JSON array.
Example format: ["Question 1", "Question 2", "Question 3"]`;
        this.logToFile(`\n[generateQuestions] Generating ${count} questions for: ${input.jobTitle}`);
        if (hasCustomQuestions) {
            this.logToFile(`[generateQuestions] Including ${input.customQuestions.length} custom questions`);
        }
        if (input.aiSpecificRequirements) {
            this.logToFile(`[generateQuestions] Using AI-specific requirements`);
        }
        try {
            const text = await this.callGemini(prompt, 0.7);
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                this.logToFile(`❌ Could not extract JSON array from response`);
                this.logToFile(`Response preview: ${text.substring(0, 200)}`);
                throw new Error('Invalid JSON in response');
            }
            const questions = JSON.parse(jsonMatch[0]);
            if (!Array.isArray(questions)) {
                throw new Error('Response is not an array');
            }
            this.logToFile(`✅ Successfully generated ${questions.length} questions`);
            return questions;
        }
        catch (error) {
            this.logToFile(`❌ generateQuestions failed: ${error.message}`);
            this.logToFile('⚠️ Returning fallback questions');
            const fallbackQuestions = [
                "Can you walk me through your most relevant project experience?",
                "How do you approach solving complex technical problems?",
                "Tell me about a time you had to learn a new technology quickly.",
                "How do you handle disagreements with team members?",
                "Where do you see yourself professionally in 2-3 years?"
            ];
            if (hasCustomQuestions) {
                return [...input.customQuestions, ...fallbackQuestions].slice(0, count);
            }
            return fallbackQuestions.slice(0, count);
        }
    }
    async *getStreamResponse(context, history, currentAnswer) {
        const prompt = `You are an AI interviewer for the position: "${context.jobTitle}".

Job Context: ${context.jobDescription}
Candidate Resume: ${context.resumeText}

Interview History:
${history.map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`).join('\n\n')}

Latest Answer from Candidate:
${currentAnswer}

Your Task:
1. Briefly acknowledge their answer (1 sentence)
2. Ask ONE follow-up or next interview question
3. Keep it conversational and professional

Respond naturally as an interviewer would.`;
        this.logToFile('[getStreamResponse] Starting stream...');
        try {
            const model = this.getModel(0.8);
            const result = await model.generateContentStream(prompt);
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                yield chunkText;
            }
            this.logToFile('✅ Stream completed');
        }
        catch (error) {
            this.logToFile(`❌ Stream error: ${error.message}`);
            yield 'Thank you for your answer. Could you tell me more about your experience with this technology?';
        }
    }
    async rateTurn(question, answer) {
        const prompt = `You are a strict technical interviewer evaluating a candidate's response.

Question: ${question}
Answer: ${answer}

Rate this answer on three dimensions (0-100):
- Technical Accuracy: How technically sound and detailed is the answer?
- Communication Clarity: How clear and well-articulated is the response?
- Over-fit/Robotic Score: Detect if the answer is "over-fitted" (reading from a script, overly robotic, or keyword-stuffed without depth). High score (80+) means highly suspicious/robotic.

Flagging:
- Set "aiFlagged" to true if the answer is clearly being read from an external source, contains forbidden content, or demonstrates extreme malpractice (e.g. asking the AI to write code for them when not asked).

Be strict. Vague or incomplete answers should score 40-60.

Return ONLY valid JSON with no markdown:
{"techScore": <number>, "commScore": <number>, "overfitScore": <number>, "aiFlagged": <boolean>, "feedback": "<brief critique>"}`;
        this.logToFile(`[rateTurn] Rating answer for: "${question.substring(0, 50)}..."`);
        try {
            const text = await this.callGemini(prompt, 0.3);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON in response');
            }
            const result = JSON.parse(jsonMatch[0]);
            this.logToFile(`✅ Rated: Tech=${result.techScore}, Comm=${result.commScore}, Overfit=${result.overfitScore}, Flagged=${result.aiFlagged}`);
            return result;
        }
        catch (error) {
            this.logToFile(`❌ rateTurn failed: ${error.message}`);
            return {
                techScore: 50,
                commScore: 50,
                overfitScore: 0,
                aiFlagged: false,
                feedback: 'Unable to rate this response automatically.'
            };
        }
    }
    async evaluateInterview(input) {
        const aiRequirementsText = input.aiSpecificRequirements
            ? `\n\nSPECIFIC REQUIREMENTS TO EVALUATE AGAINST:\n${input.aiSpecificRequirements}\n`
            : '';
        const prompt = `You are an ELITE hiring auditor conducting a CRITICAL evaluation.

Job Details:
- Title: ${input.jobTitle}
- Category: ${input.roleCategory}
- Description: ${input.jobDescription}${aiRequirementsText}

Candidate Resume:
${input.resumeText || 'No resume provided'}

Interview Transcript:
${input.responses.map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`).join('\n\n')}

Evaluation Guidelines:
- Be STRICT. High scores (90+) are RARE and reserved for exceptional candidates.
- Deduct HEAVILY for any "aiFlagged" marks or high "overfitScore" across responses.
- isFit should be true ONLY if overallScore >= 70 and no critical behavioral flags.${input.aiSpecificRequirements ? '\n- Pay special attention to the specific requirements listed above.' : ''}

Return ONLY valid JSON (no markdown):
{
  "overallScore": <0-100>,
  "isFit": <boolean>,
  "reasoning": "<1-2 sentence critical summary>",
  "behavioralNote": "<any concerns about professionalism, attitude, or suspicion of cheating>",
  "metrics": [
    {"name": "Technical Skills", "score": <0-100>, "feedback": "<critique>"},
    {"name": "Communication", "score": <0-100>, "feedback": "<critique>"},
    {"name": "Problem Solving", "score": <0-100>, "feedback": "<critique>"},
    {"name": "Professional Integrity", "score": <0-100>, "feedback": "<critique on over-fit/behavior>"}
  ]
}`;
        this.logToFile(`[evaluateInterview] Evaluating ${input.responses.length} responses for: ${input.jobTitle}`);
        try {
            const text = await this.callGemini(prompt, 0.2);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON in response');
            }
            const result = JSON.parse(jsonMatch[0]);
            this.logToFile(`✅ Evaluation complete: Score=${result.overallScore}, Fit=${result.isFit}`);
            return result;
        }
        catch (error) {
            this.logToFile(`❌ evaluateInterview failed: ${error.message}`);
            return {
                overallScore: 0,
                isFit: false,
                reasoning: 'Evaluation failed due to technical error. Manual review required.',
                behavioralNote: 'Unable to assess automatically',
                metrics: [
                    { name: 'Technical Skills', score: 0, feedback: 'Evaluation pending' },
                    { name: 'Communication', score: 0, feedback: 'Evaluation pending' },
                    { name: 'Problem Solving', score: 0, feedback: 'Evaluation pending' },
                    { name: 'Experience Match', score: 0, feedback: 'Evaluation pending' },
                ],
            };
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map