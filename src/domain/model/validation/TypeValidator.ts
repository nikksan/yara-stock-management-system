import Size from "../Size";
import TypeValidationError from "./TypeValidationError";

export default class TypeValidator {
  static validateSize(size: Size) {
    if (size.width <= 0) {
      throw new TypeValidationError('size.width', size.width, 'valid dimension');
    }

    if (size.height <= 0) {
      throw new TypeValidationError('size.height', size.height, 'valid dimension');
    }

    if (size.length <= 0) {
      throw new TypeValidationError('size.length', size.length, 'valid dimension');
    }

    // todo: check for max safe integer
  }

  static validateName(name: string) {
    if (name.trim().length === 0) {
      throw new TypeValidationError('name', name, 'non-empty string');
    }

    // todo: check for length
  }

  static validateQuantity(quantity: number) {
    if (quantity <= 0) {
      throw new TypeValidationError('quantity', quantity, 'positive number');
    }

    // todo: check for max safe integer
  }

  static validateDate(date: Date) {
    if (date.toString() === 'Invalid Date') {
      throw new TypeValidationError('date', date, 'valid date');
    }
  }
}
