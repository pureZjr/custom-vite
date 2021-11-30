import { handleFile } from './utils.js';

const ws = new WebSocket(`ws://localhost:${5000}`);

ws.addEventListener('message', function incoming(target) {
  const data = JSON.parse(target.data);
  const { type, changePath, css } = data;
  console.log('ws-client: change');
  if (type === 'change') {
    handleFile(changePath, css);
  }
});
