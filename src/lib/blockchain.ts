import shaJs from 'sha.js';

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
}

export interface IHashTransactionInput {
	pendingTransactions: ITransaction[];
	index: number;
}

class Blockchain {
	public chain: IBlock[];
	public pendingTransactions: ITransaction[];
	constructor() {
		this.chain = [];
		this.pendingTransactions = [];
		// genisis block
		this.createNewBlock(100, '0', '0');
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

	public newTransaction(transaction: ITransaction): number {
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
}

export { Blockchain };
