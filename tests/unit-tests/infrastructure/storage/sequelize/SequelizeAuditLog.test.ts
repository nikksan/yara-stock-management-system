import { loadConfig } from "@config/index";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import SequelizeAuditLog from "@infrastructure/storage/sequelize/SequelizeAuditLog";
import { Sequelize } from "sequelize";
import EventFactory from "../../../../utils/event-factory/EventFactory";
import { EventType } from "@domain/event/Event";

describe('SequelizeAuditLog', () => {
  const config = loadConfig();
  const eventFactory = new EventFactory();
  const loggerFactory = new LoggerFactory(config.log);
  const auditLog = new SequelizeAuditLog(
    new Sequelize(config.db),
    loggerFactory,
  );

  afterEach(() => auditLog.deleteAll());

  it('should store an event in the log', async () => {
    await expect(auditLog.append(eventFactory.createProductExportedEvent())).resolves.not.toThrow();
    await expect(auditLog.append(eventFactory.createProductImportedEvent())).resolves.not.toThrow();
  });

  it('should allow searching for events by their type', async () => {
    await auditLog.append(eventFactory.createProductExportedEvent());
    await auditLog.append(eventFactory.createProductImportedEvent());

    const events = await auditLog.search({
      types: [EventType.ProductExported]
    });

    expect(events.length).toEqual(1);
    expect(events[0].type).toEqual(EventType.ProductExported);
  });

  it('should allow searching by createdAt range', async () => {
    const importDates = [
      new Date('2023-10-19T08:00:00.000Z'),
      new Date('2023-10-19T09:00:00.000Z'),
      new Date('2023-10-19T10:00:00.000Z'),
      new Date('2023-10-19T11:00:00.000Z'),
      new Date('2023-10-19T12:00:00.000Z'),
    ];

    for (const date of importDates) {
      await auditLog.append(eventFactory.createProductImportedEvent({
        createdAt: date,
      }));
    }

    const events = await auditLog.search({
      types: [EventType.ProductImported],
      createdAt: [
        new Date('2023-10-19T09:30:00.000Z'),
        new Date('2023-10-19T11:30:00.000Z'),
      ],
    });

    expect(events.length).toEqual(2);
    expect(events[0].createdAt).toEqual(new Date('2023-10-19T10:00:00.000Z'));
    expect(events[1].createdAt).toEqual(new Date('2023-10-19T11:00:00.000Z'));
  });

  it('should allow searching by partial data', async () => {
    const event1 = eventFactory.createProductImportedEvent({
      data: {
        warehouse: {
          id: '1',
        }
      }
    });

    const event2 = eventFactory.createProductImportedEvent({
      data: {
        warehouse: {
          id: '1',
        }
      }
    });

    const event3 = eventFactory.createProductImportedEvent({
      data: {
        warehouse: {
          id: '2',
        }
      }
    });

    const event4 = eventFactory.createProductImportedEvent({
      data: {
        warehouse: {
          id: '3',
        }
      }
    });

    await auditLog.append(event1);
    await auditLog.append(event2);
    await auditLog.append(event3);
    await auditLog.append(event4);

    const events = await auditLog.search({
      types: [EventType.ProductImported],
      data: {
        warehouse: { id: '1' },
      },
    });

    expect(events.length).toEqual(2);
    expect(events[0]).toEqual(event1);
    expect(events[1]).toEqual(event2);
  });
});
