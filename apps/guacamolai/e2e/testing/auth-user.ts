import { join } from 'node:path';
import { dirname } from 'node:path/posix';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const authFilePath = join(__dirname, '../../.auth/user.json');
