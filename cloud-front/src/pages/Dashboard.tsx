import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        async function fetchUserData() {
            const response = await fetch('http://127.0.0.1:8000/storage/files/', {
                credentials: 'include',
            });
            const data = await response.json();
            setUserData(data);
        }

        fetchUserData();
    }, []);

    return (
        <div>
            <h1>Добро пожаловать в личный кабинет!</h1>
            {userData ? (
                <div>
                    <p>Имя пользователя: {userData.username}</p>
                    <p>Электронная почта: {userData.email}</p>
                </div>
            ) : (
                <p>Загрузка данных...</p>
            )}
        </div>
    );
};

export default Dashboard;