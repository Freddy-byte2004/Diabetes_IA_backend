const express= require('express');
const usuario_ruta = require('./Routes/usuario_ruta');
const auth_ruta = require('./Routes/auth_route');
const analisis_ruta = require('./Routes/analisis_route');
const paciente_ruta = require('./Routes/paciente_ruta');
const helmet=require('helmet');
const rateLimit = require('express-rate-limit');
const cors= require('cors')
const dotenv= require('dotenv');
dotenv.config();

const limit= rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos'
});
const app= express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(limit);
app.use('/api', usuario_ruta);
app.use('/api', auth_ruta);
app.use('/api', analisis_ruta);
app.use('/api', paciente_ruta);
/*app.listen(5432, () => {
  console.log('Servidor en el puerto 5432');
});
*/
app.listen(process.env.PORT || 5432, () => {
  console.log(`Servidor en el puerto ${process.env.PORT || 5432}`);
});