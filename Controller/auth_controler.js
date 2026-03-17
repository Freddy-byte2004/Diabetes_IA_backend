const database = require('../database/conexion');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const salt_round = 10;

function createMailTransporter() {
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: smtpPort,
        secure: smtpPort === 465,
        requireTLS: smtpPort === 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: smtpPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        logger: true,
        debug: true,
    });
}

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
            console.log('[EnviarCodigo] Inicio del flujo para:', usuario);

            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                return res.status(500).json({ message: 'SMTP no configurado correctamente' });
            }

            const result = await database.query(
                'SELECT * FROM perfil WHERE usuario=$1',
                [usuario]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            console.log('[EnviarCodigo] Usuario encontrado');

            // Generar código aleatorio de 6 dígitos
            const codigo = Math.floor(100000 + Math.random() * 900000);

            // Guardar código en BD con expiración (ejemplo: 10 min)
            await database.query(
                'UPDATE perfil SET codigo_recuperacion=$1, codigo_expira=NOW() + interval \'10 minutes\' WHERE usuario=$2',
                [codigo, usuario]
            );

            console.log('[EnviarCodigo] Codigo guardado en BD');

            const transporter = createMailTransporter();
            console.log('[EnviarCodigo] Enviando correo via SMTP...');
            await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: usuario,
                subject: 'Código de recuperación',
                html: `<p>Tu código de recuperación es <strong>${codigo}</strong></p>`,
            });

            console.log('[EnviarCodigo] Correo enviado correctamente');

            return res.status(200).json({ message: 'Código enviado al correo' });
        } catch (err) {
            console.error('[EnviarCodigo] Error:', err);
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