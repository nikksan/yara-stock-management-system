import { inspect } from 'util';

export default class TypeValidationError extends Error {
  constructor(
    public path: string,
    public value: unknown,
    public expectedType: string
  ) {
    super(`Expected ${expectedType} for path ${path}, got ${inspect(value)} instead!`);
  }
}
