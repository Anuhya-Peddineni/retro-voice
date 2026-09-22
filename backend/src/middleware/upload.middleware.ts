import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Store files in memory for now
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2_097_152, // 2MB
    files: 10,
  },
});

export function uploadFilesMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.array('files')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File too large. Maximum size is 2MB.',
          },
        });
        return;
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Too many files. Maximum 10 files per upload.',
          },
        });
        return;
      }
    }
    if (err) {
      res.status(400).json({
        error: {
          code: 'UPLOAD_ERROR',
          message: err.message,
        },
      });
      return;
    }
    next();
  });
}


