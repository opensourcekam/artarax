import { Request, Response } from 'express';
const getCurrentUrl = (req: Request, _: Response): string => req.url;

export { getCurrentUrl };
