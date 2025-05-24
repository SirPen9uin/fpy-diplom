# Облачное хранилище ByteHaven

Развернутое [приложение](http://89.104.65.60/) для ознакомления.

## Запуск приложения на локальном диске

1. Создаём директорию для проекта
2. Клонируем в неё репозиторий:
   ```
   git clone https://github.com/SirPen9uin/fpy-diplom
   ```
3. Открываем в любой IDE и запускаем встроенный терминал
4. Переходим в папку `cloud_back`:
   ```
   cd backend
   ```
5. Создаём виртуальное окружение:
   ```
   python -m venv .venv
   ```
6. Активируем его:
   ```
   .venv/Scripts/Activate
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
   VITE_API_BASE_URL=http://127.0.0.1:8000
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

## Разворачиваем приложение на VPS-сервере
1. Подключаемся к серверу:
   ```
   ssh root@<ip адрес сервера>
   ```
2. Создаем нового пользователя:
   ```
   adduser <username>
   ```
3. Добавляем созданного пользователя у группу sudo:
   ```
   usermod <username> -aG sudo
   ```
4. Выходим из сессии:
   ```
   logout
   ```
5. Логинимся под созданным пользователем:
   ```
   ssh <username>@<ip адрес сервера>
   ```
6. Обновляем менеджер пакетов:
   ```
   sudo apt update
   ```
7. Устанавливаем необходимые пакеты:
   ```
   sudo apt install python3-venv python3-pip postgresql nginx
   ```
8. Заходим в терминал psql под пользователем postgres:
   ```
   sudo -u postgres psql
   ```
9. Создаем базу данных:
   ```
    CREATE DATABASE <DB_NAME>;
   ```
10. Задаем пароль для пользователя postgres:
   ```
    alter user postgres with password 'pass';
   ```
11. Выходим из терминала psql:
   ```
   \q
   ```
12. Проверяем установленную версию git:
   ```
   git --version
   ```
13. Клонируем репозиторий с проектом:
   ```
   git clone https://github.com/SirPen9uin/fpy-diplom.git
   ```
14. Переходим в папку cloud_back:
   ```
   cd /home/<username>/fpy-diplom/cloud_back
   ```
15. Устанавливаем виртуальное окружение:
   ```
   python3 -m venv venv
   ```
16. Активируем его:
   ```
   source venv/bin/activate
   ```
17. Устанавливаем проектные зависимости:
   ```
   pip install -r requirements.txt
   ```
18. Устанавливаем gunicorn:
   ```
   pip install gunicorn
   ```
19. В папке cloud_back создаем файл .env:
   ```
   nano .env
   ```
20. Откроется редактор, в файле прописываем необходимые данные в соответствии с шаблоном:
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
21. Применяем миграции:
   ```
   python manage.py migrate
   ```
22. Создаем суперпользователя командой:
   ```
   python manage.py initdata
   ```
23. Собираем статику:
   ```
   python manage.py collectstatic
   ```
24. Запускаем сервер и проверяем его работоспособность:
   ```
   python manage.py runserver 0.0.0.0:8000
   ```
25. Проверяем работу gunicorn:
   ```
   gunicorn backend.wsgi -b 0.0.0.0:8000
   ```
26. Создаем gunicorn.service:
   ```
   sudo nano /etc/systemd/system/gunicorn.service
   ```
   внутри сервисного файла указываем(все <**username**> заменяем на созданного пользователя):
   ```
  [Unit]
  Description=gunicorn service
  After=network.target

  [Service]
  User=<**username**>
  Group=www-data
  WorkingDirectory=/home/<**username**>/fpy-diplom/cloud_back
  ExecStart=/home/<**username**>/fpy-diplom/cloud_back/cloud_back/venv/bin/gunicorn \
           --access-logfile - \
           --workers=3 \
           --bind unix:/home/<**username**>/fpy-diplom/cloud_back/cloud_back/project.sock \
           cloud_back.wsgi:application

  [Install]
  WantedBy=multi-user.target
  ```
27. Запускаем сокет gunicorn:
   ```
   sudo systemctl start gunicorn
   ```
   ```
   sudo systemctl enable gunicorn
   ```
28. Проверем статус:
   ```
   sudo systemctl status gunicorn
   ```
29. Создаем модуль nginx:
   ```
   sudo nano /etc/nginx/sites-available/cloud_back
   ```
   внутри файла прописываем следующее содержимое:
   ```
   server {
     listen 80;
     server_name <ip_адрес_сервера>;

     location = /favicon.ico {
        access_log off;
        log_not_found off;
     }

     location /static/ {
        root /home/<username>/fpy-diplom/cloud_back;
     }

     location /media/ {
        root /home/<username>/fpy-diplom/cloud_back;
     }

     location /api/ {
        include proxy_params;
        proxy_pass http://unix:/home/<username>/fpy-diplom/cloud_back/cloud_back/project.sock;
     }

     location / {
        root /home/<username>/fpy-diplom/cloud-front/dist;
        try_files $uri $uri/ /index.html;
     }
  }
   ```
30. Создаем символическую ссылку:
   ```
   sudo ln -s /etc/nginx/sites-available/cloud_back /etc/nginx/sites-enabled
   ```
31. Добавляем пользователя www-data в группу текущего пользователя:
   ```
   sudo usermod -aG <username> www-data
   ```
32. Проверяем nginx:
   ```
   sudo nginx -t
   ```
33. Перезапускаем веб-сервер:
   ```
   sudo systemctl restart nginx
   ```
34. Проверяем статус nginx:
   ```
   sudo systemctl status nginx
   ```
35. Даем полные права nginx для подключений:
   ```
   sudo ufw allow 'Nginx Full'
   ```
36. Устанавливаем Nodejs и npm:
   ```
   sudo apt install nodejs
   ```
   ```
   sudo apt install npm
   ```
37. Переходим в директорию cloud-front:
   ```
   cd home/<username>/fpy-diplom/cloud-front
   ```
38. Устанавливаем пакеты:
   ```
   npm install
   ```
39. Запускаем сборку проекта:
   ```
   npm run build
   ```
40. Перезапускаем веб-сервер:
   ```
   sudo systemctl restart nginx
   ```
41. Переходим на сайт:
   ```
   <ip адрес сервера>
   ```