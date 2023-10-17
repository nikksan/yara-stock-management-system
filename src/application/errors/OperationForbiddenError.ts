export default class OperationForbiddenError extends Error {
  constructor(message: string) {
    super(`Operation forbidden - ${message}`);
  }
}
