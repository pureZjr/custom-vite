import fs from 'fs';

import {
  handleJsx,
  handleNodeModules,
  handleCss,
  handleSvg,
  handleHtml,
  resolveOnRoot,
} from './utils.js';

// 处理地址
export const baseMiddleware = (ctx, next) => {
  const requestUrl = ctx.request.url.split('?')[0];
  ctx.requestUrl = requestUrl;
  next();
};

// 处理入口html
export const indexHtmlMiddleware = (ctx, next) => {
  if (ctx.requestUrl === '/') {
    handleHtml(ctx);
  }
  next();
};

// 处理请求的资源
export const transformMiddleware = (ctx, next) => {
  const { requestUrl } = ctx;
  if (requestUrl.endsWith('.jsx')) {
    handleJsx(ctx, requestUrl);
  } else if (requestUrl.startsWith('/@modules/')) {
    handleNodeModules(ctx, requestUrl);
  } else if (requestUrl.endsWith('.css')) {
    handleCss(ctx, requestUrl);
  } else if (requestUrl.endsWith('.svg')) {
    handleSvg(ctx, requestUrl);
  } else if (requestUrl.startsWith('/@vite/client')) {
    ctx.type = 'application/javascript';
    const filePath = requestUrl.replace('/@vite/client', 'vite/client');
    ctx.body = fs.readFileSync(resolveOnRoot(filePath), 'utf8');
  }
  next();
};
