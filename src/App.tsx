import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="logo">✓</div>
          <div>
            <div className="title">Todos</div>
            <div className="subtitle">Express + React + TypeORM</div>
          </div>
        </div>
        <nav className="nav">
          <Link to="/">All Todos</Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
