import { Link } from "react-router-dom";

function Header() {
  return (
    <header style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <h1>Cloud Storage</h1>
    </header>
  );
}

export default Header;