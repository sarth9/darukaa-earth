# 🌍 Darukaa Earth – Environmental Monitoring Platform

A full-stack geospatial platform to manage environmental restoration projects, sites, and analytics.

## 🚀 Tech Stack

### Backend
- FastAPI
- PostgreSQL (Neon)
- SQLAlchemy
- JWT Auth

### Frontend
- Next.js 16
- TypeScript
- Tailwind CSS
- Axios
- Leaflet (maps)

---

## ✨ Features

- 🔐 Authentication (JWT)
- 📁 Project management
- 📍 Site creation with GeoJSON polygons
- 🗺️ Interactive maps (Leaflet)
- 📊 Analytics tracking (carbon, biodiversity, soil)
- 📈 Time-series charts
- 🔄 Real-time dashboard updates

---

## 🛠️ Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

### Frontend
Frontend
cd frontend
npm install
npm run dev

### Environment Variables
Backend .env
DATABASE_URL=your_neon_connection_string
SECRET_KEY=your_secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:3000
APP_NAME=Darukaa Earth API
DEBUG=True

Frontend .env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1

###API Routes

Auth
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me

Projects
GET /api/v1/projects
POST /api/v1/projects
GET /api/v1/projects/{project_id}

Sites
GET /api/v1/sites
POST /api/v1/sites
GET /api/v1/sites/{site_id}
GET /api/v1/projects/{project_id}/sites

Analytics
POST /api/v1/analytics/site
GET /api/v1/analytics/site/{site_id}
