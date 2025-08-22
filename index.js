const express= require('express');
const usuario_ruta = require('./Routes/usuario_ruta');
const auth_ruta = require('./Routes/auth_route');
const analisis_ruta = require('./Routes/analisis_route');
const cors= require('cors')
const app= express();
app.use(express.json());
app.use(cors())
app.use('/api', usuario_ruta);
app.use('/api', auth_ruta);
app.use('/api', analisis_ruta);
app.listen(3000, () => {
  console.log('Servidor en el puerto 3000 ');
});