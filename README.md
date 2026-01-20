# EMS-BE — Events Management System (Backend)

Backend частина проєкту **Events Management System**.  
Реалізовано на **NestJS**, з використанням **TypeORM** та **PostgreSQL**.

---

## 🛠 Tech Stack

- **Node.js**
- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **TypeScript**
- **ESLint**
- **class-validator / class-transformer**

---

## 📦 Features

- CRUD для подій (Events)
- Валідація вхідних даних (ValidationPipe)
- CORS для фронтенду (`http://localhost:3000`)
- Рекомендації схожих подій за датою: `GET /events/:id/recommendations`
- Логування запитів (middleware)
- Централізована обробка помилок (exception filter)

---

## 🚀 Getting Started

### 1) Клонування репозиторію

```bash
git clone https://github.com/Neplokhova/EMS-BE.git
cd EMS-BE/backend
2) Встановлення залежностей
bash
Copy code
npm install
🗄️ Database Setup (PostgreSQL, без Docker)
Вимоги
PostgreSQL 14+

pgAdmin або доступ до psql

1) Встановлення PostgreSQL
Завантаж PostgreSQL з офіційного сайту:
https://www.postgresql.org/download/

Стандартний порт: 5432.

2) Створення бази даних
Через pgAdmin
Підключись до локального сервера

Створи базу:

Name: ems_db

Через psql (альтернатива)
sql
Copy code
CREATE DATABASE ems_db;
3) Створення користувача (за потреби)
Якщо не хочеш використовувати postgres, створи окремого користувача:

sql
Copy code
CREATE USER ems_user WITH PASSWORD 'ems_password';
GRANT ALL PRIVILEGES ON DATABASE ems_db TO ems_user;
⚙️ Environment Variables
У корені папки backend створи файл .env:

env
Copy code
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ems_db
Якщо створила окремого юзера — підстав ems_user / ems_password.

▶️ Run
bash
Copy code
npm run start:dev
Сервер буде доступний за адресою:
👉 http://localhost:5000

Якщо в конфігурації TypeORM увімкнено synchronize: true, таблиці створяться автоматично при старті.

📡 API Endpoints
Events
Method	Endpoint	Description
GET	/events	Отримати всі події
GET	/events/:id	Отримати подію за ID
POST	/events	Створити подію
PATCH	/events/:id	Оновити подію
DELETE	/events/:id	Видалити подію
GET	/events/:id/recommendations	Отримати схожі події

📁 Project Structure (скорочено)
matlab
Copy code
src/
├── events/
│   ├── dto/
│   ├── entities/
│   ├── events.controller.ts
│   └── events.service.ts
├── common/
│   ├── filters/
│   └── middleware/
├── app.module.ts
└── main.ts

👩‍💻 Author
Еля Неплохова
GitHub: https://github.com/Neplokhova
