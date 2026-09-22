/**
 * Prompt for Gemini to analyze sprint transcripts and generate retrospective insights.
 * Uses native structured output with schema enforcement.
 */

export const retrospectiveSystemPrompt = `You are an expert agile retrospective facilitator. Your role is to analyze sprint discussion transcripts and extract team-level retrospective insights.

You MUST follow these rules:

DO:
- Identify repeated team-level patterns and observations
- Combine similar observations into themes
- Remove personal attribution (no names or individual blame)
- Preserve the underlying issue or success
- Use only information present in the transcripts
- Provide an evidence count for each insight
- Generate concise, actionable insights
- Describe patterns at the team/process level, not individual level
- Keep responses practical and grounded in the transcript data

DO NOT:
- Name individual team members
- Attribute problems to individuals
- Assign blame to specific people
- Create action items (that's for humans to decide)
- Assign sprint champions
- Invent observations that aren't supported by the transcripts
- Reveal who made an observation
- Make assumptions beyond what's in the transcripts

Your output must be valid JSON matching the exact structure provided.`;

export const retrospectiveUserPromptTemplate = (transcriptContent: string): string => {
  return `Please analyze the following sprint transcripts and generate a retrospective analysis.

TRANSCRIPTS:
${transcriptContent}

Extract insights for:
1. What Went Well - positive team dynamics, successful processes, or achieved goals
2. What Didn't Go Well - challenges, blockers, process issues, or missed opportunities

For each insight, provide:
- A clear title
- A concise description
- The evidence count (how many times this pattern appeared in the transcripts)
- Anonymized evidence snippets (if relevant) that support the insight

Remember: Remove all personal attribution. Focus on patterns, not people.`;
};

export interface RetroAnalysisSchema {
  wentWell: Array<{
    title: string;
    description: string;
    evidenceCount: number;
    evidence?: string[];
  }>;
  didntGoWell: Array<{
    title: string;
    description: string;
    evidenceCount: number;
    evidence?: string[];
  }>;
}

export const retroAnalysisJsonSchema = {
  type: 'object' as const,
  properties: {
    wentWell: {
      type: 'array',
      description: 'Positive team observations and successes',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Concise title of the insight',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the observation',
          },
          evidenceCount: {
            type: 'integer',
            description: 'Number of times this pattern appeared',
          },
          evidence: {
            type: 'array',
            items: { type: 'string' },
            description: 'Anonymized supporting quotes or paraphrases',
          },
        },
        required: ['title', 'description', 'evidenceCount'],
      },
    },
    didntGoWell: {
      type: 'array',
      description: 'Challenges and areas for improvement',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Concise title of the challenge',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the challenge',
          },
          evidenceCount: {
            type: 'integer',
            description: 'Number of times this pattern appeared',
          },
          evidence: {
            type: 'array',
            items: { type: 'string' },
            description: 'Anonymized supporting quotes or paraphrases',
          },
        },
        required: ['title', 'description', 'evidenceCount'],
      },
    },
  },
  required: ['wentWell', 'didntGoWell'],
};

