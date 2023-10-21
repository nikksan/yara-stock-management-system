import GetHistoricImportsAndExportsQuery, { Input } from '@application/query/GetHistoricImportsAndExportsQuery';
import AuditLog from '@domain/audit-log/AuditLog';
import Event from '@domain/event/Event';
import EventEmitter from '@domain/event/EventEmitter';
import { Logger } from '@infrastructure/logger/Logger';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';

export default class EventController {
  private logger: Logger;

  constructor(
    private getHistoricImportsAndExportsQuery: GetHistoricImportsAndExportsQuery,
    private auditLog: AuditLog,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);

    EventEmitter.subscribe(this.handleDomainEvent);
  }

  async getHistoricImportsAndExports(input: Input): Promise<Array<Event>> {
    return this.getHistoricImportsAndExportsQuery.run(input);
  }

  handleDomainEvent = async (event: Event): Promise<void> => {
    try {
      await this.auditLog.append(event);
      this.logger.debug(`Appended ${event.id} [${event.type}] in the audit log.`);
    } catch (err) {
      this.logger.debug(`Failed to append ${event.id} [${event.type}] in the audit log!`);
      this.logger.warn(err);
    }
  };
}
