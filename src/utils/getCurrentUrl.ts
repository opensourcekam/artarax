import { Request } from 'express';
const getCurrentUrl = (req: Request): string =>
	// combines proto, host, and originalURL
	`${req.protocol}://${req.get('host')}`;

export { getCurrentUrl };
