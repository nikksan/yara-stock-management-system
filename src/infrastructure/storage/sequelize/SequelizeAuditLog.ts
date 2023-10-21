import AuditLog, { SearchParams } from '@domain/audit-log/AuditLog';
import createModel, { EventDB, EventAttributes, EventDAO } from './models/EventDB';
import { Logger } from '@infrastructure/logger/Logger';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import Event from '@domain/event/Event';
import lodash from 'lodash';

type PlainObject = Record<string, unknown>;

export default class SequelizeAuditLog implements AuditLog {
  private model: EventDB;
  private logger: Logger;

  constructor(
    dbConnection: Sequelize,
    loggerFactory: LoggerFactory,
  ) {
    this.model = createModel(dbConnection);
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async append(event: Event): Promise<void> {
    await this.model.create(this.mapEventToAttributes(event));
  }

  async search(params: SearchParams): Promise<Array<Event>> {
    const daos = await this.model.findAll({
      where: this.mapSearchParamsToWhereOptions(params),
    });

    const events: Array<Event> = [];
    for (const dao of daos) {
      try {
        events.push(this.mapDAOToEvent(dao));
      } catch (err) {
        this.logger.warn(err);
      }
    }

    return events;
  }

  async deleteAll(): Promise<void> {
    await this.model.destroy({ where: {} });
  }

  private mapSearchParamsToWhereOptions(params: SearchParams) {
    const whereOptions: WhereOptions<EventAttributes> = {};
    if (params.types !== undefined) {
      whereOptions.type = params.types;
    }

    if (params.createdAt !== undefined) {
      whereOptions.createdAt = {
        [Op.between]: params.createdAt,
      };
    }


    if (params.data !== undefined) {
      whereOptions.data = {
        [Op.contains]: params.data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    return whereOptions;
  }

  private mapEventToAttributes(event: Event): EventAttributes {
    return {
      id: event.id,
      type: event.type,
      data: event.data,
      createdAt: event.createdAt,
    };
  }

  private mapDAOToEvent(eventDAO: EventDAO): Event {
    return {
      id: eventDAO.dataValues.id,
      type: eventDAO.dataValues.type,
      data: this.hydrateDates(eventDAO.dataValues.data),
      createdAt: eventDAO.dataValues.createdAt,
    } as Event;
  }

  private hydrateDates(obj: PlainObject) {
    function deepMap(obj: PlainObject, iterator: (val: unknown) => unknown): PlainObject {
      return lodash.transform(obj, function (result: PlainObject, val: unknown, key: string) {
        result[key] = lodash.isObject(val)
          ? deepMap(val as PlainObject, iterator)
          : iterator(val);
      });
    }

    const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
    return deepMap(obj, (val) => {
      if (typeof val === 'string' && isoRegex.test(val)) {
        return new Date(val);
      }

      return val;
    });
  }
}
