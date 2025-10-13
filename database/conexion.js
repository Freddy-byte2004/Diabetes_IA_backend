
const { Pool } = require('pg');


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { 
    rejectUnauthorized: false } 
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