import { Link, useNavigate } from "react-router-dom"; 
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { logoutUser } from "../store/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user); // Получаем пользователя из Redux
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser(); // Логаут через redux
    dispatch(logoutUser()); // Обновляем состояние
    navigate("/login"); // Перенаправляем на страницу входа
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <Link to="/" className="text-lg font-bold">Cloud Storage</Link>
      <div>
        {user ? (
          <>
            <Link to="/dashboard" className="mr-4">Личный кабинет</Link>
            {user.is_admin && (
              <Link to="/admin" className="bg-green-500 px-4 py-2 rounded ml-4">
                Панель администратора
              </Link>
            )}
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
