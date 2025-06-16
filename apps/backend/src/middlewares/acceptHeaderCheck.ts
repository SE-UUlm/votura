import type { NextFunction, Request, Response } from 'express';
import { MimeType } from './utils.js';

export const acceptHeaderCheck =
  (mimeType = MimeType.ApplicationJson) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const acceptsMimeType = req.accepts(mimeType) === mimeType;

    if (!acceptsMimeType) {
      res.sendStatus(406);
      return;
    }

    next();
  };
