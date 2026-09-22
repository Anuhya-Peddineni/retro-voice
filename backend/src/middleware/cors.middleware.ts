import cors, { type CorsOptions } from 'cors';

export function createCorsMiddleware(frontendOrigin: string) {
  const allowedOrigins = new Set(
    [frontendOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean),
  );

  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  };

  return cors(corsOptions);
}

