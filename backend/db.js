const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to database");
    client.release();
  })
  .catch((err) => {
    console.error("Error connecting to database", err);
    process.exit(1);
  });

module.exports = pool;
