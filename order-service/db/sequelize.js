const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // disable SQL logs
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL successfully");
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
