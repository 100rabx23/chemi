import { createApp } from './app.js';
import { env } from './env.js';

createApp().listen(env.PORT, () => {
  console.log(`Chemilinx API listening on :${env.PORT} (${env.NODE_ENV})`);
});
