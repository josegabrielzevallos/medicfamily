FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip setuptools wheel

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --no-input --settings=medicfamily.settings || true

# Expose port (Cloud Run inyecta $PORT en runtime)
EXPOSE 8080

# Ejecuta migraciones (ignora errores si la DB no está lista) y arranca gunicorn
CMD sh -c "python manage.py migrate --no-input 2>&1 || echo 'WARNING: migrate failed, starting anyway'; gunicorn medicfamily.wsgi:application --bind 0.0.0.0:${PORT:-8080} --workers 2 --timeout 120"
