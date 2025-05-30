module.exports = {
  db: {
    // host: '127.0.0.1',
    // host: '192.168.8.152',
    // host: '192.168.8.234',
    host: '10.168.2.178',
    port: '5432',
    dialect: 'postgres',
    database: 'leapting_install',
    user: 'postgres',
    password: 'root',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  },
  jwt: {
    secret: 'lepating',
    expiresIn: '48h'
  },
  image_url: '10.168.4.100',
};
