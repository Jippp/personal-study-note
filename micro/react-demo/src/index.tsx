import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * 初始化时调用，重新进入不会触发，而是直接调用mount
 */
export async function bootstrap() {
  console.log('%c react app bootstrap', 'color: red; font-size: 20px;', );
}

/**
 * 每次进入都会触发
 */
export async function mount(props: any) {
  console.log('%c react app mount', 'color: red; font-size: 20px;', props);

  const rootEl = props.container ? props.container.querySelector('#root') : document.getElementById('root');
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }
}

/**
 * 每次切出时都会触发
 * @param props 
 */
export async function unmount(props: any) {
  console.log('%c react app unmount', 'color: red; font-size: 20px;', props);
}

/**
 * 可选，仅在主应用使用loadMicroApp加载微应用时有效
 */
export async function update(props: any) {
  console.log('%c react app update', 'color: red; font-size: 20px;', props);
}
