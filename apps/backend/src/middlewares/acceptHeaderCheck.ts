import { response406Object } from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from './../httpStatusCode.js';
import { MimeType } from './utils.js';

export const acceptHeaderCheck =
  (mimeType = MimeType.applicationJson) =>
    (req: Request, res: Response, next: NextFunction): void => {
      const acceptsMimeType = req.accepts(mimeType) === mimeType;

      if (!acceptsMimeType) {
        res.status(HttpStatusCode.notAcceptable).json(response406Object.parse({}));
        return;
      }

      next();
    };
