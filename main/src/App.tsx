import './App.css';
import { loadMicroApp } from 'qiankun'

const App = () => {
  return (
    <>
      <button onClick={() => {
        // window.location.pathname = 'reactApp'
        loadMicroApp({
          name: 'react app',
          entry: 'http://localhost:3001/',
          container: '#react-app',
        });
      }}>to react</button>
      <button onClick={() => {
        window.location.pathname = 'vueApp'
      }}>to vue</button>
      <div className="content">
        <div id="react-app"></div>
        <div id="vue-app"></div>
      </div>
    </>
  );
};

export default App;
