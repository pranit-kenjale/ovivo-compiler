# Ovivo Ignition Perspective Screen Compiler

## Project Structure
```
/
├── backend/
│   ├── main.py           ← FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173 and proxies `/api` to backend at port 8000.

## Render Deployment

### Backend (Web Service)
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment**: Python 3.11+

### Frontend (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://your-backend.onrender.com`

## Usage
1. Click **Select Structure File** → upload `Structure_fileRev_Modified.xlsx`
2. Click **Select Config File** → upload reference zip(s) (page-config, views, SVGs)
3. Click **LOAD Screens** → tree populates with all screens
4. Check **Page Configuration** and/or **Navigation Screen** output types
5. Select screens from the tree (individual or by group)
6. Click **Generate Selected Screens** → zips download automatically
