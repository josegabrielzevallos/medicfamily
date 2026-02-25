#!/usr/bin/env python
"""
Script de configuración de base de datos para MedicFamily
Ejecuta este script para:
1. Aplicar todas las migraciones
2. Crear un usuario de prueba
3. Verificar la conexión

Uso: python setup_database.py
"""

import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medicfamily.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth.models import User
from appointments.models import Doctor, Specialty

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def print_step(number, text):
    print(f"\n➡️  PASO {number}: {text}")

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def main():
    print_header("🏥 CONFIGURACIÓN DE MEDICFAMILY")
    
    # PASO 1: Aplicar migraciones
    print_step(1, "Aplicando migraciones de base de datos...")
    try:
        call_command('migrate', verbosity=0)
        print_success("Migraciones aplicadas correctamente")
    except Exception as e:
        print_error(f"Error en migraciones: {e}")
        return False
    
    # PASO 2: Crear especialidades
    print_step(2, "Creando especialidades médicas...")
    specialties = [
        'Cardiología',
        'Dermatología',
        'Pediatría',
        'Psicología',
        'Odontología',
        'Oftalmología',
        'Traumatología',
        'Neurología',
        'Medicina General',
    ]
    
    created_count = 0
    for name in specialties:
        spec, created = Specialty.objects.get_or_create(name=name)
        if created:
            created_count += 1
    
    print_success(f"Especialidades: {Specialty.objects.count()} en total ({created_count} nuevas)")
    
    # PASO 3: Crear usuario de prueba
    print_step(3, "Creando usuario de prueba...")
    
    test_username = 'doctortest'
    test_email = 'doctor@test.com'
    test_password = 'TestPassword123'
    
    try:
        user, created = User.objects.get_or_create(
            username=test_username,
            defaults={
                'email': test_email,
                'first_name': 'Juan',
                'last_name': 'Pérez Test',
            }
        )
        
        if created:
            user.set_password(test_password)
            user.save()
            print_success(f"Usuario creado: {test_username}")
        else:
            print_success(f"Usuario ya existe: {test_username}")
        
        # Crear perfil de doctor
        doctor, created = Doctor.objects.get_or_create(
            user=user,
            defaults={
                'specialty': Specialty.objects.first(),
                'phone': '987654321',
                'address': 'Lima',
            }
        )
        
        if created:
            print_success("Perfil de doctor creado")
        else:
            print_success("Perfil de doctor ya existe")
            
    except Exception as e:
        print_error(f"Error creando usuario de prueba: {e}")
        return False
    
    # PASO 4: Verificación final
    print_step(4, "Verificando base de datos...")
    
    try:
        users_count = User.objects.count()
        doctors_count = Doctor.objects.count()
        specialties_count = Specialty.objects.count()
        
        print_success(f"Usuarios registrados: {users_count}")
        print_success(f"Doctores: {doctors_count}")
        print_success(f"Especialidades: {specialties_count}")
        
    except Exception as e:
        print_error(f"Error en verificación: {e}")
        return False
    
    # Resumen final
    print_header("✅ CONFIGURACIÓN COMPLETADA")
    print(f"""
📝 USUARIO DE PRUEBA:
   Username: {test_username}
   Email:    {test_email}
   Password: {test_password}

🚀 PRÓXIMOS PASOS:
   1. Levanta el servidor Django:
      python manage.py runserver
   
   2. Accede al admin de Django:
      http://localhost:8000/admin
      (Username: {test_username}, Password: {test_password})
   
   3. Levanta el servidor React (en otra terminal):
      cd frontend
      npm start
   
   4. Prueba el login en:
      http://localhost:3000/login
      (Usa las credenciales de arriba)
   
   5. Accede al dashboard:
      http://localhost:3000/doctor/dashboard

📊 BASE DE DATOS:
   Usuarios:        {users_count}
   Doctores:        {doctors_count}
   Especialidades:  {specialties_count}

💡 NOTA:
   Si necesitas resetear la BD, ejecuta:
   python reset_db_safe.py
    """)
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
