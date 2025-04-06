import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Выберите файл для загрузки.");
      return;
    }

    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("comment", comment);

    try {
      const response = await fetch(`${API_BASE_URL}/storage/upload/`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Файл ${data.file} успешно загружен!`);
      } else {
        setError(data.error || "Ошибка загрузки файла.");
      }
    } catch (err) {
      setError(err.message || "Ошибка соединения с сервером.");
    }
  };

  return (
    <div className="upload">
      <h2>Загрузить файл</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="file-upload">
      <input className="file-input" type="file" onChange={handleFileChange} />
      <input
        className="file-comment"
        type="text"
        placeholder="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={handleUpload}>Загрузить</button>
      </div>
    </div>
  );
};

export default UploadFile;