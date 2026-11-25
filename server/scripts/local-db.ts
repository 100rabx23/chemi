// Starts a throwaway local PostgreSQL (no Docker/system install needed) on port 5433.
// Data lives in server/.pgdata. Stop with Ctrl+C.
import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';

const dir = new URL('../.pgdata', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const fresh = !fs.existsSync(dir);
const pg = new EmbeddedPostgres({ databaseDir: dir, user: 'chemilinx', password: 'chemilinx', port: 5433, persistent: true });

if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase('chemilinx');
console.log('Local PostgreSQL ready: postgresql://chemilinx:chemilinx@localhost:5433/chemilinx');

const stop = async () => { await pg.stop(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
