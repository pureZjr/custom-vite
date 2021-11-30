/**
 * 处理样式
 */
window.sheetsMap = new Map();

/**
 * @description 1.页面初始化时候保存样式资源；2.样式更新的时候更新样式资源
 */
export const globalUpdateStyle = (id, content) => {
  let style = window.sheetsMap.get(id);
  if (style) {
    style.innerHTML = content;
  } else {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = content;
    document.head.appendChild(style);
  }
  window.sheetsMap.set(id, style);
};

export function removeStyle(id) {
  const style = window.sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    window.sheetsMap.delete(id);
  }
}
