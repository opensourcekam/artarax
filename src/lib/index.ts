import uuid from 'uuid';
import { Blockcain } from './blockchain';

const nodeAddress = uuid().split('-').join('');

const artarax = new Blockcain();

export { artarax, nodeAddress };
