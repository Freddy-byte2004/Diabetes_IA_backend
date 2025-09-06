const express=require('express')
const usuario_ruta= express.Router();
const usuario_controller= require('../Controller/usuario_controler');

usuario_ruta.get('/usuario/:correo', usuario_controller.obtenerIdUsuario);
usuario_ruta.post('/usuario', usuario_controller.ingresarUsuario);
usuario_ruta.delete('/usuario/:id', usuario_controller.eliminarUsuario);
usuario_ruta.get('/usuario/analisis', usuario_controller.obtenerAnalisisUsuario);

module.exports= usuario_ruta;