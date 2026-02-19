# Docker Setup - MedicFamily

## Requisitos previos
- Docker Desktop instalado
- Docker Compose instalado

## Configuración inicial

### 1. Copiar variables de ambiente
```bash
cp .env.example .env
```

### 2. Construir imágenes (primera vez)
```bash
docker-compose build
```

## Desarrollo (con hot-reload)

### Ejecutar en modo desarrollo
```bash
docker-compose -f docker-compose.dev.yml up
```

Acceder a:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MySQL**: localhost:3306

### Detener contenedores
```bash
docker-compose -f docker-compose.dev.yml down
```

### Ver logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

## Producción (build optimizado)

### Ejecutar en modo producción
```bash
docker-compose up
```

## Comandos útiles

### Ejecutar comandos Django
```bash
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
docker-compose -f docker-compose.dev.yml exec backend python manage.py makemigrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
```

### Limpiar volúmenes y contenedores
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### Reconstruir imágenes ignorando cache
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
```

## Troubleshooting

### Puerto 3000 ya está en uso
```bash
# En Windows, encontrar proceso en puerto 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### La base de datos no se conecta
- Esperar a que MySQL esté listo (mira los logs)
- Verificar que `DB_HOST=db` en la configuración
- Asegurar que la red `medicfamily_network` existe

### Hot-reload no funciona en frontend
- Agregar `WATCHPACK_POLLING=true` al .env (ya está en docker-compose.dev.yml)
- En Windows con WSL2, esto puede ser lento
