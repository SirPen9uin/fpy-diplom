import React from "react";
import FileManager from "../components/FileManager";
import UploadFile from "../components/UploadFile";
const userData = JSON.parse(localStorage.getItem('user') ?? '{}');

const Dashboard: React.FC = () => {
  
  return (
    <div>
      <h1>Добро пожаловать в личный кабинет, {userData.username}!</h1>
      <UploadFile />
      <FileManager />
    </div>
  );
};

export default Dashboard;
