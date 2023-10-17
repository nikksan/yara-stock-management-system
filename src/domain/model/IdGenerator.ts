import { randomBytes } from 'node:crypto';
import { Id } from './Entity';

export default class IdGenerator {
  static generate(): Id {
    const parts: Array<string> = [];
    for (const size of [8, 4, 4, 4, 12]) {
      parts.push(randomBytes(size).toString('hex'));
    }

    return parts.join('-');
  }
}
