import { useState } from "react";

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
      const response = await fetch("http://127.0.0.1:8000/storage/upload/", {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Файл ${data.file} успешно загружен!`);
      } else {
        setError(data.error || "Ошибка загрузки файла.");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером.");
    }
  };

  return (
    <div>
      <h2>Загрузить файл</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={handleUpload}>Загрузить</button>
    </div>
  );
};

export default UploadFile;
