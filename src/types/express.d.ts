import { Blockchain } from '../lib/blockchain';
import { Request, Response } from 'express';

export interface Request extends Request {
	artarax: Blockchain;
}
export interface Response extends Response {}
