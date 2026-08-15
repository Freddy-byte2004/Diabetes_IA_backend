const express= require('express');
const usuario_ruta = require('./Routes/usuario_ruta');
const auth_ruta = require('./Routes/auth_route');
const verificacion_ruta = require('./Routes/verificacion_ruta');
const analisis_ruta = require('./Routes/analisis_route');
const paciente_ruta = require('./Routes/paciente_ruta');
const helmet=require('helmet');
const rateLimit = require('express-rate-limit');
const cors= require('cors')
const authMiddleware = require('./Middlewares/authMiddleware');
const dotenv= require('dotenv');
dotenv.config();

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Demasiadas solicitudes de autenticacion desde esta IP, por favor intente de nuevo despues de 15 minutos'
});
const app= express();
app.use(express.json());



app.use(cors(corsOptions));
app.use(helmet());
app.use('/api', authLimit, auth_ruta);
app.use('/api', authMiddleware, usuario_ruta);
app.use('/api', authMiddleware, analisis_ruta);
app.use('/api', authMiddleware, paciente_ruta);

app.listen(process.env.PORT || 5432, () => {
  console.log(`Servidor en el puerto ${process.env.PORT || 5432}`);
});