import Event, { EventType } from "@domain/event/Event";

export type SearchParams = {
  types: Array<EventType>,
  data?: Record<string, unknown>,
  createdAt?: [Date, Date],
}

interface AuditLog {
  append(event: Event): Promise<void>;
  search(params: SearchParams): Promise<Array<Event>>;
  deleteAll(): Promise<void>;
}

export default AuditLog;
