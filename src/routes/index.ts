import rp from 'request-promise';
import { IBlock } from '../lib/blockchain';
import { Request, Response } from '../types/express';

const ENDPOINTS = {
	BASE: '/',
	MINE: '/mine',
	RECIEVE_NEW_BLOCK: '/recieve-new-block',
	REGISTER_AND_BROADCAST_NODE: '/register-and-broadcast-node',
	REGISTER_NODE: '/register-node',
	REGISTER_NODES: '/register-nodes',
	TRANSACTION: '/transaction',
	TRANSACTION_BROADCAST: '/transaction/broadcast'
};
export class Routes {
	public routes(app: any): void {
		app.express
			.route(ENDPOINTS.BASE)
			// GET
			.get((req: Request, res: Response) => {
				const { artarax } = req;
				res.status(200).json({
					artarax
				});
			});

		// TRANSACTION
		app.express
			.route(ENDPOINTS.TRANSACTION)
			// POST
			.post((req: Request, res: Response) => {
				// Create new contact
				const { artarax, body } = req;

				// body is new transaction
				const blockIndex = artarax.addTransactionToPendingTransactions(body);
				res.status(200).json({
					blockIndex,
					data: `Transaction added to block index ${blockIndex}`
				});
			});

		// TRANSACTIONS BROADCAST
		app.express
			.route(ENDPOINTS.TRANSACTION_BROADCAST)
			// POST
			.post((req: Request, res: Response) => {
				const { artarax, body } = req;
				const { amount, reciepient, sender } = body;

				const newTransaction = artarax.newTransaction({ amount, reciepient, sender });
				artarax.addTransactionToPendingTransactions(newTransaction);

				const registerNodesPromises: ReadonlyArray<
					rp.RequestPromise
				> = artarax.networkNodes.map((networkNodeUrl) =>
					rp({
						body: newTransaction,
						json: true,
						method: 'POST',
						uri: `${networkNodeUrl}${ENDPOINTS.TRANSACTION}`
					})
				);

				Promise.all(registerNodesPromises)
					//
					.then(() => res.json({ data: 'Broadcast successful!' }))
					.catch((e) =>
						res.status(403).json({
							data: 'something went wrong',
							error: e
						})
					);
			});

		// RECIEVE NEW BLOCK
		app.express
			.route(ENDPOINTS.RECIEVE_NEW_BLOCK)
			// POST
			.post((req: Request, res: Response) => {
				const { artarax, body } = req;
				const { newBlock }: { readonly newBlock: IBlock } = body;
				const { lastBlock } = artarax;
				const correctHash = lastBlock.hash === newBlock.previousHash;
				const correctIndex = lastBlock.index + 1 === newBlock.index;

				if (correctHash && correctIndex) {
					artarax.chain.push(newBlock);
					artarax._resetPendingTransactions();
					res.status(200).json({
						data: 'Recieve and accepted new block',
						newBlock
					});
				} else {
					res.status(403).json({
						data: 'New block rejected'
					});
				}
			});

		// MINE
		app.express
			.route(ENDPOINTS.MINE)
			// GET
			.get((req: Request, res: Response) => {
				const { artarax } = req;
				const { hash: previousBlockHash, index } = artarax.lastBlock;
				const { pendingTransactions } = artarax;
				const blockData = { index: index + 1, pendingTransactions };
				const nonce = artarax.proofOfWork(previousBlockHash, blockData);
				const blockHash = artarax.hashBlock(previousBlockHash, blockData, nonce);
				const block = artarax.createNewBlock(nonce, blockHash, previousBlockHash);

				const registerNodesPromises: ReadonlyArray<
					rp.RequestPromise
				> = artarax.networkNodes.map((networkNodeUrl) =>
					rp({
						body: { newBlock: block },
						json: true,
						method: 'POST',
						uri: `${networkNodeUrl}${ENDPOINTS.RECIEVE_NEW_BLOCK}`
					})
				);

				Promise.all(registerNodesPromises)
					.then(() =>
						// REWARD BLOCK FOR MINING
						rp({
							body: {
								amount: 12.5,
								reciepient: artarax.nodeAddress,
								sender: '00'
							},
							json: true,
							method: 'POST',
							uri: `${artarax.nodeUrl}${ENDPOINTS.TRANSACTION_BROADCAST}`
						})
					)
					.then(() =>
						res.status(200).json({
							block,
							data: 'New block mined and broadcasted successfully'
						})
					)
					.catch((e) =>
						res.status(403).json({
							data: 'something went wrong',
							error: e
						})
					);
			});

		// BROADCAST TO ALL NODES
		app.express
			.route(ENDPOINTS.REGISTER_AND_BROADCAST_NODE)
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
							uri: `${networkNodeUrl}${ENDPOINTS.REGISTER_NODE}`
						})
					);

				Promise.all(registerNodesPromises)
					.then(() =>
						rp({
							body: { allNetworkNodes: [ ...artarax.networkNodes, artarax.nodeUrl ] },
							json: true,
							method: 'POST',
							uri: `${nodeUrl}${ENDPOINTS.REGISTER_NODES}`
						})
					)
					.then(() => res.json({ data: 'New node registered with network' }));
			});

		// REGISTER
		app.express
			.route(ENDPOINTS.REGISTER_NODE)
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
			.route(ENDPOINTS.REGISTER_NODES)
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
