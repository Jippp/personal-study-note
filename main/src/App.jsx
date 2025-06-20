import { Link, Outlet } from 'react-router-dom'
import './App.css';
import { microApps } from "./utils/config";

const App = () => {
  return (
    <div className="content">
      主应用
      <div className="app-nav">
        <p>Micro App List</p>
        <nav>
          <ul>
            {/* 遍历微应用的数据列表生成导航路由信息 */}
            {microApps.map((item) => (
              <li key={item.name}>
                <Link to={item.router}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default App;
