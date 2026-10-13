export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'el_globo',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-cambiar',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@elglobo.com.ar',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
  },
});
