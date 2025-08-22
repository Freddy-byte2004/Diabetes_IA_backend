const express=require('express')
const auth_ruta= express.Router();
const authControler= require('../Controller/auth_controler')

auth_ruta.post('/auth/register', authControler.RegistroUsuario);
auth_ruta.post('/auth/login', authControler.InicioSesion);

module.exports= auth_ruta