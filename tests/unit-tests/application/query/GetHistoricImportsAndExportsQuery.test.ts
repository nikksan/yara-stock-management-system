import GetHistoricImportsAndExportsQuery from "@application/query/GetHistoricImportsAndExportsQuery";
import EventFactory from "../../../utils/event-factory/EventFactory";
import InMemoryAuditLog from "../../../utils/in-memory-audit-log/InMemoryAuditLog";

describe('GetHistoricImportsAndExportsQuery', () => {
  const auditLog = new InMemoryAuditLog();
  const eventFactory = new EventFactory();

  const query = new GetHistoricImportsAndExportsQuery(
    auditLog
  );

  afterEach(async () => {
    await auditLog.deleteAll();
  });

  it('should return events matching date', async () => {
    const importDates = [
      new Date('2023-10-10T08:00:00.000Z'),
      new Date('2023-10-12T10:00:00.000Z'),
      new Date('2023-10-12T11:00:00.000Z'),
      new Date('2023-10-12T12:00:00.000Z'),
      new Date('2023-10-13T11:00:00.000Z'),
    ];

    for (const date of importDates) {
      await auditLog.append(eventFactory.createProductImportedEvent({
        createdAt: date,
      }));
    }

    const events = await query.run({
      date: new Date('2023-10-12'),
    });

    expect(events.length).toEqual(3);
    expect(events.every(e => e.createdAt.toISOString().startsWith('2023-10-12'))).toBeTruthy();
  });

  it('should return events matching warehouseIds', async () => {
    await auditLog.append(eventFactory.createProductImportedEvent({
      data: {
        warehouse: { id: '1' }
      }
    }));

    await auditLog.append(eventFactory.createProductImportedEvent({
      data: {
        warehouse: { id: '2' }
      }
    }));

    await auditLog.append(eventFactory.createProductImportedEvent({
      data: {
        warehouse: { id: '3' }
      }
    }));

    const events = await query.run({
      warehouseIds: ['1', '2'],
    });

    expect(events.length).toEqual(2);
  });

  it('should return events matching both date and warehouseIds', async () => {
    await auditLog.append(eventFactory.createProductImportedEvent({
      data: {
        warehouse: { id: '1' }
      },
      createdAt: new Date('2023-10-12T10:00:00.000Z'),
    }));

    await auditLog.append(eventFactory.createProductImportedEvent({
      data: {
        warehouse: { id: '3' }
      },
      createdAt: new Date('2023-10-12T10:00:00.000Z'),
    }));

    await auditLog.append(eventFactory.createProductImportedEvent({
      data: {
        warehouse: { id: '2' }
      },
      createdAt: new Date('2023-10-12T11:00:00.000Z'),
    }));

    await auditLog.append(eventFactory.createProductImportedEvent({
      data: {
        warehouse: { id: '2' }
      },
      createdAt: new Date('2023-10-13T11:00:00.000Z'),
    }));

    await auditLog.append(eventFactory.createProductImportedEvent({
      data: {
        warehouse: { id: '3' }
      },
      createdAt: new Date('2023-10-14T10:00:00.000Z'),
    }));

    const events = await query.run({
      warehouseIds: ['1', '2'],
      date: new Date('2023-10-12')
    });

    expect(events.length).toEqual(2);
    expect(events.every(e => ['1', '2'].includes(e.data.warehouse.id))).toBeTruthy();
    expect(events.every(e => e.createdAt.toISOString().startsWith('2023-10-12'))).toBeTruthy();
  });
});
