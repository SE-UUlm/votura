import type { NextFunction, Request, Response } from 'express';

export enum MimeType {
  ApplicationJson = 'application/json',
}

export const acceptHeaderCheck =
  (mimeType = MimeType.ApplicationJson) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.accepts(mimeType)) {
      res.sendStatus(406);
      return;
    }

    next();
  };
