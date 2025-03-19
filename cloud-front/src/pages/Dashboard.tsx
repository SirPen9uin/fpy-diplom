import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { logoutUser } from "../store/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div>
      <h1>Личный кабинет</h1>
      {user ? (
        <>
          <p>Привет, {user.username}!</p>
          <button onClick={() => dispatch(logoutUser())}>Выйти</button>
        </>
      ) : (
        <p>Вы не авторизованы.</p>
      )}
    </div>
  );
}

export default Dashboard;
