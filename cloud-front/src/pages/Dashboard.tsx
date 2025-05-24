import React, { useState } from "react";
import FileManager from "../components/FileManager";
import UploadFile from "../components/UploadFile";

const userData = JSON.parse(localStorage.getItem('user') ?? '{}');

const Dashboard: React.FC = () => {
  const [refresh, setRefresh] = useState(false);

  const handleUploadSuccess = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div>
      <h1>Добро пожаловать в личный кабинет, {userData.username}!</h1>
      <UploadFile onUploadSuccess={handleUploadSuccess} />
      <FileManager refresh={refresh} />
    </div>
  );
};

export default Dashboard;
