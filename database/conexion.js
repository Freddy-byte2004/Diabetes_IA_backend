
const { Pool } = require('pg');


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Permitir la URL de conexión genérica (o mantener la de Supabase como alternativa)
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

// Configuración de SSL opcional 
const sslConfig = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } 
  : false;

const pool = new Pool({
  connectionString: connectionString,
  ssl: sslConfig
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