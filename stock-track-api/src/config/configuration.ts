export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
});
