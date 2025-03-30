import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { logoutUser } from "../store/authSlice";
import { logout } from "../api";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user); 

  const handleLogout = async () => {
    await logout();
    dispatch(logoutUser());
};

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <Link to="/" className="text-lg font-bold">Cloud Storage</Link>
      <div>
        {user ? (
          <>
            <Link to="/dashboard" className="mr-4">Личный кабинет</Link>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Вход</Link>
            <Link to="/register" className="bg-green-500 px-4 py-2 rounded">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
