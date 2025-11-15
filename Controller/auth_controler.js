const database = require('../database/conexion');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {Resend}= require('resend');
require('dotenv').config();
const salt_round = 10;

class authControler {
    constructor() {}

    RegistroUsuario(req, res) {
    const { usuario, contrasena, nombre, apellido } = req.body;

    bcrypt.hash(contrasena, salt_round, (err, hash) => {
        if (err) {
            return res.status(500).send({ message: 'Error al encriptar contraseña', error: err.message });
        }

        database.query(
            'INSERT INTO perfil(usuario, contrasena) VALUES ($1, $2) RETURNING id',
            [usuario, hash],
            (err, result) => {
                if (err) {
                    return res.status(400).json({ message: 'Error al registrar perfil', error: err.message });
                }

                const id_perfil = result.rows[0].id;

                database.query(
                    'INSERT INTO usuario(nombre, apellido, id_perfil) VALUES ($1, $2, $3)',
                    [nombre, apellido, id_perfil],
                    (err, result) => {
                        if (err) {
                            return res.status(400).json({ message: 'Error al registrar usuario', error: err.message });
                        }

                        return res.status(200).json({ message: 'Usuario registrado exitosamente' });
                    }
                );
            }
        );
    });
}


    InicioSesion(req, res) {
        const { usuario, contrasena } = req.body;
        try {
            database.query(
                'SELECT * FROM perfil WHERE usuario=$1',
                [usuario],
                (err, result) => {
                    if (err) {
                        return res.status(400).json({ message: 'Error al iniciar sesión', error: err.message });
                    }
                    if (result.rows.length === 0) {
                        return res.status(401).json({ message: 'Usuario no encontrado' });
                    }
                    const usuarioDB = result.rows[0];
                    bcrypt.compare(contrasena, usuarioDB.contrasena, (err, comprobado) => {
                        if (err) {
                            return res.status(500).json({ message: 'Error al comparar contraseñas' });
                        }
                        if (!comprobado) {
                            return res.status(401).json({ message: 'Contraseña incorrecta' });
                        }
                        if(comprobado){

                            const token=jwt.sign({
                                id: usuarioDB.id,
                                usuario: usuarioDB.usuario
                            }, process.env.JWT_SECRET,{expiresIn: '12h'});
                            
                               

                             return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
                        }
                       
                    });
                }
            );
        } catch (err) {
            return res.status(500).json({ message: 'Error al iniciar sesión catch' });
        }
    }
    async EnviarCodigo(req, res) {
        const { usuario } = req.body; // correo o usuario
        try {
            const result = await database.query(
                'SELECT * FROM perfil WHERE usuario=$1',
                [usuario]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Generar código aleatorio de 6 dígitos
            const codigo = Math.floor(100000 + Math.random() * 900000);

            // Guardar código en BD con expiración (ejemplo: 10 min)
            await database.query(
                'UPDATE perfil SET codigo_recuperacion=$1, codigo_expira=NOW() + interval \'10 minutes\' WHERE usuario=$2',
                [codigo, usuario]
            );

            // Configurar envío de correo
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: 'onboarding@resend.dev', // remitente verificado
                to: usuario,  // destinatario
                subject: 'Código de recuperación',
                html: `<p>Tu código de recuperación es <strong>${codigo}</strong></p>`
                });


            return res.status(200).json({ message: 'Código enviado al correo' });
        } catch (err) {
            return res.status(500).json({ message: 'Error al enviar código', error: err.message });
        }
    }

    // 2. Verificar código
    async VerificarCodigo(req, res) {
        const { usuario, codigo } = req.body;
        try {
            const result = await database.query(
                'SELECT codigo_recuperacion, codigo_expira FROM perfil WHERE usuario=$1',
                [usuario]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const perfil = result.rows[0];
            if (perfil.codigo_recuperacion != codigo) {
                return res.status(400).json({ message: 'Código incorrecto' });
            }
            if (new Date(perfil.codigo_expira) < new Date()) {
                return res.status(400).json({ message: 'Código expirado' });
            }

            return res.status(200).json({ message: 'Código válido' });
        } catch (err) {
            return res.status(500).json({ message: 'Error al verificar código', error: err.message });
        }
    }

    // 3. Cambiar contraseña
    async CambiarContrasena(req, res) {
        const { usuario, nuevaContrasena } = req.body;
        try {
            const hash = await bcrypt.hash(nuevaContrasena, salt_round);
            await database.query(
                'UPDATE perfil SET contrasena=$1 WHERE usuario=$2',
                [hash, usuario]
            );
            return res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
        } catch (err) {
            return res.status(500).json({ message: 'Error al cambiar contraseña', error: err.message });
        }
    }
}

module.exports = new authControler();