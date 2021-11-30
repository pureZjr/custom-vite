import fs from 'fs';
import path from 'path';
import { buildSync, transformSync } from 'esbuild';

import reactRefresh from '../plugin/react-refresh.cjs';

const reactRefreshPlugin = reactRefresh();

/**
 * 替换文件里面引用的裸模块
 * @param {string} content - 文件内容
 * @example content = import React from 'react', s0 =  from 'react' , s1 = react;
 */
function rewriteImport(content) {
  return content.replace(/ from ['"](.*)['"]/g, function (s0, s1) {
    if (s1.startsWith('./') || s1.startsWith('/') || s1.startsWith('../')) {
      // 原路径输出
      return s0;
    } else {
      // 修改裸模块路径
      return ` from '/@modules/${s1}'`;
    }
  });
}

// 处理jsx
export function handleJsx(ctx, requestUrl) {
  let filePath = resolveOnRoot(requestUrl);
  const JSXFile = rewriteImport(fs.readFileSync(filePath).toString());

  const out = transformSync(JSXFile, {
    jsxFragment: 'Fragment',
    loader: 'jsx',
  });
  let realCode = out.code;

  // 自定义 import 为需要热更新
  if (ctx.request.url.split('?')[1]?.includes('import')) {
    realCode = out.code.replace(
      / from ['"](.*\.jsx.*)['"]/g,
      function rewriteCode(s0, s1) {
        return ` from '${s1}?import=${+new Date()}'`;
      }
    );
  }

  realCode = reactRefreshPlugin.transform(realCode, filePath);
  if (realCode.code) {
    realCode = realCode.code;
  }

  ctx.type = 'application/javascript';
  ctx.body = realCode;
}

// 处理第三方包
export function handleNodeModules(ctx, requestUrl) {
  const modulesName = requestUrl.replace('/@modules/', '');
  const entryFile = JSON.parse(
    fs.readFileSync(
      `${__dirname}/node_modules/${modulesName}/package.json`,
      'utf8'
    )
  ).main;
  const pkgPath = `${__dirname}/node_modules/${modulesName}/${entryFile}`;
  let body = {};

  try {
    body = fs.readFileSync(
      `${__dirname}/node_modules/.cvite/${modulesName}.js`
    );
  } catch (err) {
    // 使用 ESBuild 打包裸模块里的内容，转换为 ESM 供浏览器使用
    buildSync({
      entryPoints: [pkgPath],
      bundle: true,
      outfile: `${__dirname}/node_modules/.cvite/${modulesName}.js`,
      format: 'esm',
    });
    body = fs.readFileSync(
      `${__dirname}/node_modules/.cvite/${modulesName}.js`
    );
  }

  ctx.type = 'application/javascript';
  ctx.body = body;
}

/**
 * 处理css
 * 调用创建样式的方法（通过标签插入样式）
 */
export function handleCss(ctx, requestUrl) {
  const filePath = resolveOnRoot(requestUrl);
  const CSSFile = JSON.stringify(fs.readFileSync(filePath).toString());

  const file = `
    import { globalUpdateStyle } from '/@vite/client/style.js';
    globalUpdateStyle('${requestUrl}',${CSSFile});
    `;
  ctx.type = 'application/javascript';
  ctx.body = file;
}

// 处理svg, 转base64
export function handleSvg(ctx, requestUrl) {
  const filePath = resolveOnRoot(requestUrl);
  const imageFile = fs.readFileSync(filePath);
  ctx.type = 'application/javascript';
  ctx.body = `export default 'data:image/svg+xml;base64,${Buffer.from(
    imageFile,
    'binary'
  ).toString('base64')}'`;
}

/**
 * 处理入口html
 * 插入自定义vite客户端代码
 */
export function handleHtml(ctx) {
  // 根路径返回模版 HTML 文件
  const html = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');
  const importHandleStyle =
    '<script type="module" src="/@vite/client/style.js"></script>';
  const importHandleWs =
    '<script type="module" src="/@vite/client/ws.js"></script>';
  const preambleCode = `
    <script type="module">
      import RefreshRuntime from "/@modules/react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`;
  ctx.type = 'text/html';
  ctx.body = `${preambleCode}${importHandleStyle}${importHandleWs}${html}`;
}

// 根目录
export const __dirname = path.resolve(path.dirname(''));

export const resolveOnRoot = (filePath) => path.join(__dirname, `/${filePath}`);

// 读取配置文件
export const readConfig = () => {
  const json = JSON.parse(
    fs.readFileSync(resolveOnRoot('vite.config.json'), 'utf8')
  );
  return json;
};
