// tslint:disable:no-expression-statement
// tslint:disable: readonly-array

import test from 'ava';
import { Blockcain, Transaction } from '../lib/blockchain';

test('Blockcain - create instance of Blockchain', async t => {
  const cardano = new Blockcain();
  t.true(cardano instanceof Blockcain);
});

test('Blockcain - createNewBlock', async t => {
  const bitcoin = new Blockcain();
  bitcoin.createNewBlock(21349, 'OASP301LAJ', 'A9AOQNFQBND');
  t.deepEqual(bitcoin.chain, [
    {
      hash: 'OASP301LAJ',
      index: 1,
      nonce: 21349,
      previousHash: 'A9AOQNFQBND',
      timestamp: new Date(),
      transactions: []
    }
  ]);
});

test('Blockcain - create multiple blocks', async t => {
  const litecoin = new Blockcain();
  litecoin.createNewBlock(21349, 'OASP301LAJ', '');
  litecoin.createNewBlock(53201, 'KJA012APA0', 'OASP301LAJ');
  litecoin.createNewBlock(32101, 'AIO109AO10', 'KJA012APA0');
  t.deepEqual(litecoin.chain, [
    {
      hash: 'OASP301LAJ',
      index: 1,
      nonce: 21349,
      previousHash: '',
      timestamp: new Date(),
      transactions: []
    },
    {
      hash: 'KJA012APA0',
      index: 2,
      nonce: 53201,
      previousHash: 'OASP301LAJ',
      timestamp: new Date(),
      transactions: []
    },
    {
      hash: 'AIO109AO10',
      index: 3,
      nonce: 32101,
      previousHash: 'KJA012APA0',
      timestamp: new Date(),
      transactions: []
    }
  ]);
});

test('Blockcain - get last block from chain', async t => {
  const litecoin = new Blockcain();
  litecoin.createNewBlock(21349, 'OASP301LAJ', '');
  litecoin.createNewBlock(53201, 'KJA012APA0', 'OASP301LAJ');
  const { lastBlock } = litecoin;

  t.deepEqual(lastBlock, {
    hash: 'KJA012APA0',
    index: 2,
    nonce: 53201,
    previousHash: 'OASP301LAJ',
    timestamp: new Date(),
    transactions: []
  });
});

test('Blockcain - new transaction', async t => {
  const dogecoin = new Blockcain();
  dogecoin.createNewBlock(6910, 'DOGEAA991', '');
  const blockIndex = dogecoin.newTransaction({
    amount: 100,
    reciepient: 'FJAIQP2340AOMFIVBZKA01',
    sender: 'KJ19AKQUNFAOLQ01AKALWABE'
  });

  t.deepEqual(dogecoin.pendingTransactions, [
    {
      amount: 100,
      reciepient: 'FJAIQP2340AOMFIVBZKA01',
      sender: 'KJ19AKQUNFAOLQ01AKALWABE'
    }
  ]);
  t.deepEqual(blockIndex, 2);

  // CREATE A NEW BLOCK AND CHECK IF TRANSACTIONS ARE APPENEDED
  dogecoin.createNewBlock(94142, 'RQOSI0', 'DOGEAA991');
  const { lastBlock } = dogecoin;
  t.deepEqual(lastBlock.transactions, [
    {
      amount: 100,
      reciepient: 'FJAIQP2340AOMFIVBZKA01',
      sender: 'KJ19AKQUNFAOLQ01AKALWABE'
    }
  ]);
});

test('Blockcain - hash block', async t => {
  const dogecoin = new Blockcain();
  dogecoin.createNewBlock(6910, 'DOGEAA991', '');

  const previousHash = '8DJFU183AHAJFI23149i9AIJWA12034';
  const nonce = 239158;
  const transactions = [
    {
      amount: 100,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    },
    {
      amount: 500,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    },
    {
      amount: 10,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    }
  ] as Transaction[];

  const transactionCopy = [...transactions] as Transaction[];

  const transactions2 = [
    {
      amount: 150,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    },
    {
      amount: 500,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    },
    {
      amount: 10,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    }
  ] as Transaction[];

  const hash = dogecoin.hashBlock(previousHash, transactions, nonce);
  const hashCopy = dogecoin.hashBlock(previousHash, transactionCopy, nonce);
  const hash2 = dogecoin.hashBlock(previousHash, transactions2, nonce);

  t.true(hash === hashCopy);
  t.true(hash !== hash2);
});

test('Blockcain - proof of work', async t => {
  const cardano = new Blockcain();
  const previousHash = '8DJFU183AHAJFI23149i9AIJWA12034';
  const transactions = [
    {
      amount: 100,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    },
    {
      amount: 500,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    },
    {
      amount: 10,
      reciepient: 'PPOOMMMAA0000',
      sender: 'AKF19493240'
    }
  ] as Transaction[];

  const nonce = cardano.proofOfWork(previousHash, transactions);
  const hash = cardano.hashBlock(previousHash, transactions, nonce);
  t.deepEqual(
    hash,
    '0000ffb3437f308c7214a1f8930df578e427c45445cc704893be1541ba5598a5'
  );
  t.deepEqual(nonce, 33489);
});

test('Blockcain - has genisis block', async t => {
  const cardano = new Blockcain();

  t.true(cardano.chain.length === 1);
});
