import ProductExportedEvent from "@domain/event/ProductExportedEvent";
import ProductImportedEvent from "@domain/event/ProductImportedEvent";
import { Id } from "@domain/model/Entity";

type Criteria = {
  date?: Date,
  warehouseIds?: Id,
}

export default class GetHistoricImportsAndExportsQuery {
  constructor() { }

  async run(criteria: Criteria): Promise<Array<ProductImportedEvent | ProductExportedEvent>> {
    return [];
  }
}
