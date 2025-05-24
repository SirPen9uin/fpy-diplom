import { Link, useNavigate } from "react-router-dom"; 
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { logoutUser } from "../store/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        // Сессия на бэке удалена, теперь чистим клиент
        dispatch(logoutUser());
      } else {
        // Можно показать ошибку или логировать
        console.error("Ошибка при выходе из системы");
      }
    } catch (error) {
      console.error("Ошибка сети при выходе из системы", error);
    }
    dispatch(logoutUser()); // Обновляем состояние
    navigate("/login"); // Перенаправляем на страницу входа
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <Link to="/" className="text-lg font-bold">Главная</Link>
      <div className="flex items-center">
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
