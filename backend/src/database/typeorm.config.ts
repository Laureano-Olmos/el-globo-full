import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Configuración de TypeORM leída desde variables de entorno.
 * `synchronize` sólo se habilita en desarrollo: en producción se deben
 * usar migraciones (ver npm run migration:*).
 */
export const buildTypeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.get<string>('database.host'),
  port: config.get<number>('database.port'),
  username: config.get<string>('database.username'),
  password: config.get<string>('database.password'),
  database: config.get<string>('database.name'),
  autoLoadEntities: true,
  synchronize: config.get<string>('env') !== 'production',
  logging: config.get<string>('env') === 'development' ? ['error', 'warn'] : ['error'],
});
