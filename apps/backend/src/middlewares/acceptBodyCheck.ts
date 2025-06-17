import type { NextFunction, Request, Response } from 'express';
import { MimeType } from './utils.js';
import { HttpStatusCode } from './../httpStatusCode.js';
import { response415Object } from '@repo/votura-validators';

export const acceptBodyCheck =
  (mimeType = MimeType.ApplicationJson) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const bodyMimeType = req.get('content-type');

    if (bodyMimeType !== mimeType) {
      res.status(HttpStatusCode.UnsupportedMediaType).json(response415Object.parse({}));
      return;
    }

    next();
  };
