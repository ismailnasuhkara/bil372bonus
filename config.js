import 'dotenv/config';

function require(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optional(name, fallback) {
  return process.env[name] ?? fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),

  get isDev()  { return this.env === 'development'; },
  get isProd() { return this.env === 'production';  },

  server: {
    port:      parseInt(optional('PORT', '3000'), 10),
    clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),
  },

  redis: {
    host:     optional('REDIS_HOST', 'localhost'),
    port:     parseInt(optional('REDIS_PORT', '6379'), 10),
    password: optional('REDIS_PASSWORD', undefined),
    tls:      optional('REDIS_TLS', 'false') === 'true',
  },

  auth: {
    jwtSecret:       require('JWT_SECRET'),
    jwtExpiresIn:    optional('JWT_EXPIRES_IN', '7d'),
  },

  pagination: {
    defaultLimit: parseInt(optional('PAGINATION_DEFAULT_LIMIT', '50'), 10),
    maxLimit:     parseInt(optional('PAGINATION_MAX_LIMIT', '100'), 10),
  },
};