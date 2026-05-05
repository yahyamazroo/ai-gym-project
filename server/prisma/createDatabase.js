import "dotenv/config";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL est manquant dans server/.env.");
  process.exit(1);
}

const url = new URL(databaseUrl);
const databaseName = url.pathname.replace("/", "");

if (!databaseName) {
  console.error("Le nom de la base est manquant dans DATABASE_URL.");
  process.exit(1);
}

const connectionConfig = {
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username || "root"),
  password: decodeURIComponent(url.password || ""),
  multipleStatements: false
};

try {
  const connection = await mysql.createConnection(connectionConfig);
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
  console.log(`Base MySQL prete: ${databaseName}`);
} catch (error) {
  console.error("Impossible de creer la base MySQL.");
  console.error("Verifiez que MySQL Server est demarre et que server/.env contient le bon utilisateur/mot de passe.");
  console.error(error.message);
  process.exit(1);
}
