import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  file_count: number;
  total_size: number;
}

interface File {
  name: string;
  size: number;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFiles, setUserFiles] = useState<File[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin_panel/users/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch((err) => console.error("Ошибка загрузки пользователей:", err));
  }, []);

  const handleToggleAdmin = async (userId: number, isAdmin: boolean) => {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  
    if (!csrfToken) {
      console.error("CSRF-токен не найден в куках!");
      return;
    }
  
    await fetch(`${API_BASE_URL}/admin_panel/users/${userId}/admin/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,  // Передаём токен
      },
      credentials: "include",
      body: JSON.stringify({ is_admin: !isAdmin }),
    });
  
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, is_admin: !isAdmin } : user
      )
    );
  };

  const handleDeleteUser = async (userId: number) => {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  
    if (!csrfToken) {
      console.error("CSRF-токен не найден в куках!");
      return;
    }
  
    await fetch(`${API_BASE_URL}/admin_panel/users/${userId}/delete/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,  // Передаём токен
      },
      credentials: "include",
    });
  
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  const handleViewFiles = async (user: User) => {
    setSelectedUser(user);
    fetch(`${API_BASE_URL}/admin_panel/users/${user.id}/storage/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUserFiles(data.files))
      .catch((err) => console.error("Ошибка загрузки файлов пользователя:", err));
  };

  return (
    <div>
      <h1>Панель администратора</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя пользователя</th>
            <th>Email</th>
            <th>Админ</th>
            <th>Файлы</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleToggleAdmin(user.id, user.is_admin)}>
                  {user.is_admin ? "Убрать админку" : "Сделать админом"}
                </button>
              </td>
              <td>
                <button onClick={() => handleViewFiles(user)}>Просмотр</button>
              </td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div>
          <h2>Файлы пользователя {selectedUser.username}</h2>
          <ul>
            {userFiles.length > 0 ? (
              userFiles.map((file, index) => (
                <li key={index}>{file.name} - {file.size} байт</li>
              ))
            ) : (
              <p>Файлов нет</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
