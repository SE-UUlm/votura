import type { NextFunction, Request, Response } from 'express';
import { MimeType } from './utils.js';

export const acceptBodyCheck =
  (mimeType = MimeType.ApplicationJson) =>
  (req: Request, res: Response, next: NextFunction) => {
    const bodyMimeType = req.get('content-type');

    if (bodyMimeType !== mimeType) {
      res.sendStatus(415);
      return;
    }

    next();
  };
