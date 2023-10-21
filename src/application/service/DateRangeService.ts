import moment from 'moment';

export default class DateRangeService {
  static makeRangeFromStartAndEndOfDay(date: Date): [Date, Date] {
    return [
      moment(date).startOf('day').toDate(),
      moment(date).endOf('day').toDate(),
    ];
  }
}
