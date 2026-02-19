# MedicFamily - Docker Setup Guide

Este documento explica cómo ejecutar el proyecto MedicFamily con Docker.

## Requisitos Previos

- **Docker** instalado ([Descargar](https://www.docker.com/products/docker-desktop))
- **Docker Compose** instalado (viene con Docker Desktop)
- Puerto 3306 (MySQL), 8000 (Backend) y 3000 (Frontend) disponibles

## Estructura de Docker

```
MedicFamily/
├── docker-compose.yml          # Orquestación de servicios
├── backend/
│   ├── Dockerfile              # Imagen para Django
│   ├── .dockerignore           # Archivos a ignorar
│   └── ...
├── frontend/
│   ├── Dockerfile              # Imagen para React
│   ├── .dockerignore           # Archivos a ignorar
│   └── ...
```

## Instrucciones para Ejecutar con Docker

### 1. **Construir y Iniciar los Contenedores**

```bash
docker-compose up --build
```

Este comando:
- Descarga las imágenes base (Python 3.11, Node 20, MySQL 8.0)
- Construye las imágenes de backend y frontend
- Crea y inicia 3 contenedores: MySQL, Django, React
- Aplica automáticamente las migraciones
- Expone los servicios en los puertos especificados

### 2. **Acceder a los Servicios**

Una vez que todo esté corriendo:

- **Frontend (React):** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin
- **MySQL:** localhost:3306

### 3. **Crear Superusuario (Primera vez)**

Si necesitas crear un superusuario para el admin:

```bash
docker-compose exec backend python manage.py createsuperuser
```

Sigue las instrucciones en la terminal.

### 4. **Comandos Útiles**

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Acceder a la consola del backend
docker-compose exec backend bash

# Acceder a MySQL
docker-compose exec db mysql -u medicfamily_user -pmedicfamily_pass medicfamily

# Detener los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: Elimina la BD)
docker-compose down -v

# Reiniciar los servicios
docker-compose restart

# Reconstruir imágenes sin cache
docker-compose build --no-cache
```

## Variables de Entorno

El proyecto usa estas variables (definidas en `docker-compose.yml`):

### Backend
- `DEBUG=True` - Modo desarrollo
- `DB_ENGINE=django.db.backends.mysql` - Motor de BD
- `DB_NAME=medicfamily` - Nombre de BD
- `DB_USER=medicfamily_user` - Usuario MySQL
- `DB_PASSWORD=medicfamily_pass` - Contraseña MySQL
- `DB_HOST=db` - Host del contenedor MySQL
- `DB_PORT=3306` - Puerto MySQL

### Frontend
- `REACT_APP_API_URL=http://localhost:8000` - URL de la API

## Solución de Problemas

### Error: "port 3306 is already in use"
```bash
# Cambiar puerto en docker-compose.yml
# De: "3306:3306"
# A:  "3307:3306"  (o cualquier puerto disponible)
```

### Error: "Unknown database 'medicfamily'"
```bash
# Ejecutar migraciones manualmente
docker-compose exec backend python manage.py migrate
```

### Necesito resetear la base de datos
```bash
docker-compose down -v
docker-compose up --build
```

### Los cambios en el código no se reflejan
```bash
# Los volúmenes están configurados automáticamente
# Los cambios debería reflejarse en tiempo real
# Si no ocurre, reinicia:
docker-compose restart
```

## Datos de Acceso por Defecto

**MySQL:**
- Usuario: `medicfamily_user`
- Contraseña: `medicfamily_pass`
- Base de datos: `medicfamily`

**Root MySQL:**
- Usuario: `root`
- Contraseña: `admin123`

## Arquitectura

```
┌─────────────────────────────────────────┐
│         MEDICFAMILY PROJECT             │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (React)    Backend (Django)   │
│  Port: 3000          Port: 8000         │
│  ├─ Components       ├─ REST API        │
│  ├─ Pages           ├─ Models          │
│  └─ API Client      └─ Serializers     │
│                                         │
│          ↓                     ↑        │
│    ─────────────────────────────        │
│              MySQL Database             │
│              Port: 3306                 │
│              Database: medicfamily      │
│                                         │
└─────────────────────────────────────────┘
```

## Próximos Pasos

1. Build y ejecuta: `docker-compose up --build`
2. Accede a http://localhost:3000
3. Inicia sesión o crea una cuenta
4. ¡Disfruta!

Para más información sobre Docker, consulta la [documentación oficial](https://docs.docker.com/).
