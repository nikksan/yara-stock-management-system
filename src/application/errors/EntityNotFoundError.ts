import { Id } from "@domain/model/Entity";

export default class EntityNotFoundError extends Error {
  constructor(public entityType: string, public id: Id) {
    super(`Failed to find entity ${entityType} #${id}`);
  }
}
