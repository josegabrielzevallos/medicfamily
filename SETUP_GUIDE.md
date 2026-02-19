# MedicFamily - Setup Guide

## Requisitos Previos

- Python 3.8+
- Node.js 14+
- npm o yarn
- MySQL Server
- Git

## Estructura del Proyecto

```
MedicFamily/
├── backend/          # API REST Django
│   ├── manage.py
│   ├── medicfamily/  # Configuración principal
│   ├── apps/         # Apps de Django
│   └── requirements.txt
├── frontend/         # Aplicación React
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env
└── README.md
```

## Instalación del Backend

### 1. Navegar al directorio backend
```bash
cd backend
```

### 2. Crear entorno virtual
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar la base de datos
- Editar `.env` con tus credenciales MySQL
- Crear la base de datos:
```bash
mysql -u root -p
> CREATE DATABASE medicfamily CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> EXIT;
```

### 5. Realizar migraciones
```bash
python manage.py migrate
```

### 6. Crear superusuario
```bash
python manage.py createsuperuser
```

### 7. Ejecutar servidor Django
```bash
python manage.py runserver
```

El servidor estará disponible en: `http://localhost:8000`
Admin: `http://localhost:8000/admin`

## Instalación del Frontend

### 1. Navegar al directorio frontend
```bash
cd frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## Próximos Pasos

1. **Crear apps de Django** para tus modelos (usuarios, citas, registros médicos, etc.)
2. **Crear componentes React** para las diferentes vistas
3. **Implementar autenticación JWT**
4. **Crear formularios de entrada de datos**
5. **Implementar validaciones**

## Comandos Útiles

### Backend
```bash
# Crear nueva app
python manage.py startapp nombre_app

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar tests
python manage.py test
```

### Frontend
```bash
# Instalar nuevo paquete
npm install nombre_paquete

# Build para producción
npm run build

# Ejecutar tests
npm test
```

## Troubleshooting

### Error de conexión a MySQL
- Verifica que MySQL está corriendo
- Revisa las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error de módulos en Django
- Desactiva el venv y vuelve a activarlo
- Reinstala los requisitos: `pip install -r requirements.txt`

### Error en React con npm install
- Borra `node_modules` y `package-lock.json`
- Ejecuta `npm cache clean --force`
- Vuelve a ejecutar `npm install`

## Recursos

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [JWT en Django](https://django-rest-framework-simplejwt.readthedocs.io/)

---

¡Listo para empezar a desarrollar! 🚀
