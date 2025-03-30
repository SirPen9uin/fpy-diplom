import React, { useEffect, useState } from 'react';
import UploadFile from '../components/UploadFile';

interface FileData {
    name: string;
    url: string;
    comment: string;
    external_link: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard: React.FC = () => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFiles() {
            try {
                const response = await fetch('http://127.0.0.1:8000/storage/files/', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки файлов');
                }

                const data = await response.json();
                setFiles(data.files);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchFiles();
    }, []);

    const handleGenerateLink = async (filePath: string) => {
      
        // Убираем "uploads/" из пути файла
        const fileName = filePath.replace(/^uploads\//, "");
      
        try {
          const response = await fetch(`${API_BASE_URL}/storage/files/${fileName}/link/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
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
            <h1>Добро пожаловать в личный кабинет!</h1>

            {loading ? (
                <p>Загрузка данных...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : files.length > 0 ? (
                <div>
                    <UploadFile />
                    <h2>Ваши файлы:</h2>
                    <ul>
                        {files.map((file) => (
                            console.log(file),
                            <li key={file.url}>
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                {file.name}
                                </a>{" "}
                                - {file.comment || "Без комментария"}
                                {file.external_link ? (
                                <p>
                                    🔗 Публичная ссылка:{" "}
                                    <a href={'http://127.0.0.1:8000/storage/external/' + file.external_link + '/'} target="_blank" rel="noopener noreferrer">
                                    {file.name}
                                    </a>
                                </p>
                                ) : (
                                <button onClick={() => handleGenerateLink(file.name)}>Создать ссылку</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>У вас пока нет загруженных файлов.</p>
            )}
        </div>
    );
};

export default Dashboard;
