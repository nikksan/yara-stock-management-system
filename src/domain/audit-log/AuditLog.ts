import { EventType } from "@domain/event/Event";

type SearchParams = {
  types: Array<EventType>,
  data?: Record<string, unknown>,
  date?: Date,
}

interface AuditLog {
  append(event: Event): Promise<void>;
  search(params: SearchParams): Promise<Array<Event>>
}

export default AuditLog;
