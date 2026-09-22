import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  GCP_REGION: z.string().default('us-central1'),
  GCS_BUCKET_NAME: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
  GOOGLE_GENAI_LOCATION: z.string().default('us-central1'),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(2_097_152),
  MAX_FILES_PER_UPLOAD: z.coerce.number().int().positive().default(10),
  MAX_ANALYSIS_INPUT_CHARS: z.coerce.number().int().positive().default(200_000),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  return envSchema.parse(process.env);
}

