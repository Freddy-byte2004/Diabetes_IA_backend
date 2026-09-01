const express = require('express');
const paciente_ruta = express.Router();
const paciente_controller = require('../Controller/paciente_controler');

paciente_ruta.get('/paciente/institucion/:id_institucion', paciente_controller.obtenerPacientes);
paciente_ruta.get('/paciente/:id/institucion/:id_institucion', paciente_controller.obtenerPacientePorID);
paciente_ruta.post('/paciente', paciente_controller.crearPaciente);
paciente_ruta.put('/paciente/:id', paciente_controller.actualizarPaciente);
paciente_ruta.delete('/paciente/:id', paciente_controller.eliminarPaciente);

module.exports = paciente_ruta;
