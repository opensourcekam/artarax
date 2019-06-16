// lib/server.ts
import app from './app';
const { PORT = 3000 } = process.env;

app.listen(PORT, () => {
	// tslint:disable: no-console
	console.log(`Server is running http://localhost:${PORT}`);
});
