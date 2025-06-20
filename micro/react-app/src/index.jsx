import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 子应用需要抛出生命周期钩子，主应用才能识别和处理

let root;

// single-spa会在window上挂载一个全局变量，可以通过该变量来判断是否是微前端环境
if(!window.singleSpaNavigate) {
  root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

/**
 * 子应用首次加载时执行，即初始化
 */
export async function bootstrap() {
  console.log('%c react app bootstrap', 'color: red; font-size: 20px;', );
}

/**
 * 每次加载子应用都会执行，首次加载是在bootstrap之后执行
 */
export async function mount(props) {
  console.log('%c react app mount', 'color: red; font-size: 20px;', props);
  root = ReactDOM.createRoot(document.getElementById(props.container || 'root'))
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

/**
 * 子应用失活时执行
 * @param {} props 主应用传入的参数
 */
export async function unmount(props) {
  console.log('%c react app unmount', 'color: red; font-size: 20px;', props);
  root && root.unmount()
}

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );
