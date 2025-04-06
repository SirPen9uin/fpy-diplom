import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string; 
  last_name: string;  
  file_count: number; 
  total_size: number; 
  is_admin: boolean;
}

interface File {
  id: number;
  name: string;
  size: number;
  comment: string;
  uploadedAt: string;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [renameInputs, setRenameInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin_panel/users/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch((err) => console.error("Ошибка загрузки пользователей:", err));
  }, []);

  const fetchUserFiles = async (user: User) => {
    setSelectedUser(user);
    setFileModalOpen(true);
  
    try {
      const res = await fetch(`${API_BASE_URL}/admin_panel/users/${user.id}/storage/`, { credentials: "include" });
      const data = await res.json();
  
      setUserFiles(data.files);

      setRenameInputs(
        data.files.reduce((acc: Record<number, string>, file: File) => {
          acc[file.id] = file.name;
          return acc;
        }, {})
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Ошибка загрузки файлов пользователя:", err.message);
      } else {
        console.error("Неизвестная ошибка:", err);
      }
    }
  };

  const handleRenameChange = (fileId: number, newName: string) => {
    setRenameInputs((prev) => ({ ...prev, [fileId]: newName }));
  };

  const handleRenameFile = async (fileId: number) => {
    if (!selectedUser) return;
    const newName = renameInputs[fileId]?.trim();
    if (!fileId || !newName) return;

    try {
      await fetch(`${API_BASE_URL}/admin_panel/users/${selectedUser.id}/storage/${fileId}/rename/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newName }),
      });

      setUserFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, name: newName } : file
        )
      );
    } catch (err) {
      console.error("Ошибка переименования файла:", err);
    }
  };

  const handleUpdateComment = async (fileId: number, newComment: string) => {
    if (!selectedUser) return;

    try {
      await fetch(`${API_BASE_URL}/admin_panel/users/${selectedUser.id}/storage/${fileId}/comment/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ new_comment: newComment }),
      });

      setUserFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, comment: newComment } : file
        )
      );
    } catch (err) {
      console.error("Ошибка обновления комментария:", err);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!selectedUser) return;

    try {
      await fetch(`${API_BASE_URL}/admin_panel/users/${selectedUser.id}/storage/${fileId}/delete/`, {
        method: "DELETE",
        credentials: "include",
      });

      setUserFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (err) {
      console.error("Ошибка удаления файла:", err);
    }
  };

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
        "X-CSRFToken": csrfToken,
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
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
    });
  
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
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
            <th>Имя</th>
            <th>Фамилия</th>
            <th colSpan={2}>Хранилище пользователя</th>
            <th colSpan={2}>Действия с пользователями</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>Всего файлов: {user.file_count}. Общий размер файлов: {user.total_size} Кб</td>
              <td>
                <button onClick={() => fetchUserFiles(user)}>Управление файлами</button>
              </td>
              <td>
              <button onClick={() => handleDeleteUser(user.id)}>Удалить пользователя</button>
              </td>
              <td>
                <button onClick={() => handleToggleAdmin(user.id, user.is_admin)}>
                  {user.is_admin ? "Убрать админку" : "Сделать админом"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {fileModalOpen && selectedUser && (
        <div className="modal">
          <h2>Файлы пользователя {selectedUser.username}</h2>
          <h3>Количество файлов: {userFiles.length}</h3>
          <h3>Общий размер файлов: {userFiles.reduce((acc, file) => acc + file.size, 0)}</h3>
          <ul>
            {userFiles.map((file) => (
              console.log(file),
              <li key={file.id}>
                <span>{file.id}</span>
                <span>{file.uploadedAt}</span>
                <input
                  type="text"
                  value={renameInputs[file.id].split("/").pop() || ""}
                  onChange={(e) => handleRenameChange(file.id, e.target.value)}
                />
                <button onClick={() => handleRenameFile(file.id)}>Сохранить</button>
                <input
                  type="text"
                  value={file.comment || ""}
                  placeholder="Комментарий"
                  onChange={(e) => handleUpdateComment(file.id, e.target.value)}
                />
                <button onClick={() => handleDeleteFile(file.id)}>Удалить</button>
              </li>
            ))}
          </ul>
          <button onClick={() => setFileModalOpen(false)}>Закрыть</button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
