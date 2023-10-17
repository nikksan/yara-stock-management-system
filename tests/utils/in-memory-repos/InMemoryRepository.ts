import Entity from '@domain/model/Entity';
import Repository from '@domain/repository/Repository';
import { cloneDeep } from 'lodash';

export default class InMemoryRepository<EntityType extends Entity> implements Repository<EntityType> {
  protected entities: Map<string, EntityType>;

  constructor() {
    this.entities = new Map<string, EntityType>();
  }

  async delete(entity: EntityType): Promise<boolean> {
    const id = entity.id;

    if (this.entities.has(id)) {
      this.entities.delete(id);
      return true;
    }

    return false;
  }

  async findAll(): Promise<Array<EntityType>> {
    return Array.from(this.entities.values());
  }

  async findById(id: string): Promise<EntityType | null> {
    const existingEntity = this.entities.get(id);
    return existingEntity ? cloneDeep(existingEntity) : null;
  }

  async save(entity: EntityType): Promise<void> {
    if (entity.id && this.entities.has(entity.id)) {
      this.updateEntity(entity);
      return;
    }

    this.createEntity(entity);
  }

  async deleteAll(): Promise<void> {
    this.entities.clear();
  }

  protected createEntity(entity: EntityType) {
    const createdEntity = cloneDeep(entity);
    this.entities.set(createdEntity.id, createdEntity);
  }

  protected updateEntity(entity: EntityType) {
    const updatedEntity = cloneDeep(entity);
    this.entities.set(updatedEntity.id, updatedEntity);
  }
}
