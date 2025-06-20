import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App';
import { registerMicro } from './utils/spa'
import { MICRO_ROUTER, microApps } from './utils/config'

// single-spa注册子应用
registerMicro(microApps.map(app => ({
  // 子应用名称 应该唯一
  name: app.name,
  // 子应用的加载逻辑
  app: () => {
    // 先看一下动态import导入npm包的例子
    if(app.router === MICRO_ROUTER.REACT) {
      return import('react-app')
    }else if(app.router === MICRO_ROUTER.VUE) {
      return import('vue-app')
    }
  },
  // 匹配逻辑，激活逻辑
  activeWhen: app.router,
  // 自定义参数，传递给子应用的
  customProps: {
    // 向微应用传递需要挂载的容器元素 ID
    container: 'micro-content',
  },
})))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: microApps.map(app => ({
      path: app.router,
      element: <div id='micro-content'></div>
    }))
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
