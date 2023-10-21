import ProductExportedEvent from './ProductExportedEvent';
import ProductImportedEvent from './ProductImportedEvent';

export enum EventType {
  ProductImported = 'product_imported',
  ProductExported = 'product_exported',
}

export type MakeEvent<ET extends EventType, Data> = {
  id: string,
  type: ET,
  data: Data,
  createdAt: Date,
}

type Event = (
  ProductImportedEvent |
  ProductExportedEvent
);

export type EventTypeToEventData = {
  [EventType.ProductImported]: ProductImportedEvent['data'],
  [EventType.ProductExported]: ProductExportedEvent['data'],
};

export default Event;
