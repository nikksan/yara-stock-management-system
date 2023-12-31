import Size from '../Size';
import TypeValidationError from './TypeValidationError';

export default class TypeValidator {
  static validateSize(size: Size): void {
    if (size.width <= 0 || !isFinite(size.width)) {
      throw new TypeValidationError('size.width', size.width, 'valid dimension');
    }

    if (size.height <= 0 || !isFinite(size.height)) {
      throw new TypeValidationError('size.height', size.height, 'valid dimension');
    }

    if (size.length <= 0 || !isFinite(size.height)) { // todo: tests for isFinite
      throw new TypeValidationError('size.length', size.length, 'valid dimension');
    }
  }

  static validateName(name: string): void {
    if (name.trim().length === 0 || name.length > 64) { // todo: tests for max length
      throw new TypeValidationError('name', name, 'non-empty string up to 64 chars');
    }
  }

  static validateQuantity(quantity: number): void {
    if (quantity <= 0 || !isFinite(quantity) || (quantity % 1 !== 0)) {
      throw new TypeValidationError('quantity', quantity, 'positive finite integer');
    }
  }

  static validateDate(date: Date): void {
    if (date.toString() === 'Invalid Date') {
      throw new TypeValidationError('date', date, 'valid date');
    }
  }
}
