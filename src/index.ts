import HttpServer from '@infrastructure/server/HttpServer';
import container from './root';
import EventController from '@infrastructure/controller/EventController';

(async () => {
  const eventController = container.resolve<EventController>('eventController');
  eventController.init();

  const httpServer = container.resolve<HttpServer>('httpServer');
  await httpServer.start();
})();

