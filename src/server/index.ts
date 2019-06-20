// lib/server.ts
import rp from 'request-promise';
import '../lib/env';
import app from './app';
const { PORT = 3000 } = process.env;

app.express.listen(PORT, () => {
	// tslint:disable: no-console
	console.log(`Server is running http://localhost:${PORT}`);
	// ping to initalize
	rp({
		json: true,
		method: 'GET',
		uri: `http://localhost:${PORT}`
	});
});
