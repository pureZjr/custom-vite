import { globalUpdateStyle } from './style.js';
import { FILE_TYPE } from './constant.js';

// 获取时间
export const timeParam = () => `t=${new Date().getTime()}`;

/**
 * 检查文件类型
 */
export const checkFileType = (str) => {
  const { JSX, CSS, SVG, NODE_MODULE } = FILE_TYPE;
  if (str.endsWith(JSX)) {
    return JSX;
  } else if (str.endsWith(CSS)) {
    return CSS;
  } else if (str.endsWith(SVG)) {
    return SVG;
  } else if (str.startsWith(`/${NODE_MODULE}/`)) {
    return NODE_MODULE;
  }
};

// 处理需要更新的文件
export function handleFile(path, css) {
  const { JSX, CSS, SVG, NODE_MODULE } = FILE_TYPE;
  if (checkFileType(path) === CSS) {
    globalUpdateStyle(path, css);
  } else if (checkFileType(path) === JSX) {
    import(`${path}?${timeParam()}`);
  }
}
