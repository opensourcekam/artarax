import { Request, Response } from 'express';
const getCurrentUrl = (req: Request, _: Response): string => `${req.protocol}://${req.get('host')}${req.originalUrl}`;

export { getCurrentUrl };
