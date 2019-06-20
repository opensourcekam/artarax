// lib/app.ts
import uuid from 'uuid';

import * as bodyParser from 'body-parser';
import express, { NextFunction, Response } from 'express';
import { Blockchain } from '../lib/blockchain';
import { Routes } from '../routes';
import { Request } from '../types/express';
import { getCurrentUrl } from '../utils/getCurrentUrl';

class App {
	public readonly express: express.Application;
	public readonly routePrv: Routes = new Routes();
	// tslint:disable-next-line: readonly-keyword
	public artarax: Blockchain | null = null;
	constructor() {
		this.express = express();
		this.config();
	}

	private config(): void {
		this.express.use((req: Request, _res: Response, next: NextFunction) => {
			const nodeUrl = getCurrentUrl(req);

			if (this.artarax === null) {
				// tslint:disable-next-line: no-object-mutation
				this.artarax = new Blockchain({
					nodeAddress: uuid().split('-').join(''),
					nodeUrl
				});
			} else {
				// tslint:disable-next-line: no-object-mutation
				req.artarax = this.artarax;
			}
			next();
		});
		// support application/json type post data
		this.express.use(bodyParser.json());
		// support application/x-www-form-urlencoded post data
		this.express.use(bodyParser.urlencoded({ extended: false }));
		this.routePrv.routes(this);
	}
}

export default new App();
