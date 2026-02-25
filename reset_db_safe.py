#!/usr/bin/env python
"""
Script de limpieza segura de base de datos - NO ELIMINA LA BD
Limpia todas las tablas pero mantiene la estructura

Uso: python reset_db_safe.py
"""

import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medicfamily.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth.models import User
from appointments.models import Doctor, Patient, Specialty, Appointment, Availability

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def main():
    print_header("🗑️  LIMPIEZA DE BASE DE DATOS")
    
    print("\n⚠️  ADVERTENCIA: Esto eliminará todos los datos, pero mantendrá la estructura")
    response = input("¿Deseas continuar? (s/n): ").strip().lower()
    
    if response != 's':
        print("❌ Operación cancelada")
        return False
    
    try:
        print("\n🔄 Limpiando datos...")
        
        # Contar registros antes
        print("\n📊 Registros ANTES de limpiar:")
        print(f"   Usuarios: {User.objects.count()}")
        print(f"   Doctores: {Doctor.objects.count()}")
        print(f"   Pacientes: {Patient.objects.count()}")
        print(f"   Citas: {Appointment.objects.count()}")
        print(f"   Disponibilidades: {Availability.objects.count()}")
        print(f"   Especialidades: {Specialty.objects.count()}")
        
        # Eliminar datos en orden correcto (respetando foreign keys)
        print("\n🗑️  Eliminando registros...")
        
        Appointment.objects.all().delete()
        print("   ✅ Citas eliminadas")
        
        Availability.objects.all().delete()
        print("   ✅ Disponibilidades eliminadas")
        
        Doctor.objects.all().delete()
        print("   ✅ Doctores eliminados")
        
        Patient.objects.all().delete()
        print("   ✅ Pacientes eliminados")
        
        User.objects.all().exclude(username='admin').delete()
        print("   ✅ Usuarios eliminados (excepto admin)")
        
        Specialty.objects.all().delete()
        print("   ✅ Especialidades eliminadas")
        
        # Verificar después
        print("\n📊 Registros DESPUÉS de limpiar:")
        print(f"   Usuarios: {User.objects.count()}")
        print(f"   Doctores: {Doctor.objects.count()}")
        print(f"   Pacientes: {Patient.objects.count()}")
        print(f"   Citas: {Appointment.objects.count()}")
        print(f"   Disponibilidades: {Availability.objects.count()}")
        print(f"   Especialidades: {Specialty.objects.count()}")
        
        print_header("✅ LIMPIEZA COMPLETADA")
        print("\n💡 Ahora puedes ejecutar: python setup_database.py")
        return True
        
    except Exception as e:
        print(f"\n❌ Error durante la limpieza: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
