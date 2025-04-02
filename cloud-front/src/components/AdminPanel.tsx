import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

interface File {
  id: number;
  name: string;
  size: number;
  comment: string;
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
      setRenameInputs(data.files.reduce((acc: any, file: File) => ({ ...acc, [file.id]: file.name }), {}));
    } catch (err) {
      console.error("Ошибка загрузки файлов пользователя:", err);
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

  return (
    <div>
      <h1>Панель администратора</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя пользователя</th>
            <th>Email</th>
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
                <button onClick={() => fetchUserFiles(user)}>Управление файлами</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {fileModalOpen && selectedUser && (
        <div className="modal">
          <h2>Файлы пользователя {selectedUser.username}</h2>
          <ul>
            {userFiles.map((file) => (
              console.log(file),
              <li key={file.id}>
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
