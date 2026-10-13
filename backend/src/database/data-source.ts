import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * DataSource utilizado exclusivamente por la CLI de TypeORM para generar y
 * correr migraciones (npm run migration:*). La aplicación en tiempo de
 * ejecución usa el TypeOrmModule configurado en app.module.ts.
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'el_globo',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
