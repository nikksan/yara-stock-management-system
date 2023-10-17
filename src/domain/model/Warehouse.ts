import { EventType } from '@domain/event/Event';
import Entity, { ConstructorParams as EntityConstructorParams, Id } from './Entity';
import Product from './Product';
import Size from './Size';
import TypeValidator from './validation/TypeValidator';
import EventEmitter from '@domain/event/EventEmitter';
import NotEnoughSpaceInWarehouseError from '@domain/errors/NotEnoughSpaceInWarehouseError';
import CantMixProductsError from '@domain/errors/CantMixProductsError';
import ProductNotStockedError from '@domain/errors/ProductNotStockedError';
import NotEnoughQuantityError from '@domain/errors/NotEnoughQuantityError';
import assert from 'assert';

export type ConstructorParams = EntityConstructorParams & {
  name: string,
  size: Size,
  inventory: Inventory,
}

export type Inventory = Array<{
  product: {
    id: Id,
    size: Size,
    isHazardous: boolean,
  },
  quantity: number,
  importedAt: Date,
}>;

export default class Warehouse extends Entity {
  private name: string;
  private size: Size;
  private inventory: Inventory;

  constructor(params: ConstructorParams) {
    super(params);

    TypeValidator.validateName(params.name);
    this.name = params.name;

    TypeValidator.validateSize(params.size);
    this.size = params.size;

    this.inventory = params.inventory;
  }

  import(product: Product, quantity: number, date: Date): void {
    TypeValidator.validateQuantity(quantity);
    TypeValidator.validateDate(date);

    this.makeSureThereIsEnoughSpaceFor(product, quantity);
    this.makeSureProductsAreNotMixed(product);

    this.increaseInventory(product, quantity, date);
    this.emitImportEvent(product, quantity, date);
  }

  export(product: Product, quantity: number): void {
    TypeValidator.validateQuantity(quantity);

    this.makeSureProductIsStocked(product, quantity);

    this.decreaseInventory(product, quantity);
    this.emitExportEvent(product, quantity);
  }

  getInventory(): Inventory {
    return this.inventory;
  }

  getName(): string {
    return this.name;
  }

  private increaseInventory(product: Product, quantity: number, date: Date) {
    this.inventory.push({
      product: {
        id: product.id,
        isHazardous: product.getIsHazardous(),
        size: product.getSize(),
      },
      quantity,
      importedAt: date,
    });
  }

  private emitImportEvent(product: Product, quantity: number, date: Date) {
    EventEmitter.emit(EventType.ProductImported, {
      importedAt: date,
      product: {
        id: product.id,
        name: product.getName(),
        isHazardous: product.getIsHazardous(),
        size: product.getSize(),
      },
      warehouse: {
        id: this.id,
        name: this.name,
      },
      quantity,
    });
  }

  private emitExportEvent(product: Product, quantity: number) {
    EventEmitter.emit(EventType.ProductExported, {
      product: {
        id: product.id,
        name: product.getName(),
        isHazardous: product.getIsHazardous(),
        size: product.getSize(),
      },
      warehouse: {
        id: this.id,
        name: this.name,
      },
      quantity,
    });
  }

  private makeSureThereIsEnoughSpaceFor(product: Product, quantity: number) {
    const usedUpSpace = this.getTotalUsedUpSpace();
    const totalCapacity = this.getTotalCapacity();
    const spaceTheProductWillNeed = this.calculateTotalSpaceBySize(product.getSize()) * quantity;

    if (usedUpSpace + spaceTheProductWillNeed > totalCapacity) {
      throw new NotEnoughSpaceInWarehouseError(this.id);
    }
  }

  private makeSureProductsAreNotMixed(product: Product) {
    const stockedProduct = this.inventory.length ? this.inventory[0].product : null;
    if (!stockedProduct) {
      return;
    }

    if (stockedProduct.isHazardous !== product.getIsHazardous()) {
      throw new CantMixProductsError();
    }
  }

  private getTotalUsedUpSpace() {
    return this.inventory.reduce((space, item) => {
      space += item.quantity * this.calculateTotalSpaceBySize(item.product.size);
      return space;
    }, 0);
  }

  private getTotalCapacity() {
    return this.calculateTotalSpaceBySize(this.size);
  }

  private calculateTotalSpaceBySize(size: Size) {
    return size.height * size.width * size.length;
  }

  private makeSureProductIsStocked(product: Product, quantity: number) {
    const availableQuantity = this.countProductStock(product);
    if (availableQuantity === 0) {
      throw new ProductNotStockedError(product.id);
    }

    if (availableQuantity < quantity) {
      throw new NotEnoughQuantityError(product.id, this.id, quantity, availableQuantity);
    }
  }

  private countProductStock(product: Product) {
    const now = new Date();
    return this.inventory.reduce((total, item) => {
      if (item.product.id === product.id && item.importedAt.getTime() <= now.getTime()) {
        total += item.quantity;
      }

      return total;
    }, 0);
  }

  private decreaseInventory(product: Product, quantity: number) {
    const now = new Date();
    const itemsToSubtractFrom = this.inventory
      .filter(item => item.product.id === product.id && item.importedAt.getTime() <= now.getTime())
      .sort((item1, item2) => item1.importedAt.getTime() - item2.importedAt.getTime()); // FIFO

    let remainingQuantityToSubtract = quantity;
    for (const item of itemsToSubtractFrom) {
      if (item.quantity > remainingQuantityToSubtract) {
        item.quantity -= remainingQuantityToSubtract;
        remainingQuantityToSubtract = 0;
        break;
      }

      if (item.quantity === remainingQuantityToSubtract) {
        this.inventory.splice(this.inventory.indexOf(item), 1);
        remainingQuantityToSubtract = 0;
        break;
      }

      remainingQuantityToSubtract -= item.quantity;
      this.inventory.splice(this.inventory.indexOf(item), 1);
    }

    assert(!remainingQuantityToSubtract);
  }
}
