import React from 'react';
import ReactDOM from 'react-dom/client';
import { loadMicroApp, registerMicroApps, start } from 'qiankun'
import App from './App';

registerMicroApps([
  {
    name: 'vue app',
    entry: 'http://localhost:3000/',
    container: '#vue-app',
    activeRule: '/vueapp',
  },
  // {
  //   name: 'react app',
  //   entry: 'http://localhost:3001/',
  //   container: '#react-app',
  //   activeRule: '/reactapp',
  // },
])
start({
  sandbox: {
    strictStyleIsolation: true
  }
})

// loadMicroApp({
//   name: 'vue app',
//   entry: 'http://localhost:3000/',
//   container: '#vue-app',
// });

// loadMicroApp({
//   name: 'react app',
//   entry: 'http://localhost:3001/',
//   container: '#react-app',
// });

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
