# Classbound

Classbound is a web-based RPG class learning platform. This repository is set up as a two-app workspace:

- `backend/` contains the Laravel API
- `frontend/` contains the React client

## Stack

- Backend: Laravel 13, Sanctum, MySQL or MariaDB
- Frontend: React 19, Vite

## Local Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend default URL:

```text
http://localhost:8000
```

Health endpoint:

```text
http://localhost:8000/api/health
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Notes

- Laravel Sanctum API scaffolding is installed.
- The backend is configured for local SPA development with `localhost:5173`.
- Vite proxies `/api` and `/sanctum` requests to the Laravel server during local development.
- The backend is configured for MySQL by default using the `classbound` database.
- Create the database in MySQL/phpMyAdmin before running migrations if it does not exist yet.

## Recommended Next Steps

1. Add role and permission management.
2. Design the core RPG class, lesson, quiz, and reward schema.
3. Build authentication endpoints and frontend auth state.
4. Add a versioned API structure under `/api/v1`.
