<div align="center">

# 🎈 Club Social y Deportivo "El Globo"
### Sistema de Gestión Integral • Frontend React + Backend NestJS + MySQL

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

<br />

**Trabajo Final de Práctica Profesionalizante II — Instituto Superior de Computación Administrativa (ISCA4014)**  
*Autores:* Caccia, Cainelli, Lapenta, Olmos.

</div>

---

## 📖 Acerca del proyecto

El sistema informatiza y centraliza la operatoria integral del **Club Social y Deportivo "El Globo"** (Rosario, Santa Fe): administración de socios, categorización automática por edad y antigüedad, actividades deportivas federadas, arrendamiento de casilleros, emisión mensual de cupones de cobranza, liquidación a cobradores domiciliarios por zonas y control estricto de morosidad con recargos.

Este repositorio está organizado como una solución Fullstack modular, conectando directamente el cliente web en **React + Vite** con la API REST en **NestJS + TypeORM + MySQL**.

---

## 📁 Estructura del repositorio

```text
el-globo-sistema/
├── backend/                  # Servidor de API REST (NestJS, TypeORM, Swagger)
│   ├── src/                  # Módulos de dominio, controladores, servicios y DTOs
│   ├── .env.example          # Plantilla de variables de entorno del servidor
│   ├── package.json          # Dependencias y scripts de backend
│   └── tsconfig.json         # Configuración de compilación TypeScript
│
├── frontend/                 # Aplicación Web SPA (React 19, TypeScript, Tailwind)
│   ├── src/                  # Componentes, contexto, llamadas API y vistas
│   │   ├── api/              # Cliente HTTP centralizado y endpoints conectados
│   │   ├── components/       # Componentes de UI (Padrón, Cupones, Casilleros, etc.)
│   │   ├── context/          # Sesión JWT y estado conectado a la API
│   │   └── types.ts          # Interfaces y contratos de datos
│   ├── .env.example          # Variables de entorno frontend (VITE_API_URL)
│   ├── vite.config.ts        # Configuración de Vite (puerto 5173 y proxy /api)
│   └── package.json          # Dependencias y scripts de frontend
│
├── database/                 # Base de datos relacional MySQL
│   ├── el_globo.sql          # Script DDL/DML con las 12 tablas y datos iniciales
│   └── README.md             # Guía paso a paso para importar en phpMyAdmin
│
├── .gitignore                # Reglas de exclusión de git (node_modules, .env, dist)
├── package.json              # Scripts raíz para instalar y ejecutar ambos entornos
└── README.md                 # Documentación técnica completa
```

---

## 🎯 Requerimientos funcionales implementados

| Requerimiento | Descripción | Módulo Frontend | Endpoint Backend |
|---|---|---|---|
| **R1 - Seguridad & RBAC** | Autenticación JWT y matriz de roles (Admin, Cobrador, Instructor, Socio, Público). | `LoginModal.tsx`, `Navbar.tsx` | `POST /api/auth/login`<br>`GET /api/auth/me` |
| **R2 - Categorización** | Cálculo dinámico: Cadete (<18), Activo (≥18) y Vitalicio (>30 años ininterrumpidos). | `SocioList.tsx`, `SocioPortal.tsx` | `GET /api/socios` |
| **R3 - ABMC Socios** | Alta, baja lógica, modificación y consulta con DNI y correo únicos. | `SocioList.tsx`, `SocioFormModal.tsx` | `POST /api/socios`<br>`PATCH /api/socios/:id`<br>`DELETE /api/socios/:id` |
| **R4 - Grupo Familiar** | Recibo grupal único con cónyuge e hijos asociados. | `FamiliarModal.tsx` | `POST /api/grupos-familiares` |
| **R5 - Actividades** | Disciplinas con turnos, cupos, profesores y listado de asistencia. | `ActividadesShowcase.tsx`, `AsistenciaTracker.tsx` | `GET /api/actividades`<br>`POST /api/inscripciones` |
| **R6 - Casilleros** | Grilla de 100 casilleros con alquiler y liberación exclusiva 1:1. | `CasillerosGrid.tsx` | `GET /api/casilleros`<br>`PATCH /api/casilleros/:id/alquilar/:socioId`<br>`PATCH /api/casilleros/:id/liberar` |
| **R7 - Cobranza por Zonas** | Sede central (Zona 0) y recorridos domiciliarios (Zonas 1, 2 y 3). | `CobranzaZones.tsx` | `GET /api/cupones?zona=` |
| **R8 - Cupones Mensuales** | Facturación detallada: cuota + actividades + casillero + recargos. | `CobranzaZones.tsx`, `ReciboModal.tsx` | `POST /api/cupones/generar-mensual`<br>`PATCH /api/cupones/:id/pagar` |
| **R9 - Rendición Semanal** | Liquidación de cobrador con cálculo automático del 10% de comisión. | `RendicionCobrador.tsx` | `GET /api/rendiciones`<br>`POST /api/rendiciones` |
| **R10 - Control Morosidad** | Suspensión automática a los 2 meses consecutivos impagos. | `MorosidadControl.tsx` | `GET /api/socios?estado=SUSPENDIDO`<br>`PATCH /api/socios/:id/reactivar` |
| **R11 - Recargo por Mora** | Reemisión de cupones impagos con recargo automático del 5%. | `CobranzaZones.tsx`, `MorosidadControl.tsx` | `PATCH /api/cupones/:id/devolver` |

---

## 🛠 Requisitos previos

- **Node.js**: v20 LTS o superior instalado.
- **MySQL**: Servidor MySQL / MariaDB (a través de **XAMPP**, **WampServer**, **Laragon** o Docker).
- **phpMyAdmin** o cliente MySQL (Workbench, DBeaver o consola) para importar el script de base de datos.
- **Git**: Para el control de versiones.

---

## 🚀 Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/el-globo-sistema.git
cd el-globo-sistema
```

### 2. Importar la Base de Datos MySQL

1. Abrí tu panel de **XAMPP / WampServer** e iniciá **Apache** y **MySQL**.
2. Ingresá a [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Hacé click en la pestaña **Importar**.
4. Seleccioná el archivo `database/el_globo.sql` del repositorio.
5. Hacé click en **Continuar**.
6. Esto creará la base de datos `el_globo` con sus 12 tablas, los parámetros iniciales de cuotas, los 3 cobradores de zona, los 100 casilleros y el usuario administrador inicial.

### 3. Configuración de Variables de Entorno

#### Backend (`backend/.env`)
Creá o verificá el archivo `backend/.env` (podés guiarte con `backend/.env.example`):

```env
NODE_ENV=development
PORT=3000

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306        # Si usás otro puerto como 3308, cambialo aquí
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=el_globo

# Seguridad JWT
JWT_SECRET=super_secreto_el_globo_club_social_2026
JWT_EXPIRES_IN=8h

# Seed administrador
SEED_ADMIN_EMAIL=admin@elglobo.com.ar
SEED_ADMIN_PASSWORD=Admin123!
```

#### Frontend (`frontend/.env`)
Verificá que el archivo `frontend/.env` apunte a la API de NestJS:

```env
VITE_API_URL=http://localhost:3000/api
```

---

### 4. Instalar Dependencias

Podés instalar las dependencias de ambos proyectos desde la raíz:

```bash
npm run install:all
```

*(O de forma individual con `cd backend && npm install` y `cd frontend && npm install`).*

---

### 5. Iniciar el Sistema

En dos terminales separadas (o mediante los scripts de la raíz):

#### Terminal 1 — Backend (NestJS):
```bash
npm run dev:backend
# o también: cd backend && npm run start:dev
```
> El backend iniciará en: **http://localhost:3000/api**  
> Documentación interactiva Swagger: **http://localhost:3000/api/docs**

#### Terminal 2 — Frontend (React + Vite):
```bash
npm run dev:frontend
# o también: cd frontend && npm run dev
```
> La aplicación web abrirá en: **http://localhost:5173**

### Integración Frontend/API

El frontend valida el token guardado con `GET /api/auth/me` y envía `Authorization: Bearer <token>` en las peticiones autenticadas. Los datos de socios, actividades, casilleros, cupones y rendiciones se consultan en Nest según los permisos del rol; las altas/ediciones/bajas de socios, alquiler de casilleros, inscripciones, pagos y creación de rendiciones usan sus endpoints correspondientes.

Las entidades servidas por la API no usan datos de demostración de `localStorage`. Si la API o MySQL no están disponibles, la pantalla informa que no pudo cargar los datos. El registro público de socios, la edición de asistencias, la reserva de casilleros y la aprobación de rendiciones requieren endpoints que todavía no existen; la emisión individual de cupones tampoco está disponible (Nest ofrece emisión mensual por lote).

---

## 🔑 Credenciales de Acceso

El sistema cuenta con cuentas oficiales listas para probar la matriz de permisos RBAC:

| Rol | Correo Electrónico | Contraseña | Alcance de Permisos |
|---|---|---|---|
| **Administrador** | `admin@elglobo.com.ar` | `Admin123!` | Acceso irrestricto: Padrón, deportes, 100 casilleros, cobranza, morosidad y configuración. |
| **Cobrador Zona 1** | `perez.cobrador@elglobo.com.ar` | `Cobrador123!` | Visualización de cupones de Zona 1, cobro y rendición semanal del 10%. |
| **Socio** | *(Generado al dar de alta un socio)* | — | Autogestión: Carnet social digital, estado de cuenta y consulta de deportes. |
| **Público / Invitado** | *(Sin credenciales)* | — | Vitrina de actividades deportivas e información institucional del club. |

> 💡 En el modal **Ingresar**, los botones de credenciales de prueba autocompletan el formulario; el acceso se valida contra la base de datos del backend.

---

## 📤 Instrucciones para subir a GitHub

Para publicar esta carpeta en un nuevo repositorio de GitHub:

1. Creá un repositorio vacío en [GitHub](https://github.com/new) (sin inicializar con README ni .gitignore).
2. En la terminal, dentro de la carpeta `el-globo-sistema`:

```bash
git init
git add .
git commit -m "feat: Sistema de Gestión Integral Club El Globo (Fullstack)"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

---

## 🎓 Créditos y Marco Académico

Desarrollado para el Trabajo Final de **Práctica Profesionalizante II**  
**Instituto Superior de Computación Administrativa (ISCA4014)**  
Rosario, Santa Fe, Argentina.
