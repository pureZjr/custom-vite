import chokidar from 'chokidar';
import fs from 'fs';

import { resolveOnRoot, __dirname } from './utils.js';

// 发起热更新
const launchHmr = (ws, config) => {
  // 监听到文件变化，处理文件
  chokidar.watch(resolveOnRoot('src')).on('change', (changePath) => {
    changePath = changePath.replace(__dirname, '');
    console.log(`${changePath} has changed!!`);
    const cssObj = {};
    if (changePath.endsWith('.css')) {
      cssObj.css = fs.readFileSync(resolveOnRoot(changePath)).toString();
    }
    ws.send(
      JSON.stringify({
        type: 'change',
        changePath,
        ...cssObj,
      }),
    );
  });
};
export default launchHmr;
