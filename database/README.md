# 🗄️ Base de Datos - Club Social y Deportivo "El Globo"

Este directorio contiene el script SQL de creación de la base de datos MySQL con su esquema relacional completo (12 tablas) y datos iniciales de catálogo.

## 📋 Archivos

- `el_globo.sql`: Script completo con sentencias `CREATE DATABASE`, `CREATE TABLE`, claves primarias, claves foráneas y registros base de configuración, cobradores de zona y los 100 casilleros.

---

## 🚀 Cómo importar la base de datos

### Opción A: Vía phpMyAdmin (XAMPP / WampServer / Laragon)

1. Abrí tu panel de control de servidor local e iniciá el servicio **MySQL** (y **Apache**).
2. Ingresá a [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Hacé click en la pestaña **Importar** en la barra superior.
4. Hacé click en **Examinar / Seleccionar archivo** y elegí el archivo `el_globo.sql` de esta carpeta.
5. Dejá las opciones predeterminadas y hacé click en el botón **Continuar** (al final de la página).
6. ¡Listo! Quedará creada la base de datos `el_globo` con todas sus tablas, restricciones y el usuario administrador inicial.

---

### Opción B: Vía Consola / Terminal MySQL

```bash
# Si tu usuario root no tiene contraseña:
mysql -u root -p < database/el_globo.sql

# O especificando puerto (por ejemplo 3306 o 3308):
mysql -u root -P 3306 -p < database/el_globo.sql
```

---

## 🔑 Usuario Administrador Inicial

Una vez importada la base de datos, el sistema cuenta con el siguiente usuario administrador precargado con contraseña hasheada en Bcrypt:

- **Correo electrónico:** `admin@elglobo.com.ar`
- **Contraseña:** `Admin123!`
- **Rol:** `ADMIN`
