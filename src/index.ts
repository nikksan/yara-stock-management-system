import HttpServer from '@infrastructure/server/HttpServer';
import container from './root';

(async () => {
  const httpServer = container.resolve<HttpServer>('httpServer');
  await httpServer.start();
})();

