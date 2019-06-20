import rp from 'request-promise';
import { Request, Response } from '../types/express';

export class Routes {
	public routes(app: any): void {
		app.express
			.route('/')
			// GET
			.get((req: Request, res: Response) => {
				const { artarax } = req;
				res.status(200).json({
					artarax
				});
			});

		// TRANSACTION
		app.express
			.route('/transaction')
			// POST
			.post((req: Request, res: Response) => {
				// Create new contact
				const { artarax } = req;
				const blockIndex = artarax.newTransaction({ ...req.body });
				res.status(200).json({
					blockIndex
				});
			});

		// MINE
		app.express
			.route('/mine')
			// GET
			.get((req: Request, res: Response) => {
				const { artarax } = req;
				const { hash: previousBlockHash, index } = artarax.lastBlock;
				const { pendingTransactions } = artarax;
				const blockData = { index: index + 1, pendingTransactions };
				const nonce = artarax.proofOfWork(previousBlockHash, blockData);
				const blockHash = artarax.hashBlock(previousBlockHash, blockData, nonce);

				// REWARD BLOCK FOR MINING
				artarax.newTransaction({
					amount: 12.5,
					reciepient: artarax.nodeAddress,
					sender: '00'
				});

				const block = artarax.createNewBlock(nonce, blockHash, previousBlockHash);

				res.status(200).json(block);
			});

		// BROADCAST TO ALL NODES
		app.express
			.route('/register-and-broadcast-node')
			// POST
			.post((req: Request, res: Response) => {
				const { artarax, body } = req;
				const { nodeUrl } = body;

				if (artarax.networkNodes.indexOf(nodeUrl) === -1) {
					artarax.networkNodes.push(nodeUrl);
				}
				// tslint:disable-next-line: variable-name
				const registerNodesPromises: ReadonlyArray<rp.RequestPromise> =
					// RETURNS AN ARRAY OF PROMISES
					artarax.networkNodes.map((networkNodeUrl) =>
						rp({
							body: { nodeUrl },
							json: true,
							method: 'POST',
							uri: `${networkNodeUrl}/register-node`
						})
					);

				Promise.all(registerNodesPromises)
					.then(() =>
						rp({
							body: { allNetworkNodes: [ ...artarax.networkNodes, artarax.nodeUrl ] },
							json: true,
							method: 'POST',
							uri: `${nodeUrl}/register-nodes`
						})
					)
					.then(() => res.json({ data: 'New node registered with network' }));
			});

		// REGISTER
		app.express
			.route('/register-node')
			// POST
			.post((req: Request, res: Response) => {
				// tslint:disable-next-line: no-console
				console.log(req.body);
				const { artarax, body } = req;
				const { nodeUrl } = body;
				const nodeNotPresent = artarax.networkNodes.indexOf(nodeUrl) === -1;
				const notCurrentNode = artarax.nodeUrl !== nodeUrl;
				if (nodeNotPresent && notCurrentNode) {
					artarax.networkNodes.push(nodeUrl);
					res.json({ data: `Registered node ${artarax.nodeAddress}` });
				}

				res.json({ data: `Node ${artarax.nodeAddress} already registered` });
			});

		// REGISTER MANY NODES
		app.express
			.route('/register-nodes')
			// POST
			.post((req: Request, res: Response) => {
				const { artarax, body } = req;
				const { allNetworkNodes } = body;
				allNetworkNodes.forEach((nodeUrl: string) => {
					const nodeNotPresent = artarax.networkNodes.indexOf(nodeUrl) === -1;
					const notCurrentNode = artarax.nodeUrl !== nodeUrl;
					console.log(artarax.nodeUrl, nodeUrl);
					if (nodeNotPresent && notCurrentNode) {
						artarax.networkNodes.push(nodeUrl);
					}
				});

				res.json({ data: `Successflly registered nodes!` });
			});
	}
}
