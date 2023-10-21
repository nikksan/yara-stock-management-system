import { DeepPartial } from 'ts-essentials';
import { merge } from 'lodash';
import IdGenerator from '@domain/model/IdGenerator';
import ProductImportedEvent from '@domain/event/ProductImportedEvent';
import { EventType } from '@domain/event/Event';
import ProductExportedEvent from '@domain/event/ProductExportedEvent';

export default class EventFactory {
  createProductImportedEvent(override: DeepPartial<ProductImportedEvent> = {}): ProductImportedEvent {
    const defaults: ProductImportedEvent = {
      id: IdGenerator.generate(),
      type: EventType.ProductImported,
      data: {
        importedAt: new Date(),
        product: {
          id: IdGenerator.generate(),
          name: 'Test product',
          isHazardous: true,
          size: { width: 1, height: 1, length: 1 },
        },
        warehouse: {
          id: IdGenerator.generate(),
          name: 'Test warehouse',
        },
        quantity: 1,
      },
      createdAt: new Date(),
    };

    return merge(defaults, override);
  }

  createProductExportedEvent(override: DeepPartial<ProductExportedEvent> = {}): ProductExportedEvent {
    const defaults: ProductExportedEvent = {
      id: IdGenerator.generate(),
      type: EventType.ProductExported,
      data: {
        product: {
          id: IdGenerator.generate(),
          name: 'Test product',
          isHazardous: true,
          size: { width: 1, height: 1, length: 1 },
        },
        warehouse: {
          id: IdGenerator.generate(),
          name: 'Test warehouse',
        },
        quantity: 1,
      },
      createdAt: new Date(),
    };

    return merge(defaults, override);
  }
}
