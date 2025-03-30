import { Link } from "react-router-dom";

function Header() {
  return (
    <header style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
      <nav>
        <Link to="/">Главная</Link> | <Link to="/login">Войти</Link> | <Link to="/dashboard">Хранилище</Link>
      </nav>
    </header>
  );
}

export default Header;