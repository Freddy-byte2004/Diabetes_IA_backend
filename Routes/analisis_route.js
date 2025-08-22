const express= require('express');
const analisis_ruta= express.Router();
const analisis_controler=require('../Controller/analisis_controler');

analisis_ruta.post('/analisis', analisis_controler.crearAnalisis )

analisis_ruta.get('/analisis/:id', analisis_controler.obtenerAnalisis)
analisis_ruta.delete('/analisis/:id', analisis_controler.eliminarAnalisis)

module.exports= analisis_ruta;