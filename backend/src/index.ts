import { createApp } from './app';
import { loadEnv } from './config/env';

const env = loadEnv();
const app = createApp(env);

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

