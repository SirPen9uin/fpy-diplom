import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import UploadFile from "../components/UploadFile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  useEffect(() => {
    const fetchFiles = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/storage/files/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setFiles(data.files);
        } else {
          console.error("Ошибка загрузки файлов:", data.error);
        }
      } catch (error) {
        console.error("Ошибка запроса:", error);
      }
    };

    fetchFiles();
  }, [navigate]);

  const handleGenerateLink = async (filePath: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    // Убираем "uploads/" из пути файла
    const fileName = filePath.replace(/^uploads\//, "");
  
    try {
      const response = await fetch(`${API_BASE_URL}/storage/files/${fileName}/link/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.name === filePath ? { ...file, external_link: data.external_link } : file
          )
        );
      } else {
        console.error("Ошибка генерации ссылки:", data.error);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };
  

  return (
    <div>
      <h1>Личный кабинет</h1>
      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Выйти
      </button>
      <UploadFile />
      <h2>Мои файлы</h2>
      <ul>
        {files.map((file) => (
          <li key={file.url}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.name}
            </a>{" "}
            - {file.comment || "Без комментария"}
            {file.external_link ? (
              <p>
                🔗 Публичная ссылка:{" "}
                <a href={file.external_link} target="_blank" rel="noopener noreferrer">
                  {file.external_link}
                </a>
              </p>
            ) : (
              <button onClick={() => handleGenerateLink(file.name)}>Создать ссылку</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
