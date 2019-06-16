import shaJs from 'sha.js';

// tslint:disable

export interface Block {
	hash: string;
	index: number;
	nonce: number;
	previousHash: string;
	timestamp: Date;
	transactions: any[];
}
export interface Transaction {
	amount: number;
	reciepient: string;
	sender: string;
}

class Blockcain {
	public chain: Block[];
	public pendingTransactions: Transaction[];
	constructor() {
		this.chain = [];
		this.pendingTransactions = [];
		// genisis block
		this.createNewBlock(100, '0', '0');
	}

	public createNewBlock(nonce: number, hash: string, previousHash: string): Block {
		const block: Block = {
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

	public get lastBlock(): Block {
		return this.chain[this.chain.length - 1];
	}

	public newTransaction(transaction: Transaction): number {
		this.pendingTransactions.push(transaction);

		return this.lastBlock.index + 1;
	}

	public hashBlock(
		previousBlockHash: string,
		currentTransactions: {
			pendingTransactions: Transaction[];
			index: number;
		},
		nounce: Block['nonce']
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
			pendingTransactions: Transaction[];
			index: number;
		}
	): Block['nonce'] {
		let nonce = 0;
		let hash = this.hashBlock(previousBlockHash, currentTransactions, nonce);
		while (hash.substr(0, 4) !== '0000') {
			nonce++;
			hash = this.hashBlock(previousBlockHash, currentTransactions, nonce);
		}

		return nonce;
	}
}

export { Blockcain };
