-- =====================================================================
-- El Globo - Club Social y Deportivo
-- Script de creación de base de datos (MySQL 8+) para importar vía phpMyAdmin
-- Trabajo Final de Práctica Profesionalizante II - ISCA4014
--
-- Cómo usarlo en phpMyAdmin:
--   1) Crear una base de datos vacía llamada "el_globo" (cotejamiento
--      utf8mb4_unicode_ci), o dejar que este script la cree con el CREATE
--      DATABASE de abajo.
--   2) Pestaña "Importar" -> elegir este archivo -> Continuar.
--   3) Listo: quedan creadas las 12 tablas y cargados los datos iniciales
--      (configuración, cobradores de zona, 100 casilleros y el usuario
--      Administrador).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `el_globo`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `el_globo`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Tabla: configuracion (parámetros generales del club, fila única)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `configuracion`;
CREATE TABLE `configuracion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cuotaCadete` DECIMAL(12,2) NOT NULL DEFAULT 35000.00,
  `cuotaActivo` DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
  `cuotaVitalicio` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `cuotaGrupoFamiliar` DECIMAL(12,2) NOT NULL DEFAULT 80000.00,
  `costoCasillero` DECIMAL(12,2) NOT NULL DEFAULT 2500.00,
  `recargoMorosidad` DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  `comisionCobrador` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  `edadMinimaActivo` INT NOT NULL DEFAULT 18,
  `edadMinimaVitalicio` INT NOT NULL DEFAULT 60,
  `antiguedadMinimaVitalicio` INT NOT NULL DEFAULT 30,
  `mesesConsecutivosParaMorosidad` INT NOT NULL DEFAULT 2,
  `totalCasilleros` INT NOT NULL DEFAULT 100,
  `totalActividades` INT NOT NULL DEFAULT 20,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: grupos_familiares (R4 - Plan Grupo Familiar)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `grupos_familiares`;
CREATE TABLE `grupos_familiares` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cuotaGrupal` DECIMAL(12,2) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: instructores
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `instructores`;
CREATE TABLE `instructores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `apellido` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(255) NULL,
  `sueldo` DECIMAL(12,2) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_instructores_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: cobradores (R7/R9 - Zonas de cobranza)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `cobradores`;
CREATE TABLE `cobradores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `apellido` VARCHAR(255) NOT NULL,
  `correo` VARCHAR(255) NOT NULL,
  `zona` TINYINT NOT NULL COMMENT '1=Perez, 2=Garcia, 3=Rodriguez',
  `comisionPorcentaje` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_cobradores_correo` (`correo`),
  UNIQUE KEY `UQ_cobradores_zona` (`zona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: socios (R2/R3)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `socios`;
CREATE TABLE `socios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `apellido` VARCHAR(255) NOT NULL,
  `dni` VARCHAR(20) NOT NULL,
  `fechaNacimiento` DATE NOT NULL,
  `fechaAlta` DATE NOT NULL,
  `direccion` VARCHAR(255) NULL,
  `localidad` VARCHAR(255) NULL,
  `telefono` VARCHAR(255) NULL,
  `email` VARCHAR(255) NOT NULL,
  `categoria` ENUM('CADETE','ACTIVO','VITALICIO') NOT NULL,
  `zonaCobro` TINYINT NOT NULL DEFAULT 0 COMMENT '0=Club, 1..3=cobrador de zona',
  `estado` ENUM('ACTIVO','MOROSO','SUSPENDIDO','BAJA') NOT NULL DEFAULT 'ACTIVO',
  `mesesImpagosConsecutivos` INT NOT NULL DEFAULT 0,
  `grupoFamiliarId` INT NULL,
  `rolGrupoFamiliar` ENUM('TITULAR','CONYUGE','HIJO') NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_socios_dni` (`dni`),
  UNIQUE KEY `UQ_socios_email` (`email`),
  KEY `IDX_socios_grupoFamiliar` (`grupoFamiliarId`),
  CONSTRAINT `FK_socios_grupoFamiliar` FOREIGN KEY (`grupoFamiliarId`)
    REFERENCES `grupos_familiares` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: casilleros (R6)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `casilleros`;
CREATE TABLE `casilleros` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero` INT NOT NULL,
  `socioId` INT NULL,
  `costoMensual` DECIMAL(12,2) NOT NULL DEFAULT 2500.00,
  `fechaAlquiler` DATE NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_casilleros_numero` (`numero`),
  UNIQUE KEY `UQ_casilleros_socioId` (`socioId`),
  CONSTRAINT `FK_casilleros_socio` FOREIGN KEY (`socioId`)
    REFERENCES `socios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: actividades (R5)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `actividades`;
CREATE TABLE `actividades` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NULL,
  `arancel` DECIMAL(12,2) NOT NULL,
  `turno` ENUM('MATUTINO','VESPERTINO','NOCTURNO') NOT NULL,
  `diasSemana` VARCHAR(255) NULL,
  `horaInicio` TIME NULL,
  `horaFin` TIME NULL,
  `cupoMaximo` INT NULL,
  `instructorId` INT NULL,
  `activa` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_actividades_instructor` (`instructorId`),
  CONSTRAINT `FK_actividades_instructor` FOREIGN KEY (`instructorId`)
    REFERENCES `instructores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: inscripciones (socios <-> actividades)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `inscripciones`;
CREATE TABLE `inscripciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `socioId` INT NOT NULL,
  `actividadId` INT NOT NULL,
  `activa` TINYINT(1) NOT NULL DEFAULT 1,
  `fechaInscripcion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_inscripciones_socio_actividad` (`socioId`, `actividadId`),
  KEY `IDX_inscripciones_actividad` (`actividadId`),
  CONSTRAINT `FK_inscripciones_socio` FOREIGN KEY (`socioId`)
    REFERENCES `socios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_inscripciones_actividad` FOREIGN KEY (`actividadId`)
    REFERENCES `actividades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: cupones (R8/R10/R11 - Cobranza)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `cupones`;
CREATE TABLE `cupones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `socioId` INT NOT NULL,
  `grupoFamiliarId` INT NULL,
  `periodo` VARCHAR(7) NOT NULL COMMENT 'Formato YYYY-MM',
  `zona` TINYINT NOT NULL,
  `cobradorId` INT NULL,
  `montoCuotaSocial` DECIMAL(12,2) NOT NULL,
  `montoActividades` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `montoCasillero` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `recargoPorcentaje` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `montoTotal` DECIMAL(12,2) NOT NULL,
  `estado` ENUM('PENDIENTE','PAGADO','DEVUELTO','ANULADO') NOT NULL DEFAULT 'PENDIENTE',
  `esReemision` TINYINT(1) NOT NULL DEFAULT 0,
  `detalle` TEXT NULL,
  `fechaPago` DATE NULL,
  `fechaEmision` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_cupones_socio` (`socioId`),
  KEY `IDX_cupones_cobrador` (`cobradorId`),
  KEY `IDX_cupones_periodo` (`periodo`),
  CONSTRAINT `FK_cupones_socio` FOREIGN KEY (`socioId`)
    REFERENCES `socios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_cupones_grupoFamiliar` FOREIGN KEY (`grupoFamiliarId`)
    REFERENCES `grupos_familiares` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_cupones_cobrador` FOREIGN KEY (`cobradorId`)
    REFERENCES `cobradores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: rendiciones (R9 - Liquidación semanal de cobradores)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `rendiciones`;
CREATE TABLE `rendiciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cobradorId` INT NOT NULL,
  `semanaInicio` DATE NOT NULL,
  `semanaFin` DATE NOT NULL,
  `montoRecaudado` DECIMAL(12,2) NOT NULL,
  `comisionCalculada` DECIMAL(12,2) NOT NULL,
  `montoNeto` DECIMAL(12,2) NOT NULL,
  `esUltimaSemanaDelMes` TINYINT(1) NOT NULL DEFAULT 0,
  `fechaRendicion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_rendiciones_cobrador` (`cobradorId`),
  CONSTRAINT `FK_rendiciones_cobrador` FOREIGN KEY (`cobradorId`)
    REFERENCES `cobradores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: rendicion_detalles (planilla semanal, cupón por cupón)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `rendicion_detalles`;
CREATE TABLE `rendicion_detalles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rendicionId` INT NOT NULL,
  `cuponId` INT NOT NULL,
  `importeCobrado` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `cobrado` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `IDX_rendicion_detalles_rendicion` (`rendicionId`),
  KEY `IDX_rendicion_detalles_cupon` (`cuponId`),
  CONSTRAINT `FK_rendicion_detalles_rendicion` FOREIGN KEY (`rendicionId`)
    REFERENCES `rendiciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_rendicion_detalles_cupon` FOREIGN KEY (`cuponId`)
    REFERENCES `cupones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: users (R1 - Autenticación y roles)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN','COBRADOR','INSTRUCTOR','SOCIO') NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `socioId` INT NULL,
  `instructorId` INT NULL,
  `cobradorId` INT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email` (`email`),
  UNIQUE KEY `UQ_users_socioId` (`socioId`),
  UNIQUE KEY `UQ_users_instructorId` (`instructorId`),
  UNIQUE KEY `UQ_users_cobradorId` (`cobradorId`),
  CONSTRAINT `FK_users_socio` FOREIGN KEY (`socioId`)
    REFERENCES `socios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_users_instructor` FOREIGN KEY (`instructorId`)
    REFERENCES `instructores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_users_cobrador` FOREIGN KEY (`cobradorId`)
    REFERENCES `cobradores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- DATOS INICIALES (equivalentes a "npm run seed")
-- =====================================================================

-- Parámetros generales del club, con los montos del enunciado
INSERT INTO `configuracion`
  (`cuotaCadete`,`cuotaActivo`,`cuotaVitalicio`,`cuotaGrupoFamiliar`,`costoCasillero`,
   `recargoMorosidad`,`comisionCobrador`,`edadMinimaActivo`,`edadMinimaVitalicio`,
   `antiguedadMinimaVitalicio`,`mesesConsecutivosParaMorosidad`,`totalCasilleros`,`totalActividades`)
VALUES
  (35000.00, 50000.00, 0.00, 80000.00, 2500.00, 5.00, 10.00, 18, 60, 30, 2, 100, 20);

-- Los 3 cobradores de zona del enunciado
INSERT INTO `cobradores` (`nombre`, `apellido`, `correo`, `zona`, `comisionPorcentaje`) VALUES
  ('Zona 1', 'Pérez',     'perez.cobrador@elglobo.com.ar',     1, 10.00),
  ('Zona 2', 'García',    'garcia.cobrador@elglobo.com.ar',    2, 10.00),
  ('Zona 3', 'Rodríguez', 'rodriguez.cobrador@elglobo.com.ar', 3, 10.00);

-- Los 100 casilleros disponibles del club (numerados 1 a 100, $2.500 c/u)
INSERT INTO `casilleros` (`id`, `numero`, `costoMensual`) VALUES
(1, 1, 2500.00),
(2, 2, 2500.00),
(3, 3, 2500.00),
(4, 4, 2500.00),
(5, 5, 2500.00),
(6, 6, 2500.00),
(7, 7, 2500.00),
(8, 8, 2500.00),
(9, 9, 2500.00),
(10, 10, 2500.00),
(11, 11, 2500.00),
(12, 12, 2500.00),
(13, 13, 2500.00),
(14, 14, 2500.00),
(15, 15, 2500.00),
(16, 16, 2500.00),
(17, 17, 2500.00),
(18, 18, 2500.00),
(19, 19, 2500.00),
(20, 20, 2500.00),
(21, 21, 2500.00),
(22, 22, 2500.00),
(23, 23, 2500.00),
(24, 24, 2500.00),
(25, 25, 2500.00),
(26, 26, 2500.00),
(27, 27, 2500.00),
(28, 28, 2500.00),
(29, 29, 2500.00),
(30, 30, 2500.00),
(31, 31, 2500.00),
(32, 32, 2500.00),
(33, 33, 2500.00),
(34, 34, 2500.00),
(35, 35, 2500.00),
(36, 36, 2500.00),
(37, 37, 2500.00),
(38, 38, 2500.00),
(39, 39, 2500.00),
(40, 40, 2500.00),
(41, 41, 2500.00),
(42, 42, 2500.00),
(43, 43, 2500.00),
(44, 44, 2500.00),
(45, 45, 2500.00),
(46, 46, 2500.00),
(47, 47, 2500.00),
(48, 48, 2500.00),
(49, 49, 2500.00),
(50, 50, 2500.00),
(51, 51, 2500.00),
(52, 52, 2500.00),
(53, 53, 2500.00),
(54, 54, 2500.00),
(55, 55, 2500.00),
(56, 56, 2500.00),
(57, 57, 2500.00),
(58, 58, 2500.00),
(59, 59, 2500.00),
(60, 60, 2500.00),
(61, 61, 2500.00),
(62, 62, 2500.00),
(63, 63, 2500.00),
(64, 64, 2500.00),
(65, 65, 2500.00),
(66, 66, 2500.00),
(67, 67, 2500.00),
(68, 68, 2500.00),
(69, 69, 2500.00),
(70, 70, 2500.00),
(71, 71, 2500.00),
(72, 72, 2500.00),
(73, 73, 2500.00),
(74, 74, 2500.00),
(75, 75, 2500.00),
(76, 76, 2500.00),
(77, 77, 2500.00),
(78, 78, 2500.00),
(79, 79, 2500.00),
(80, 80, 2500.00),
(81, 81, 2500.00),
(82, 82, 2500.00),
(83, 83, 2500.00),
(84, 84, 2500.00),
(85, 85, 2500.00),
(86, 86, 2500.00),
(87, 87, 2500.00),
(88, 88, 2500.00),
(89, 89, 2500.00),
(90, 90, 2500.00),
(91, 91, 2500.00),
(92, 92, 2500.00),
(93, 93, 2500.00),
(94, 94, 2500.00),
(95, 95, 2500.00),
(96, 96, 2500.00),
(97, 97, 2500.00),
(98, 98, 2500.00),
(99, 99, 2500.00),
(100, 100, 2500.00);

-- Usuario Administrador inicial
-- Correo: admin@elglobo.com.ar
-- Clave:  Admin123!
-- (hash bcrypt, cost 10 - generado con la misma librería bcrypt que usa el backend)
INSERT INTO `users` (`email`, `password`, `role`, `activo`) VALUES
  ('admin@elglobo.com.ar', '$2b$10$XBvm96jN57phhlmHZPE.MuPAsdBU5.RzQAUrgcyWy3ncQqrovHzja', 'ADMIN', 1);

-- =====================================================================
-- Fin del script. La base "el_globo" queda lista para que el backend
-- (con DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD apuntando a este MySQL)
-- se conecte sin necesidad de correr "npm run seed" ni dejar que
-- TypeORM sincronice el esquema.
-- =====================================================================
