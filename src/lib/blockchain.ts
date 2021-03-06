import shaJs from 'sha.js';
import uuid from 'uuid';
// tslint:disable

export interface IBlock {
	hash: string;
	index: number;
	nonce: number;
	previousHash: string;
	timestamp: Date;
	transactions: any[];
}
export interface ITransaction {
	amount: number;
	reciepient: string;
	sender: string;
	id: string;
}
export interface ITransactionInput {
	amount: number;
	reciepient: string;
	sender: string;
}

export interface IHashTransactionInput {
	pendingTransactions: ITransaction[];
	index: number;
}

class Blockchain {
	public chain: IBlock[];
	public pendingTransactions: ITransaction[];
	public networkNodes: string[];
	public readonly nodeUrl: string;
	public readonly nodeAddress: string;
	constructor({ nodeUrl, nodeAddress }) {
		this.chain = [];
		this.pendingTransactions = [];
		this.networkNodes = [];
		this.nodeUrl = nodeUrl;
		this.nodeAddress = nodeAddress;

		// genisis block
		this.createNewBlock(100, '0', '0');
	}

	public _resetPendingTransactions(): void {
		this.pendingTransactions = [];
	}

	public createNewBlock(nonce: number, hash: string, previousHash: string): IBlock {
		const block: IBlock = {
			hash,
			index: this.chain.length + 1,
			nonce,
			previousHash,
			timestamp: new Date(),
			transactions: this.pendingTransactions
		};

		this.pendingTransactions = [];
		this.chain.push(block);

		return block;
	}

	public get lastBlock(): IBlock {
		return this.chain[this.chain.length - 1];
	}

	public newTransaction(transaction: ITransactionInput): ITransaction {
		return {
			amount: transaction.amount,
			sender: transaction.sender,
			reciepient: transaction.reciepient,
			id: uuid().split('-').join('')
		};
	}

	public addTransactionToPendingTransactions(transaction: ITransaction): number {
		this.pendingTransactions.push(transaction);
		return this.lastBlock.index + 1;
	}

	public hashBlock(
		previousBlockHash: string,
		currentTransactions: IHashTransactionInput,
		nounce: IBlock['nonce']
	): string {
		const dataString = `
    PH-${previousBlockHash}
    PN-${nounce.toString()}
    PB-${JSON.stringify(currentTransactions)}
    `;

		return shaJs('sha256').update(dataString).digest('hex');
	}

	public proofOfWork(
		previousBlockHash: string,
		currentTransactions: {
			pendingTransactions: ITransaction[];
			index: number;
		}
	): IBlock['nonce'] {
		let nonce = 0;
		let hash = this.hashBlock(previousBlockHash, currentTransactions, nonce);
		while (hash.substr(0, 4) !== '0000') {
			nonce++;
			hash = this.hashBlock(previousBlockHash, currentTransactions, nonce);
		}

		return nonce;
	}

	public chainIsValid(blockchain: Blockchain['chain']): boolean {
		const genisisBlock = blockchain[0];
		const correctNonce = genisisBlock.nonce === 100;
		const correctPreviousHash = genisisBlock.previousHash === '0';
		const correctHash = genisisBlock.hash === '0';
		const correctTransactions = genisisBlock.transactions.length === 0;

		if (!correctNonce || !correctPreviousHash || !correctHash || !correctTransactions) {
			return false;
		}

		for (let i = 1; i < blockchain.length; i++) {
			const currentBlock = blockchain[i];
			const previousBlock = blockchain[i - 1];
			const blockHash = this.hashBlock(
				previousBlock.hash,
				{ pendingTransactions: currentBlock.transactions, index: currentBlock.index },
				currentBlock.nonce
			);

			if (blockHash.substr(0, 4) !== '0000') {
				return false;
			}

			if (currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}

		return true;
	}
}

export { Blockchain };
