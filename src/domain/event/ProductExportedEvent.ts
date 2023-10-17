import Size from "@domain/model/Size";
import { EventType, MakeEvent } from "./Event";

type ProductExportedEvent = MakeEvent<EventType.ProductExported, {
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
}>;

export default ProductExportedEvent;
