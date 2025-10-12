const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false } 
});
const conexion = pool;

conexion.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
conexion.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos', err.stack);
    return;
  }
    console.log('Conexión exitosa a la base de datos');
});

module.exports=conexion;