const express=require('express')
const auth_ruta= express.Router();
const authControler= require('../Controller/auth_controler')

auth_ruta.post('/auth/register', authControler.RegistroUsuario);
auth_ruta.post('/auth/login', authControler.InicioSesion);
auth_ruta.post('/auth/forgot-password', authControler.EnviarCodigo);
auth_ruta.post('/auth/verify-code', authControler.VerificarCodigo);
auth_ruta.post('/auth/change-password', authControler.CambiarContrasena);

module.exports= auth_ruta