<div align="center">

# 🎈 El Globo API

### API REST para la gestión integral de un club social y deportivo

Construida con **NestJS**, **TypeORM** y **MySQL** — incluye autenticación JWT, control de acceso por roles (RBAC), categorización automática de socios y facturación mensual con tareas programadas.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

</div>

---

## 📋 Tabla de contenidos

- [Acerca del proyecto](#-acerca-del-proyecto)
- [Características principales](#-características-principales)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Puesta en marcha](#-puesta-en-marcha)
- [Uso de la API](#-uso-de-la-api)
- [Matriz de permisos (RBAC)](#-matriz-de-permisos-rbac)
- [Endpoints disponibles](#-endpoints-disponibles)
- [Tareas automáticas](#-tareas-automáticas)
- [Scripts disponibles](#-scripts-disponibles)
- [Solución de problemas](#-solución-de-problemas)
- [Créditos](#-créditos)

---

## 📖 Acerca del proyecto

**El Globo API** es el backend del sistema de gestión del Club Social y Deportivo *"El Globo"* (Rosario, Santa Fe): 1500 socios, 20 actividades deportivas, cobranza por zonas y un plan de grupo familiar, todo digitalizado en una única plataforma.

Reemplaza la gestión manual de socios, cuotas y actividades por una API pensada para alimentar tanto una **web de administración** interna como una **app móvil** de cara al público. Categoriza socios automáticamente, emite cupones de cobranza todos los meses, controla la morosidad y liquida a los cobradores sin intervención manual.

Desarrollado como Trabajo Práctico Final de **Práctica Profesionalizante II** — Instituto Superior de Computación Administrativa (ISCA4014)

## ✨ Características principales

- 🔐 **Autenticación segura** con contraseñas hasheadas (Bcrypt) y tokens JWT.
- 🛡️ **Control de acceso por roles (RBAC)** — Administrador, Cobrador, Instructor y Socio, cada uno con su alcance definido.
- 🧮 **Categorización automática de socios** (Cadete / Activo / Vitalicio) según edad y antigüedad, recalculada todos los meses.
- 👨‍👩‍👧 **Plan Grupo Familiar** — un matrimonio con hijos paga una cuota única y recibe un solo recibo.
- 🏋️ **Actividades deportivas** con inscripción de socios y listado de asistencia por horario para instructores.
- 🗄️ **Casilleros** — alquiler y liberación, con relación única socio-casillero.
- 💳 **Cobranza por zonas** (club + 3 cobradores) con emisión automática de cupones el día 1 de cada mes.
- ⏰ **Morosidad y recargos automáticos** — 5% de recargo en reemisiones, suspensión a los 2 meses consecutivos impagos.
- 🧾 **Liquidación semanal de cobradores** con cálculo automático de comisión (10%).
- ⚙️ **Parámetros configurables** — cuotas, recargos y comisiones editables sin tocar código.
- ✅ **Validación estricta de datos** con `class-validator` en cada petición entrante.
- 📚 **Documentación interactiva** con Swagger, probable desde el navegador.

## 🛠 Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [NestJS](https://nestjs.com/) | Framework principal del backend |
| [TypeScript](https://www.typescriptlang.org/) | Lenguaje de desarrollo |
| [TypeORM](https://typeorm.io/) | ORM para la comunicación con MySQL |
| [MySQL](https://www.mysql.com/) | Motor de base de datos |
| [JWT](https://jwt.io/) (passport-jwt) | Autenticación basada en tokens |
| [Bcrypt](https://www.npmjs.com/package/bcrypt) | Encriptación de contraseñas |
| [class-validator](https://github.com/typestack/class-validator) | Validación de DTOs |
| [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling) | Tareas automáticas (cron mensual) |
| [Swagger](https://swagger.io/) | Documentación interactiva de la API |

## 📁 Estructura del proyecto

```
src/
├── main.ts                  # Punto de entrada: CORS, Swagger, validaciones globales
├── app.module.ts             # Módulo raíz y conexión a la base de datos
│
├── auth/                     # Login, JWT, guards y control de roles
│   ├── strategies/               # Estrategia Passport-JWT
│   └── interfaces/                # Payload del usuario autenticado
├── users/                     # Cuentas de acceso (Socio/Instructor/Cobrador)
├── configuracion/              # Parámetros del sistema (cuotas, recargos, %)
├── socios/                     # ABMC de socios, categorización, listados
├── grupos-familiares/          # Plan Grupo Familiar
├── actividades/                # Actividades deportivas y asistencia
├── instructores/               # Gestión de instructores
├── inscripciones/              # Alta/baja de socios en actividades
├── cobradores/                 # Gestión de cobradores por zona
├── casilleros/                 # Alquiler y control de casilleros
├── cupones/                    # Emisión mensual, recargos, morosidad
│   └── cupones.scheduler.ts        # Cron mensual (día 1, 00:00)
├── rendiciones/                 # Liquidación semanal de cobradores
├── reportes/                    # Listados de salida (socios/asistencia/casilleros)
├── common/                      # Enums, guards, decoradores, utilidades
│   ├── guards/                      # JwtAuthGuard, RolesGuard
│   └── decorators/                   # @Roles, @Public, @CurrentUser
└── database/                    # Configuración de TypeORM y seed

database-mysql/
└── el_globo.sql               # Script de creación e importación (phpMyAdmin)
```

## ✅ Requisitos previos

Antes de instalar, asegurate de tener lo siguiente en tu computadora:

- [Node.js](https://nodejs.org/) v20 LTS o superior
- [MySQL](https://www.mysql.com/) (o alguna herramienta como XAMPP, WampServer o Laragon que lo incluya)
- Un cliente de MySQL para importar la base de datos: [phpMyAdmin](https://www.phpmyadmin.net/), [MySQL Workbench](https://www.mysql.com/products/workbench/), o consola
- Un cliente para probar la API: [Postman](https://www.postman.com/) o [Thunder Client](https://www.thunderclient.com/) (extensión de VS Code)

## 🚀 Instalación

**1. Cloná el repositorio**

```bash
git clone https://github.com/short884/el-globo-backend.git
cd el-globo-backend
```

**2. Instalá las dependencias**

```bash
npm install
```

**3. Creá la base de datos**

Abrí tu gestor de MySQL (por ejemplo phpMyAdmin) y:
1. Iniciá los servicios de tu servidor local (Apache + MySQL) hasta que queden en verde/online.
2. Pestaña **Importar**.
3. Seleccioná el archivo `database-mysql/el_globo.sql` incluido en el repositorio.
4. Click en **Continuar**.

Esto crea la base `el_globo` con sus 12 tablas, relaciones (FK) y los datos iniciales: parámetros de configuración, los 3 cobradores de zona, los 100 casilleros y un usuario Administrador.

## ⚙️ Configuración

Este proyecto usa variables de entorno para no exponer credenciales sensibles. 

Abrí el `.env` del repositorio y ajustá los valores según tu entorno local:

```env
# --- Base de datos MySQL ---
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=el_globo

# --- JWT ---
JWT_SECRET=PALABRA_SUPER_SECRETA_EL_GLOBO_2026
JWT_EXPIRES_IN=8h

# --- Servidor ---
PORT=3000

# --- Usuario administrador inicial (seed) ---
SEED_ADMIN_EMAIL=admin@elglobo.com.ar
SEED_ADMIN_PASSWORD=Admin123!
```

> 💡 **Tip:** si usás XAMPP con la configuración por defecto, generalmente `DB_USERNAME=root` y `DB_PASSWORD` vacío ya funciona sin cambios. Si usás **WampServer**, revisá el puerto real de tu MySQL (a veces no es el 3306 estándar) y ajustá `DB_PORT` en consecuencia.

## ▶️ Puesta en marcha

Con la base de datos importada y el `.env` configurado, levantá el servidor:

```bash
npm run start:dev
```

Si todo salió bien, vas a ver en la consola:

```
[Nest] LOG [NestApplication] Nest application successfully started
El Globo API escuchando en http://localhost:3000/api
Documentación Swagger en http://localhost:3000/api/docs
```

> 📚 A diferencia de un sitio web tradicional, esta es una **API REST pura**: no tiene interfaz visual propia. Para interactuar con ella usá Swagger (`/api/docs`), Postman o Thunder Client.

**Usuario administrador de prueba** (creado por el script SQL):

```
Correo:      admin@elglobo.com.ar
Contraseña:  Admin123!
```

## 📡 Uso de la API

Todos los endpoints están bajo el prefijo `/api`.

### 1. Iniciar sesión

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@elglobo.com.ar",
  "password": "Admin123!"
}
```

**Respuesta:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "userId": 1, "email": "admin@elglobo.com.ar", "role": "ADMIN" }
  },
  "timestamp": "2026-08-02T18:40:00.000Z"
}
```

### 2. Consumir rutas protegidas

Con el `accessToken` obtenido, agregalo en cada petición como header:

```http
GET /api/socios
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔒 Matriz de permisos (RBAC)

| Recurso | Ver (GET) | Crear (POST) | Editar (PATCH) | Eliminar (DELETE) |
|---|:---:|:---:|:---:|:---:|
| **Socios** | `admin` · `cobrador` · `instructor` · propio socio | `admin` | `admin` · propio socio | `admin` · propio socio (baja) |
| **Actividades** | Público | `admin` | `admin` | `admin` |
| **Inscripciones** | `admin` · `instructor` | `admin` · propio socio | — | `admin` · propio socio |
| **Casilleros** | `admin` | `admin` | `admin` | — |
| **Cobradores** | `admin` (y propio cobrador para su ficha) | `admin` | `admin` | `admin` |
| **Cupones** | `admin` · `cobrador` (su zona) · `socio` (propio) | — | `admin` · `cobrador` (pagar/devolver) | — |
| **Rendiciones** | `admin` · `cobrador` (propias) | `admin` · `cobrador` | — | — |
| **Configuración** | `admin` | — | `admin` | — |
| **Reportes** | `admin` · `cobrador`/`instructor` según listado | — | — | — |

## 🔗 Endpoints disponibles

<details>
<summary><strong>🔑 Autenticación</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión y obtener el token JWT | Público |
| `GET` | `/api/auth/me` | Ver los datos del usuario autenticado | Logueado |
| `PATCH` | `/api/auth/change-password` | Cambiar la propia contraseña | Logueado |

</details>

<details>
<summary><strong>👤 Socios</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/socios` | Dar de alta un socio | `admin` |
| `GET` | `/api/socios` | Listar socios (`?orden=alfabetico\|numero\|zona\|categoria\|antiguedad`) | `admin` · `cobrador` · `instructor` |
| `GET` | `/api/socios/me` | Ver mi propia ficha | `socio` |
| `GET` | `/api/socios/:id` | Ver un socio | `admin` · `cobrador` · `instructor` · propio socio |
| `PATCH` | `/api/socios/:id` | Editar un socio | `admin` · propio socio |
| `DELETE` | `/api/socios/:id` | Dar de baja (lógica) | `admin` · propio socio |
| `PATCH` | `/api/socios/:id/reactivar` | Reactivar un socio suspendido | `admin` |

</details>

<details>
<summary><strong>👨‍👩‍👧 Grupos familiares</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/grupos-familiares` | Crear grupo (titular + cónyuge + hijos) | `admin` |
| `GET` | `/api/grupos-familiares` | Listar grupos | `admin` |
| `GET` | `/api/grupos-familiares/:id` | Ver un grupo | `admin` |
| `DELETE` | `/api/grupos-familiares/:id/integrantes/:socioId` | Quitar un integrante del grupo | `admin` |

</details>

<details>
<summary><strong>🏋️ Actividades e inscripciones</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/actividades` | Vitrina pública de actividades | Público |
| `GET` | `/api/actividades/:id` | Ver una actividad | Público |
| `GET` | `/api/actividades/asistencia` | Listado de asistencia por horario | `admin` · `instructor` |
| `POST` | `/api/actividades` | Crear actividad | `admin` |
| `PATCH` | `/api/actividades/:id` | Editar actividad | `admin` |
| `DELETE` | `/api/actividades/:id` | Dar de baja actividad | `admin` |
| `POST` | `/api/inscripciones` | Inscribir a un socio en una actividad | `admin` · propio socio |
| `DELETE` | `/api/inscripciones/:id` | Dar de baja la inscripción | `admin` · propio socio |

</details>

<details>
<summary><strong>🗄️ Casilleros</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/casilleros` | Listar (`?orden=alfabetico\|numero`) | `admin` |
| `POST` | `/api/casilleros` | Crear casillero | `admin` |
| `PATCH` | `/api/casilleros/:id/alquilar/:socioId` | Alquilar a un socio | `admin` |
| `PATCH` | `/api/casilleros/:id/liberar` | Liberar casillero | `admin` |

</details>

<details>
<summary><strong>💳 Cupones y cobranza</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/cupones/generar-mensual` | Disparar la emisión mensual manualmente | `admin` |
| `GET` | `/api/cupones` | Listar (`?socioId=&estado=&periodo=`) | `admin` · `cobrador` · `socio` |
| `PATCH` | `/api/cupones/:id/pagar` | Marcar cupón como pagado | `admin` · `cobrador` |
| `PATCH` | `/api/cupones/:id/devolver` | Marcar cupón como devuelto | `admin` · `cobrador` |

</details>

<details>
<summary><strong>🧾 Rendiciones</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/rendiciones` | Presentar la rendición semanal | `admin` · `cobrador` |
| `GET` | `/api/rendiciones` | Listar rendiciones (`?cobradorId=`) | `admin` · `cobrador` |

</details>

<details>
<summary><strong>📊 Reportes</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/reportes/socios` | Listado de socios (multi-orden) | `admin` · `cobrador` |
| `GET` | `/api/reportes/asistencia-actividades` | Asistencia por actividad y horario | `admin` · `instructor` |
| `GET` | `/api/reportes/casilleros` | Ocupación de casilleros | `admin` |

</details>

<details>
<summary><strong>⚙️ Configuración</strong></summary>

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/configuracion` | Ver parámetros del sistema | `admin` |
| `PATCH` | `/api/configuracion` | Editar cuotas, recargos y comisión | `admin` |

</details>

## ⏰ Tareas automáticas

El día 1 de cada mes, a las 00:00, el sistema ejecuta automáticamente:

1. 🔄 Recalcula la categoría social de todos los socios activos.
2. 🚫 Aplica el control de morosidad del período anterior (suspende a quienes acumulan 2 meses consecutivos impagos).
3. 🧾 Emite los cupones nuevos del mes.
4. 💰 Reemite, con un **5% de recargo**, los cupones impagos del mes anterior (salvo socios ya suspendidos).

> Este proceso también puede dispararse manualmente en cualquier momento desde `POST /api/cupones/generar-mensual` (rol `admin`), útil para pruebas.

## 📜 Scripts disponibles

```bash
npm run start:dev              # Backend en modo desarrollo (hot-reload)
npm run start                  # Backend, corrida única
npm run build                  # Compila TypeScript a dist/
npm run start:prod             # Corre la versión compilada
npm run seed                   # Carga datos iniciales (alternativa al .sql)
npm run migration:generate     # Genera una migración de TypeORM
npm run migration:run          # Aplica migraciones pendientes
npm run lint                   # Corre ESLint
```

## 🩺 Solución de problemas

<details>
<summary><strong>Error: <code>AggregateError [ECONNREFUSED]</code> al levantar el backend</strong></summary>

MySQL no está corriendo, o está en un puerto distinto al configurado. Iniciá el servicio desde XAMPP/WampServer/Laragon y verificá el puerto real de tu instalación (en WampServer no siempre es el 3306 estándar). Ajustá `DB_PORT` en tu `.env` y reiniciá el backend.
</details>

<details>
<summary><strong>Error: <code>DataTypeNotSupportedError: Data type "Object" ... is not supported</code></strong></summary>

Una entidad tiene una columna sin `type` explícito en el decorador `@Column`, y TypeORM no pudo inferirlo desde TypeScript (típico en propiedades con unión `| null`). Solución: agregar el tipo explícito, por ejemplo `@Column({ type: 'int', nullable: true })`.
</details>

<details>
<summary><strong>Error: <code>Unknown database 'el_globo'</code></strong></summary>

No importaste el archivo `el_globo.sql`. Abrí phpMyAdmin, pestaña **Importar**, y seleccioná `database-mysql/el_globo.sql` del repositorio.
</details>

<details>
<summary><strong>Error: <code>Access denied for user 'root'</code></strong></summary>

El `DB_USERNAME` o `DB_PASSWORD` de tu `.env` no coinciden con tu configuración real de MySQL. Verificalos en el panel de tu servidor local.
</details>

<details>
<summary><strong>401 Unauthorized en rutas protegidas</strong></summary>

Te falta enviar el header <code>Authorization: Bearer &lt;token&gt;</code>, o el token expiró. Volvé a hacer login en <code>/api/auth/login</code> para obtener uno nuevo.
</details>

<details>
<summary><strong>403 Forbidden en rutas protegidas</strong></summary>

Tu token es válido, pero tu rol no tiene permiso para esa acción. Revisá la <a href="#-matriz-de-permisos-rbac">matriz de permisos</a>.
</details>

---

## 🎓 Créditos

Proyecto académico desarrollado en el marco de **Práctica Profesionalizante II** — Instituto Superior de Computación Administrativa (**ISCA4014**), Argentina.

Club Social y Deportivo *"El Globo"* — Pasco 2856, Rosario, Santa Fe.

<div align="center">

Hecho con 🎈 y NestJS

</div>
