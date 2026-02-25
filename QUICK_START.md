# 🚀 QUICK START - MedicFamily Dashboard

## Resumen de lo que hicimos

✅ **Creamos un dashboard completo para doctores** con:
- Sidebar con 8 opciones
- Calendario para agendar pacientes
- Sistema de mensajes
- Historial de pacientes
- Y más...

✅ **Arreglamos los problemas de registro y login**:
- Las restricciones de BD que impedían guardar datos
- Los errores de validación en el backend
- El manejo de errores en el frontend

---

## 🔧 Configuración Inicial (SOLO PRIMERA VEZ)

### Paso 1: Verificar que todo esté listo
```powershell
# En la carpeta raíz del proyecto
python verify_setup.py
```

### Paso 2: Configurar la base de datos
```powershell
# En la carpeta raíz del proyecto
python setup_database.py
```

Esto hará automáticamente:
- ✅ Aplicar todas las migraciones
- ✅ Crear las especialidades médicas
- ✅ Crear un usuario de prueba
- ✅ Crear un perfil de doctor

**Usuario de prueba que se crea:**
```
Username: doctortest
Email: doctor@test.com
Password: TestPassword123
```

---

## ▶️ Ejecutar el Proyecto

### Terminal 1: Backend Django
```powershell
cd backend
python manage.py runserver
```

**Esperado:**
```
Starting development server at http://127.0.0.1:8000/
```

### Terminal 2: Frontend React
```powershell
cd frontend
npm start
```

**Esperado:**
```
Compiled successfully!
Local:            http://localhost:3000
```

---

## 🧪 Probar el Sistema

### 1️⃣ Verificar el Admin de Django
```
URL: http://localhost:8000/admin

Username: doctortest
Password: TestPassword123
```

Aquí puedes ver:
- Usuarios creados
- Doctores registrados
- Especialidades
- Citas creadas

### 2️⃣ Probar Login
```
URL: http://localhost:3000/login

Email: doctor@test.com
Password: TestPassword123
```

Abre la consola del navegador (F12) y verás logs de lo que está pasando.

### 3️⃣ Acceder al Dashboard
Después del login, deberías ir automáticamente a:
```
http://localhost:3000/doctor/dashboard
```

**En el dashboard verás:**
- 📊 Overview (estadísticas)
- 📅 Calendario (agendar pacientes)
- 💬 Mensajes (comunicación)
- 👥 Historial de Pacientes
- 👤 Mi Perfil
- ⏰ Disponibilidad
- 📈 Reportes
- ⚙️ Configuración

---

## 🧹 Si necesitas Resetear la BD

```powershell
# En la carpeta raíz
python reset_db_safe.py
```

Luego vuelve a ejecutar:
```powershell
python setup_database.py
```

---

## 📊 Estructura que Creamos

```
MedicFamily/
├── setup_database.py          ← Configura BD + usuario de prueba
├── reset_db_safe.py           ← Limpia todo (pero guarda estructura)
├── verify_setup.py            ← Verifica que todo esté ok
│
├── backend/
│   ├── appointments/
│   │   ├── models.py          ✅ ARREGLADO (unique=True removido)
│   │   ├── serializers.py     ✅ ARREGLADO (sin hardcoded TEMP_)
│   │   ├── views.py           ✅ MEJORADO (con logs)
│   │   └── urls.py
│   ├── medicfamily/
│   │   └── settings.py
│   └── manage.py
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── DoctorDashboard.js         ✨ NUEVO
        │   ├── DoctorRegister.js          ✅ MEJORADO
        │   └── Login.js
        └── components/
            ├── dashboard/
            │   ├── DashboardOverview.js   ✨ NUEVO
            │   ├── DoctorCalendar.js      ✨ NUEVO
            │   ├── DoctorMessages.js      ✨ NUEVO
            │   ├── PatientHistory.js      ✨ NUEVO
            │   ├── DoctorProfile.js       ✨ NUEVO
            │   ├── DoctorAvailability.js  ✨ NUEVO
            │   ├── Reports.js             ✨ NUEVO
            │   └── Settings.js            ✨ NUEVO
            └── ...otros componentes
```

---

## 🐛 Debugging

### Ver logs del backend
Abre `backend/` y busca los prints con emojis:
- 📝 = Datos recibidos
- 📤 = Enviando respuesta
- ✅ = Éxito
- ❌ = Error

### Ver logs del frontend
Abre la consola del navegador (F12 → Console) después de intentar registrarte o hacer login.

### Si el login no funciona:
1. Abre DevTools (F12)
2. Tab Network
3. Intenta login
4. Busca la petición `login/`
5. Verifica el Status Code (200 = ok, 400/401 = error)
6. Mira el response para ver el error

---

## 🚨 Errores Comunes

### Error: "usuario no encontrado" en login
**Solución:** Asegúrate de que el usuario existe:
```powershell
cd backend
python shell
>>> from django.contrib.auth.models import User
>>> User.objects.all()  # Verás los usuarios registrados
```

### Error: "La BD está bloqueada"
**Solución:** Reinicia el servidor Django

### Error: "CORS error"
**Solución:** Verifica que `CORS_ALLOWED_ORIGINS` en `backend/medicfamily/settings.py` incluya `http://localhost:3000`

### Dashboard blank después de login
**Solución:** 
1. Abre DevTools (F12)
2. Tab Console
3. Busca errores rojos
4. Reporta el error exacto

---

## 📞 Flujo Completo de Uso

```
1. Usuario nuevo
   ↓
2. Va a /register/doctor
   ↓
3. Rellena formulario
   ↓
4. Submit
   ↓
5. Backend valida con DoctorRegisterSerializer
   ↓
6. Crea User + Doctor en BD
   ↓
7. Devuelve tokens (access + refresh)
   ↓
8. Frontend guarda en localStorage
   ↓
9. Redirect a /doctor/dashboard
   ↓
10. Dashboard carga con datos del doctor
```

---

## ✅ Checklist de Verificación

- [ ] `python verify_setup.py` pasa sin errores
- [ ] `python setup_database.py` crea usuario de prueba
- [ ] Django backend inicia en puerto 8000
- [ ] React frontend inicia en puerto 3000
- [ ] Puedo viewar admin en http://localhost:8000/admin
- [ ] Puedo hacer login en http://localhost:3000/login
- [ ] Veo dashboard después de login
- [ ] Puedo ver las 8 opciones del dashboard
- [ ] Console no tiene errores rojos (F12)

---

## 📝 Notas

- Los tokens se guardan en `localStorage` con claves: `access_token`, `refresh_token`
- El dashboard es responsivo (funciona en mobile, tablet, desktop)
- Los datos son mock por ahora (calendario, mensajes, etc.) para demostración
- Puedes agregar más datos en el admin de Django

---

## 🎯 Resumen de Cambios Realizados

### Backend (Django)

**models.py - Doctor**
```python
# ANTES: unique=True (causaba errores)
license_number = models.CharField(unique=True)
medical_registration = models.CharField(unique=True)

# AHORA: Opcional (permite múltiples doctores sin estos valores)
license_number = models.CharField(blank=True, null=True)
medical_registration = models.CharField(blank=True, null=True)
```

**views.py - register_doctor**
```python
# AGREGAMOS: Logs detallados de cada paso
print(f"📝 Datos recibidos: {request.data}")
print(f"✅ Usuario creado: {user.username}")
print(f"❌ Error: {e}")  # Si hay error
```

**serializers.py - DoctorRegisterSerializer**
```python
# ELIMINAMOS: Hardcoded TEMP_{user.id} values
# ANTES: license_number = f"TEMP_{user.id}"
# AHORA: Omitimos el campo (queda blank/null)
```

### Frontend (React)

**DoctorRegister.js**
```javascript
// AGREGAMOS: Logs bonitos con emojis
console.log("📝 Enviando formulario...");
console.log("✅ Registro exitoso!");
console.log("❌ Error:", error.message);

// ARREGLAMOS: Guardar user data en localStorage
localStorage.setItem('user', JSON.stringify(userData));

// ARREGLAMOS: Redirect al dashboard
navigate('/doctor/dashboard');
```

**DoctorDashboard.js** - ✨ NUEVO
- Componente principal del dashboard
- Sidebar con 8 opciones
- Lógica de navegación entre secciones
- Botón de logout

---

¿Preguntas? Lee TROUBLESHOOTING_REGISTRO.md o DOCKER_GUIDE.md

¡Listo para empezar! 🚀
