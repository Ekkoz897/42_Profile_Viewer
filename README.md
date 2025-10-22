# 42 Profile Viewer

A minimal **Django + React** app that lets users authenticate with **42 Intra OAuth**, then view their profile using **JWT** (access/refresh) issued by the backend.

---

## Goal

- Log in with **42** → backend exchanges the code → issues **JWT** → frontend shows **/me** with your profile.
- Tokens are returned to the frontend using the **URL fragment** (`#access=...`) to avoid leaking secrets in server logs and referrers.

---

## Tech Stack

- **Backend:** Django, Django REST Framework, SimpleJWT, django-cors-headers, requests, python-dotenv
- **OAuth Provider:** 42 Intra (OAuth2 Authorization Code)
- **Frontend (dev):** React + Vite, React Router

---

## Project Structure

42_Profile_Viewer/
├─ backend/
│ ├─ manage.py
│ └─ .env # backend env (NOT committed)
└─ frontend/
├─ index.html
├─ src/
│ ├─ main.jsx
│ ├─ App.jsx
│ ├─ pages/ (Home.jsx, Me.jsx)
│ ├─ lib/ (api.js)
│ └─ styles/ (fortytwo.css)
├─ vite.config.js


---

## Environment Variables

> **Never commit `.env` files.** Add them to `.gitignore`. If secrets were pushed, rotate them and scrub history.

### `backend/.env`
```env
# Django
DJANGO_SECRET_KEY=replace-me-with-a-long-random-string
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS (allow the dev frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Where the backend redirects after successful auth
FRONTEND_URL=http://localhost:3000

# 42 OAuth (create an app on 42 Intra and set its redirect URI)
FORTYTWO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FORTYTWO_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
# Must match your app settings in 42
FORTYTWO_REDIRECT_URI=http://localhost:8000/api/auth/42/callback/

# Optional DB
# DATABASE_URL=sqlite:///db.sqlite3

frontend/.env
# Point the frontend to the backend in dev (omit if using Vite proxy)
VITE_API_BASE=http://localhost:8000

Getting Started (Dev)
1) Backend
cd backend
python -m venv .venv
source .venv/bin/activate

pip install -U pip wheel
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers requests python-dotenv

python manage.py makemigrations
python manage.py migrate
python manage.py runserver   # http://localhost:8000

2) Frontend (Node ≥ 20)
cd frontend
npm install
# ensure port matches FRONTEND_URL
npm run dev -- --port 3000    # http://localhost:3000


If Vite uses 5173 by default, either pass --port 3000, set it in vite.config.js, or free port 3000.

Login Flow

Frontend calls GET /api/auth/42/login/ → receives the authorize URL.

User authorizes on 42 → 42 redirects to /api/auth/42/callback/?code=....

Backend exchanges code, fetches 42 profile, creates/updates a local user, and issues a JWT pair.

Backend redirects to frontend /me with tokens in the URL fragment:

http://localhost:3000/me#access=<ACCESS>&refresh=<REFRESH>&username=<USER>


Frontend reads the fragment, stores tokens (e.g., localStorage), cleans the URL (history.replaceState), then calls /api/auth/me/ with Authorization: Bearer <access>.

Using the fragment (#...) instead of the query (?...) prevents tokens from appearing in server logs and referrers.

Minimal API Endpoints

GET /api/auth/42/login/
→ { "authorize_url": "https://api.intra.42.fr/oauth/authorize?..." }

GET /api/auth/42/callback/?code=...
→ Redirects to frontend /me#access=...&refresh=....

GET /api/auth/me/ (requires Authorization: Bearer <access>)
→ { "id": 1, "username": "apereira", "email": "...", "profile_picture": "..." }
