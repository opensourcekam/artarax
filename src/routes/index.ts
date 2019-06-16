import { Application, Request, Response } from 'express';
import { artarax, nodeAddress } from '../lib';

export class Routes {
	public routes(app: Application): void {
		// Blockchain
		app
			.route('/')
			// GET
			.get((_: Request, res: Response) =>
				res.status(200).json({
					artarax,
					nodeAddress
				})
			);

		// Contact
		app
			.route('/transaction')
			// POST endpoint
			.post((req: Request, res: Response) => {
				// Create new contact
				const blockIndex = artarax.newTransaction({ ...req.body });
				res.status(200).json({
					blockIndex
				});
			});

		// Mine
		app
			.route('/mine')
			// GET
			.get((_: Request, res: Response) => {
				const { hash: previousBlockHash, index } = artarax.lastBlock;
				const { pendingTransactions } = artarax;
				const blockData = { index: index + 1, pendingTransactions };
				const nonce = artarax.proofOfWork(previousBlockHash, blockData);
				const blockHash = artarax.hashBlock(previousBlockHash, blockData, nonce);

				// REWARD BLOCK FOR MINING
				artarax.newTransaction({
					amount: 12.5,
					reciepient: nodeAddress,
					sender: '00'
				});

				const block = artarax.createNewBlock(nonce, blockHash, previousBlockHash);

				res.status(200).json(block);
			});
	}
}
