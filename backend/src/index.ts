import { createApp } from './app';
import { loadEnv } from './config/env';

const env = loadEnv();
const app = createApp({
  FRONTEND_ORIGIN: env.FRONTEND_ORIGIN,
  GEMINI_MODEL: env.GEMINI_MODEL,
  GOOGLE_CLOUD_PROJECT: env.GOOGLE_CLOUD_PROJECT,
  GCS_BUCKET_NAME: env.GCS_BUCKET_NAME,
  GOOGLE_GENAI_LOCATION: env.GOOGLE_GENAI_LOCATION,
});

const server = app.listen(env.PORT, () => {
  console.log(`RetroVoice backend listening on port ${env.PORT}`);
});

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down backend...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

