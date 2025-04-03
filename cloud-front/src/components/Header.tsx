import logo from '../assets/ByteHaven.png';
function Header() {
  return (
    <header style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
      <div className='header-flex'>
        <h1>ByteHaven</h1>
        <img src={logo} alt="ByteHaven Logo" />
      </div>
    </header>
  );
}

export default Header;