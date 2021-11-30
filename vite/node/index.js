import Koa from 'koa';
import { WebSocketServer } from 'ws';

import {
  indexHtmlMiddleware,
  baseMiddleware,
  transformMiddleware,
} from './middlewares.js';
import launchHmr from './launchHmr.js';
import { readConfig } from './utils.js';

const app = new Koa();

const config = readConfig();

// 连接ws
function createWs() {
  const Websocket = new WebSocketServer({ port: config.WS_PORT });
  Websocket.on('connection', function connection(ws) {
    console.log('ws is connected!!');
    launchHmr(ws, config);
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });
  });
}

// 运行
(function createServer() {
  createWs();
  app.listen(config.SERVER_PORT, () => {
    console.log(`listening：${config.SERVER_PORT} port!!!`);
  });
  app.use(baseMiddleware);
  app.use(indexHtmlMiddleware);
  app.use(transformMiddleware);
})();
