import 'localenv';
import express from 'express';
import expressWsCreator from 'express-ws';
import notifier from './notifier';

const app = express();
const wsApp = expressWsCreator(app);

wsApp.app.ws('/eventbus', (ws) => {
  const id = notifier.register(ws);
  ws.on('close', () => {
    notifier.unregister(id);
  });
});

app.listen(process.env.PORT || 55555);
console.log(`Listening on ${process.env.PORT}` || 55555);
