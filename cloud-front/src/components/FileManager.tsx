import React, { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FileData {
    id: number;
    name: string;
    external_link: string | null;
    url: string;
    comment: string | null;
    uploadedAt: string;
  }
  

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
  
      useEffect(() => {
          async function fetchFiles() {
              try {
                  const response = await fetch(`${API_BASE_URL}/storage/files/`, {
                      credentials: 'include',
                  });
  
                  if (!response.ok) {
                      throw new Error('Ошибка загрузки файлов');
                  }
  
                  const data = await response.json();
                  console.log(data.files);
                  setFiles(data.files);
              } catch (err:unknown) {
                if (err instanceof Error) {
                  setError(err.message);
                }
              } finally {
                  setLoading(false);
              }
          }
  
          fetchFiles();
      }, []);
  
      const handleGenerateLink = async (filePath: string) => {

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
  
        const downloadFile = async (filePath: string) => {
          const fileName = filePath.replace(/^uploads\//, "");
          try {
              const response = await fetch(`${API_BASE_URL}/storage/files/${filePath}/`, {
                  method: "GET",
                  credentials: "include",
              });
      
              if (!response.ok) {
                  throw new Error(`Ошибка при скачивании файла: ${response.statusText}`);
              }
      
              const data = await response.blob();
              const url = window.URL.createObjectURL(data);
              const link = document.createElement("a");
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
          } catch (error) {
              console.error("Ошибка при скачивании файла:", error);
          }    
  
        };
        const copyToClipboard = async (text: string) => {
          try {
              await navigator.clipboard.writeText(text);
              alert("Ссылка скопирована в буфер обмена!");
          } catch (error) {
              console.error("Ошибка копирования:", error);
          }
      };
  
      const deleteFile = async (fileName: string) => {
          try {
              const response = await fetch(`${API_BASE_URL}/storage/files/${fileName}/delete/`, {
                  method: "DELETE",
                  credentials: "include",
              });
      
              if (response.ok) {
                  alert("Файл успешно удален");
                  setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
              } else {
                  const data = await response.json();
                  alert(`Ошибка: ${data.error}`);
              }
          } catch (error) {
              console.error("Ошибка при удалении файла:", error);
              alert("Не удалось удалить файл");
          }
      };
      
      const renameFile = async (oldName: string, newName: string) => {
          if (!newName || newName.trim() === "" || newName === oldName) {
              return;
          }
  
          try {
              const response = await fetch(`${API_BASE_URL}/storage/files/rename/`, {
                  method: "PATCH",
                  credentials: "include",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ old_name: oldName, new_name: newName }),
              });
      
              if (response.ok) {
                  alert("Файл успешно переименован");
                  setFiles((prevFiles) =>
                      prevFiles.map((file) =>
                          file.name === oldName ? { ...file, name: newName } : file
                      )
                  );
              } else {
                  const data = await response.json();
                  alert(`Ошибка: ${data.error}`);
              }
          } catch (error) {
              console.error("Ошибка при переименовании файла:", error);
              alert("Не удалось переименовать файл");
          }
      };
      
      
      const updateComment = async (fileName: string, newComment: string) => {
          try {
              const response = await fetch(`${API_BASE_URL}/storage/files/${fileName}/comment/`, {
                  method: "PATCH",
                  credentials: "include",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ comment: newComment }),
              });
      
              if (response.ok) {
                  alert("Комментарий обновлен");
                  setFiles((prevFiles) =>
                      prevFiles.map((file) =>
                          file.name === fileName ? { ...file, comment: newComment } : file
                      )
                  );
              } else {
                  const data = await response.json();
                  alert(`Ошибка: ${data.error}`);
              }
          } catch (error) {
              console.error("Ошибка при обновлении комментария:", error);
              alert("Не удалось обновить комментарий");
          }
      };

    return (
        <div className="file-manager-container">    
            {loading ? (
                <p>Загрузка данных...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : files.length > 0 ? (
                <div className="file-list">
                    <h2>Ваши файлы:</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Имя файла</th>
                                <th>Действия с файлом</th>
                                <th>Комментарий</th>
                                <th>Время создания</th>
                                <th>Публичная ссылка</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => {
                                const dotIndex = file.name.lastIndexOf(".");
                                const nameOnly = file.name.substring(0, dotIndex);
                                const extension = file.name.substring(dotIndex);
                                console.log(dotIndex, nameOnly, extension);
                                const fileName = file.name.replace(/^uploads\//, "");
                                const publicLink = `http://127.0.0.1:8000/storage/external/${file.external_link}/`;
        
                                return (
                                    <tr key={file.url}>
                                        <td>
                                        <input
                                            type="text"
                                            defaultValue={fileName}
                                            onBlur={(e) => renameFile(fileName, e.target.value.trim())}
                                            style={{ marginRight: "10px" }}
                                        />
                                        </td>
                                        <td>
                                        <button onClick={() => downloadFile(fileName)}>
                                            Скачать
                                        </button>
        
                                        <button onClick={() => deleteFile(fileName)} style={{ marginLeft: "10px", color: "red" }}>
                                            Удалить
                                        </button>
                                        </td>
                                        <td>
                                        <input
                                            type="text"
                                            defaultValue={file.comment || "Без комментария"}
                                            onBlur={(e) => updateComment(fileName, e.target.value)}
                                            style={{ marginLeft: "10px" }}
                                        />
                                        </td>
                                        <td>{file.uploadedAt}</td>
                                        <td>
                                        {file.external_link ? (
                                            <p>
                                                <span
                                                    style={{ cursor: "pointer", textDecoration: "underline" }}
                                                    onClick={() => copyToClipboard(publicLink)}
                                                >
                                                    Скопировать ссылку
                                                </span>
                                            </p>
                                        ) : (
                                            <button onClick={() => handleGenerateLink(file.name)}>
                                                Создать ссылку
                                            </button>
                                        )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>У вас пока нет загруженных файлов.</p>
            )}
        </div>
    );    
};
export default FileManager