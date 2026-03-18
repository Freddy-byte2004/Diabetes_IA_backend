const express=require('express')
const auth_ruta= express.Router();
const authControler= require('../Controller/auth_controler')

auth_ruta.post('/auth/register', authControler.RegistroUsuario);
auth_ruta.post('/auth/login', authControler.InicioSesion);
auth_ruta.post('/auth/verify-code', authControler.VerificarCodigo);
auth_ruta.post('/auth/change-password', authControler.CambiarContrasena);
auth_ruta.post('/auth/new-code', authControler.NuevoCodigoUnico);

module.exports= auth_ruta