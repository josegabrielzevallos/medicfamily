# MedicFamily

Proyecto full-stack con Django (Backend) y React (Frontend).

## Estructura del Proyecto

```
MedicFamily/
├── backend/          # API Django + MySQL + JWT
├── frontend/         # Aplicación React
└── README.md
```

## Instalación y Ejecución

### Backend (Django)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py runserver
```

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

## Tecnologías

- **Backend**: Django, Django REST Framework, MySQL
- **Frontend**: React, Axios
- **Autenticación**: JWT (JSON Web Tokens)
