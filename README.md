# Smart Study Notes

A full-stack note-taking application built with React, Vite, Express, Passport, and MongoDB.

## Features

- User signup and login
- Secure password hashing with bcrypt
- Session-based authentication
- Create, list, and delete notes
- Clean responsive UI with modern styling

## Setup

1. Copy `.env.example` or create a `.env` file
2. Set values for `MONGODB_URI`, `FRONTEND_URL`, `SESSION_SECRET`, and optionally `MONGODB_DB`
3. Install dependencies:

```bash
npm install
```

4. Start the frontend dev server:

```bash
npm run dev
```

5. Start the backend server:

```bash
npm start
```

## Important Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/user`
- `GET /api/notes`
- `POST /api/notes`
- `DELETE /api/notes/:id`

## Notes

- Frontend expects `VITE_API_URL` to point to the backend URL.
- Backend uses sessions and must allow credentials from the frontend.
