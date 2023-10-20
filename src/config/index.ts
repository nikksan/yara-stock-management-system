import { Config } from './Config';
export const isTesting = process.env.NODE_ENV === 'test';

export function loadConfig(): Config {
  let configPath: string;
  if (isTesting) {
    configPath = './config.test';
  } else {
    configPath = './config.dev';
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(configPath).default;
}
