const { transformSync } = require('@babel/core');

module.exports = function reactRefreshPlugin() {
  const runtimePublicPath = '/@modules/react-refresh';

  return {
    transform(code, id) {
      if (!/\.(t|j)sx?$/.test(id) || id.includes('node_modules')) {
        return;
      }

      // plain js/ts files can't use React without importing it, so skip
      // them whenever possible
      if (!id.endsWith('x') && !code.includes('react')) {
        return;
      }

      if (code.includes('ReactDOM.render')) {
        return code;
      }

      const isReasonReact = id.endsWith('.bs.js');
      const result = transformSync(code, {
        plugins: [
          require('@babel/plugin-syntax-import-meta'),
          [require('react-refresh/babel'), { skipEnvCheck: true }],
        ],
        ast: !isReasonReact,
        sourceMaps: true,
        sourceFileName: id,
      });

      if (!/\$RefreshReg\$\(/.test(result.code)) {
        // no component detected in the file
        return code;
      }

      const header = `
    import RefreshRuntime from "${runtimePublicPath}";

    let prevRefreshReg;
    let prevRefreshSig;

    prevRefreshReg = window.$RefreshReg$;
    prevRefreshSig = window.$RefreshSig$;
    window.$RefreshReg$ = (type, id) => {
      RefreshRuntime.register(type, ${JSON.stringify(id)} + " " + id)
    };
    window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
    `;

      const footer = `
    window.$RefreshReg$ = prevRefreshReg;
    window.$RefreshSig$ = prevRefreshSig;

    if (!window.__vite_plugin_react_timeout) {
      window.__vite_plugin_react_timeout = setTimeout(() => {
        window.__vite_plugin_react_timeout = 0;
        RefreshRuntime.performReactRefresh();
      }, 30);
    }`;

      return {
        code: `${header}${result.code}${footer}`,
        map: result.map,
      };
    },
  };
};
