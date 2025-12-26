module.exports = {
  "development": {
    "database": "intrvl_dev",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "database": "intrvl_test",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  },
  "production": {
    "username": process.env.DB_USER || "intrvl",
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME || "intrvl",
    "host": process.env.DB_HOST || "postgres",
    "port": parseInt(process.env.DB_PORT || "5432"),
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": false
    }
  }
};
