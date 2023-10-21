import DateRangeService from '@application/service/DateRangeService';
import AuditLog from '@domain/audit-log/AuditLog';
import Event, { EventType } from '@domain/event/Event';
import { Id } from '@domain/model/Entity';

export type Input = {
  warehouseIds?: Array<Id>,
  date?: Date,
}

export default class GetHistoricImportsAndExportsQuery {
  constructor(
    private auditLog: AuditLog,
  ) { }

  async run(input: Input): Promise<Array<Event>> {
    const types = [
      EventType.ProductImported,
      EventType.ProductExported,
    ];

    let createdAt;
    if (input.date !== undefined) {
      createdAt = DateRangeService.makeRangeFromStartAndEndOfDay(input.date);
    }

    if (input.warehouseIds === undefined) {
      return this.auditLog.search({
        types,
        createdAt,
      });
    }

    const events: Array<Event> = [];
    for (const warehouseId of input.warehouseIds) {
      events.push(...await this.auditLog.search({
        types,
        data: { warehouse: { id: warehouseId } },
        createdAt,
      }));
    }

    return events;
  }
}
