import { exec } from 'child_process';
import { promisify } from 'util';

export default async () => {
  const execAsync = promisify(exec);
  await execAsync('npm run setup-db');
};
