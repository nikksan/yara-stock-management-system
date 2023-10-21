import AuditLog, { SearchParams } from '@domain/audit-log/AuditLog';
import Event from '@domain/event/Event';
import { cloneDeep, isEqual, merge } from 'lodash';

export default class InMemoryAuditLog implements AuditLog {
  private events: Array<Event> = [];

  async append(event: Event): Promise<void> {
    this.events.push(cloneDeep(event));
  }

  async search(params: SearchParams): Promise<Event[]> {
    const events: Array<Event> = [];
    for (const event of this.events) {
      if (this.doesEventMatchSearch(event, params)) {
        events.push(cloneDeep(event));
      }
    }

    return events;
  }

  async deleteAll(): Promise<void> {
    this.events = [];
  }

  private doesEventMatchSearch(event: Event, params: SearchParams) {
    if (!params.types.includes(event.type)) {
      return false;
    }

    if (params.createdAt !== undefined && !this.dateIsInRange(event.createdAt, params.createdAt)) {
      return false;
    }

    if (params.data !== undefined && !this.doesObjContainAnotherObj(event.data, params.data)) {
      return false;
    }

    return true;
  }

  private dateIsInRange(date: Date, range: [Date, Date]) {
    return (
      date.getTime() >= range[0].getTime() &&
      date.getTime() <= range[1].getTime()
    );
  }

  private doesObjContainAnotherObj(parentObj: Record<string, unknown>, childObj: Record<string, unknown>) {
    return isEqual(merge(cloneDeep(parentObj), childObj), parentObj);
  }
}
