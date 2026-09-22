import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RetroAnalysisSchema } from '../types/retro';
import {
  retrospectiveSystemPrompt,
  retrospectiveUserPromptTemplate,
} from '../prompts/retrospective.prompt';

export class GeminiService {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-3.5-flash') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateRetroInsights(transcriptContent: string): Promise<RetroAnalysisSchema> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
    });

    const userPrompt = retrospectiveUserPromptTemplate(transcriptContent);

    const result = await model.generateContent([
      retrospectiveSystemPrompt,
      userPrompt,
    ]);

    const responseText = result.response.text();

    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as RetroAnalysisSchema;
      return parsed;
    } catch (err) {
      throw new Error(`Failed to parse Gemini response as JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}



