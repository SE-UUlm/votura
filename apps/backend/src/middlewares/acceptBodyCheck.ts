import { response415Object } from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from './../httpStatusCode.js';
import { MimeType } from './utils.js';

export const acceptBodyCheck =
  (mimeType = MimeType.applicationJson) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const bodyMimeType = req.get('content-type');

    if (bodyMimeType !== mimeType) {
      res.status(HttpStatusCode.unsupportedMediaType).json(response415Object.parse({}));
      return;
    }

    next();
  };
