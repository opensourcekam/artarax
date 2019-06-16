// lib/app.ts
import * as bodyParser from 'body-parser';
import express from 'express';
import { Routes } from '../routes';

class App {
	public readonly app: express.Application;
	public readonly routePrv: Routes = new Routes();

	constructor() {
		this.app = express();
		this.config();
		this.routePrv.routes(this.app);
	}

	private config(): void {
		// support application/json type post data
		this.app.use(bodyParser.json());
		// support application/x-www-form-urlencoded post data
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}
}

export default new App().app;
