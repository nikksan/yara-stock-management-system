enum ErrorCode {
  TypeValidation = 'TYPE_VALIDATION',
  EntityNotFound = 'ENTITY_NOT_FOUND',
  OperationForbidden = 'OPERATION_FORBIDDEN',
  UniqueConstraint = 'UNIQUE_CONSTRAINT',
  CantMixProducts = 'CANT_MIX_PRODUCTS',
  NotEnoughQuantity = 'NOT_ENOUGH_QUANTITY',
  NotEnoughSpaceInWarehouse = 'NOT_ENOUGH_SPACE_IN_WAREHOUSE',
  ProductNotStocked = 'PRODUCT_NOT_STOCKED',
  General = 'GENERAL',
}

export default ErrorCode;
