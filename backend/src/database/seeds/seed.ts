import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Configuracion } from '../../configuracion/entities/configuracion.entity';
import { Cobrador } from '../../cobradores/entities/cobrador.entity';
import { Casillero } from '../../casilleros/entities/casillero.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { ZonaCobro } from '../../common/enums/zona-cobro.enum';

/**
 * Carga inicial de datos (npm run seed):
 *  - Fila única de configuración con los montos del enunciado.
 *  - Los 3 cobradores de zona (Pérez, García, Rodríguez).
 *  - Los 100 casilleros disponibles.
 *  - Un usuario Administrador para el primer ingreso al sistema.
 */
async function seed() {
  const dataSource = await AppDataSource.initialize();
  console.log('Conectado a la base de datos. Iniciando carga de datos iniciales...');

  const configRepo = dataSource.getRepository(Configuracion);
  const yaExisteConfig = await configRepo.findOne({ where: {} });
  if (!yaExisteConfig) {
    await configRepo.save(configRepo.create());
    console.log('✔ Configuración por defecto creada.');
  }

  const cobradoresRepo = dataSource.getRepository(Cobrador);
  const cobradoresSeed = [
    { nombre: 'Zona 1', apellido: 'Pérez', correo: 'perez.cobrador@elglobo.com.ar', zona: ZonaCobro.ZONA_1 },
    { nombre: 'Zona 2', apellido: 'García', correo: 'garcia.cobrador@elglobo.com.ar', zona: ZonaCobro.ZONA_2 },
    { nombre: 'Zona 3', apellido: 'Rodríguez', correo: 'rodriguez.cobrador@elglobo.com.ar', zona: ZonaCobro.ZONA_3 },
  ];
  for (const c of cobradoresSeed) {
    const existente = await cobradoresRepo.findOne({ where: { zona: c.zona } });
    if (!existente) {
      await cobradoresRepo.save(cobradoresRepo.create(c));
      console.log(`✔ Cobrador creado: Sr. ${c.apellido} (${c.zona}).`);
    }
  }

  const casillerosRepo = dataSource.getRepository(Casillero);
  const totalCasilleros = await casillerosRepo.count();
  if (totalCasilleros === 0) {
    const casilleros = Array.from({ length: 100 }, (_, i) =>
      casillerosRepo.create({ numero: i + 1, costoMensual: 2500 }),
    );
    await casillerosRepo.save(casilleros);
    console.log('✔ 100 casilleros creados.');
  }

  const usersRepo = dataSource.getRepository(User);
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@elglobo.com.ar';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const existeAdmin = await usersRepo.findOne({ where: { email: adminEmail } });
  if (!existeAdmin) {
    await usersRepo.save(
      usersRepo.create({
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        role: Role.ADMIN,
      }),
    );
    console.log(`✔ Usuario administrador creado: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('… El usuario administrador ya existía, no se modificó.');
  }

  await dataSource.destroy();
  console.log('Carga de datos iniciales finalizada.');
}

seed().catch((error) => {
  console.error('Error al ejecutar el seed:', error);
  process.exit(1);
});
