import HttpServer from '@infrastructure/server/HttpServer';
import container from '../../src/root';
import root from '../../src/root';

describe('List warehouses', () => {
  const httpServer = container.resolve<HttpServer>('httpServer');
  const apolloServer = httpServer.getApolloServer();

  it('should do shit', async () => {
    // await apolloServer.executeOperation({
    //   query: 'query SayHelloWorld($name: String) { hello(name: $name) }',
    //   variables: { name: 'world' },
    // });
    expect(true).toBeTruthy();
  });
});
