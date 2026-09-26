import {GoogleGenAI, HarmBlockThreshold, HarmCategory, ThinkingLevel} from '@google/genai';
import type {RetroAnalysisSchema} from '../types/retro';
import {
  retroAnalysisJsonSchema,
  retrospectiveSystemPrompt,
  retrospectiveUserPromptTemplate,
} from '../prompts/retrospective.prompt';

export interface GeminiServiceOptions {
  projectId: string;
  location: string;
  modelName?: string;
}

export class GeminiService {
  private modelName: string;
  private client: GoogleGenAI;

  constructor(options: GeminiServiceOptions) {
    this.client = new GoogleGenAI({
      vertexai: true,
      project: options.projectId,
      location: options.location,
    });
    this.modelName = options.modelName || 'gemini-3.8-flash';
  }

  async generateRetroInsights(transcriptContent: string): Promise<RetroAnalysisSchema> {
    const userPrompt = retrospectiveUserPromptTemplate(transcriptContent);

    const result = await this.client.models.generateContent({
      model: this.modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction: retrospectiveSystemPrompt,
        responseMimeType: 'application/json',
        responseSchema: retroAnalysisJsonSchema,
        temperature: 0.2,
        topP: 0.8,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW, // structured extraction task — keep thinking light for cost/latency
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      },
    });

    const responseText = extractResponseText(result);
    if (!responseText) {
      throw new Error('Empty response returned from Vertex AI');
    }

    try {
      return JSON.parse(responseText) as RetroAnalysisSchema;
    } catch (err) {
      throw new Error(
          `Failed to parse Vertex AI response as JSON: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

function extractResponseText(response: {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  text?: string;
}): string {
  // @google/genai exposes a convenience `.text` accessor; fall back to manual extraction
  if (typeof response.text === 'string' && response.text.length > 0) {
    return response.text.trim();
  }

  const parts = response.candidates?.[0]?.content?.parts || [];
  return parts
      .map((part) => part.text || '')
      .join('')
      .trim();
}