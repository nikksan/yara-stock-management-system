import IdGenerator from '@domain/model/IdGenerator';
import Event, { EventType, EventTypeToEventData } from './Event';

type EventCallback = (event: Event) => unknown;

export default class EventEmitter {
  private static callbacks: Array<EventCallback> = [];

  static emit<ET extends EventType>(eventType: ET, data: EventTypeToEventData[ET]): void {
    const event = {
      id: IdGenerator.generate(),
      type: eventType,
      data,
      createdAt: new Date(),
    } as Event; // todo: figure out this cast!?

    this.callbacks.forEach((callback) => callback(event));
  }

  static subscribe(callback: EventCallback): void {
    this.callbacks.push(callback);
  }
}
