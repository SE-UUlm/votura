import type { NextFunction, Request, Response } from 'express';
import { MimeType } from './utils.js';
import { HttpStatusCode } from './../httpStatusCode.js';
import { response406Object } from '@repo/votura-validators';

export const acceptHeaderCheck =
  (mimeType = MimeType.ApplicationJson) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const acceptsMimeType = req.accepts(mimeType) === mimeType;

    if (!acceptsMimeType) {
      res.status(HttpStatusCode.NotAcceptable).json(response406Object.parse({}));
      return;
    }

    next();
  };
