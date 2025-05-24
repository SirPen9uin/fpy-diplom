# Облачное хранилище ByteHaven

Развернутое [приложение](http://89.104.65.60/) для ознакомления.

## Запуск приложения на локальном диске

1. Создаём директорию для проекта
2. Клонируем в неё репозиторий:
   ```
   git clone https://github.com/SirPen9uin/fpy-diplom
   ```
3. Открываем в любой IDE и запускаем встроенный терминал

4. Создаём виртуальное окружение:
   ```
   python -m venv .venv
   ```
5. Активируем его:
   ```
   .venv/Scripts/Activate
   ```
6. Переходим в папку `cloud_back`:
   ```
   cd backend
   ```
7. Устанавливаем зависимости:
   ```
   pip install -r requirements.txt
   ```
8. В папке `cloud_back` создаём файл `.env` в соответствии с шаблоном:
      ```
        #DATABASE block
        DB_ENGINE=
        DB_NAME=
        DB_USER=
        DB_PASSWORD=
        DB_HOST=
        DB_PORT=

        #Django block
        SECRET_KEY=
        ALLOWED_HOSTS=

        #Admin block
        ADMIN_USER=
        ADMIN_EMAIL=
        ADMIN_PASSWORD=
      ```
9. Логинимся в терминале `psql` под пользователем `postgres` или своим пользователем: 
   ```
   psql -U postgres
   ```
10. Создаём базу данных с учётом настроек указанных в файле `.env`:
   `CREATE DATABASE <DB_NAME> WITH PASSWORD <DB_PASSWORD>;`
11. Применяем миграции:
   ```
   python manage.py migrate
   ```
12. Создаём суперпользователя с указанными в файле `.env` данными:
   ```
   python manage.py createsuperuser
   ```
   или выполняем команду 
   ```
   python manage.py initdata
   ```
13. Запускаем сервер:
   ```
   python manage.py runserver
   ```
14. Открываем второй терминал в директории `cloud-front`

15. Создаем в директории файл `.env`

16. В файле `.env` указываем базовый URL сервера:
   ```
   VITE_SERVER_URL=http://127.0.0.1:8000
   ```
17. Устанавливаем необходимые зависимости:
   ```
   npm install
   ```
18. Запускаем приложение:
   ```
   npm run dev
   ```

19. Переходим по адресу http://127.0.0.1:5173