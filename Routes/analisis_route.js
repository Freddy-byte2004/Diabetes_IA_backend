const express= require('express');
const analisis_ruta= express.Router();
const analisis_controler=require('../Controller/analisis_controler');

analisis_ruta.post('/analisis', analisis_controler.crearAnalisis )
analisis_ruta.get('/analisisProbabilidad/:id_paciente', analisis_controler.obtenerProbabilidad)
analisis_ruta.get('/analisis/ultimo/:id_paciente', analisis_controler.obtenerUltimoAnalisis)
analisis_ruta.get('/analisis/:id_paciente', analisis_controler.obtenerAnalisis)
analisis_ruta.delete('/analisis/:id_paciente', analisis_controler.eliminarAnalisis)

module.exports= analisis_ruta;