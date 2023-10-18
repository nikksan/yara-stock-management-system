import AuditLog from "@domain/audit-log/AuditLog";
import { EventType } from "@domain/event/Event";
import ProductExportedEvent from "@domain/event/ProductExportedEvent";
import ProductImportedEvent from "@domain/event/ProductImportedEvent";
import { Id } from "@domain/model/Entity";

type Input = {
  warehouseIds?: Array<Id>,
  date?: Date,
}

export default class GetHistoricImportsAndExportsQuery {
  constructor(
    private auditLog: AuditLog,
  ) {}

  async run(input: Input): Promise<Array<ProductImportedEvent | ProductExportedEvent>> {
    // return this.auditLog.search({
    //   types: [EventType.ProductExported, EventType.ProductImported],
    //   date: input.date,
    //   data: {
    //     // warehouseId
    //   }
    // });
  }
}
