import Size from '@domain/model/Size';
import { EventType, MakeEvent } from './Event';

type ProductImportedEvent = MakeEvent<EventType.ProductImported, {
  product: {
    id: string,
    name: string,
    size: Size,
    isHazardous: boolean,
  },
  warehouse: {
    id: string,
    name: string,
  },
  quantity: number,
  importedAt: Date,
}>;

export default ProductImportedEvent;
