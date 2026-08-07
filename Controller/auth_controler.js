const database = require('../database/conexion');
const authService = require('../Services/authService');
require('dotenv').config();

class authControler {
    constructor() {}

    async RegistroUsuario(req, res) {
        const { usuario, contrasena, nombre, direccion } = req.body;
        try {
            const hash = await authService.hashPassword(contrasena);
            const verificationCode = authService.generateVerificationCode();
            const verificationHash = await authService.hashPassword(verificationCode);
            const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

            const perfilResult = await database.query(
                'INSERT INTO perfil(usuario, contrasena, codigo_unico, verification_code, code_expires_at, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [usuario, hash, '', verificationHash, codeExpiresAt, false]
            );

            const id_perfil = perfilResult.rows[0].id;

            await database.query(
                'INSERT INTO usuario(nombre, direccion, id_perfil) VALUES ($1, $2, $3)',
                [nombre, direccion, id_perfil]
            );

            await authService.sendAccountVerificationCodeEmail(usuario, verificationCode);

            return res.status(201).json({
                message: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.'
            });
        }    catch (err) {
            if (
                err.message &&
                err.message.includes('duplicate key value violates unique constraint') &&
                err.message.includes('perfil_usuario_key')
            ) {
                return res.status(400).json({ message: 'Ya existe un usuario con ese correo' });
            }
            return res.status(500).json({ message: 'No se pudo registrar el usuario', error: err.message });
        }
    }

    async InicioSesion(req, res) {
        const { usuario, contrasena } = req.body;
        try {
            const result = await database.query('SELECT * FROM perfil WHERE usuario=$1', [usuario]);
            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            const usuarioDB = result.rows[0];
            const valid = await authService.comparePassword(contrasena, usuarioDB.contrasena);
            if (!valid) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            if (!usuarioDB.is_verified) {
                return res.status(403).json({
                    message: 'Debes verificar tu cuenta antes de iniciar sesión'
                });
            }

            const token = authService.generateToken({ id: usuarioDB.id, usuario: usuarioDB.usuario });
            return res.status(200).json({ message: 'Inicio de sesión exitoso', token, id: usuarioDB.id });
        } catch (err) {
            return res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
        }
    }

    async VerificarCodigo(req, res) {
        const { usuario, codigo } = req.body;
        if (!usuario || !codigo) {
            return res.status(400).json({ message: 'Debe enviar usuario y codigo' });
        }

        try {
            const result = await database.query('SELECT codigo_unico FROM perfil WHERE usuario=$1', [usuario]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const perfil = result.rows[0];
            if (!perfil.codigo_unico) {
                return res.status(400).json({ message: 'No hay un codigo activo para este usuario' });
            }

            const codigoValido = await authService.comparePassword(codigo, perfil.codigo_unico);
            if (!codigoValido) {
                return res.status(400).json({ message: 'Código incorrecto' });
            }

            return res.status(200).json({ message: 'Código válido' });
        } catch (err) {
            return res.status(500).json({ message: 'No se pudo verificar el codigo', error: err.message });
        }
    }

    async NuevoCodigoUnico(req, res) {
        const { usuario } = req.body;
        if (!usuario) {
            return res.status(400).json({ message: 'Debe enviar el usuario' });
        }

        try {
            const perfilResult = await database.query('SELECT id FROM perfil WHERE usuario=$1', [usuario]);
            if (perfilResult.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const nuevoCodigo = authService.generateVerificationCode();
            const hashCodigo = await authService.hashPassword(nuevoCodigo);
            await database.query('UPDATE perfil SET codigo_unico=$1 WHERE usuario=$2', [hashCodigo, usuario]);
            await authService.sendPasswordResetCodeEmail(usuario, nuevoCodigo);

            return res.status(200).json({ message: 'Codigo de verificacion enviado al correo' });
        } catch (err) {
            return res.status(500).json({ message: 'No se pudo generar un nuevo codigo', error: err.message });
        }
    }

    async CambiarContrasena(req, res) {
        const { usuario, nuevaContrasena } = req.body;
        if (!usuario || !nuevaContrasena) {
            return res.status(400).json({ message: 'Debe enviar usuario y nuevaContrasena' });
        }

        try {
            const result = await database.query('SELECT id FROM perfil WHERE usuario=$1', [usuario]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const hash = await authService.hashPassword(nuevaContrasena);
            await database.query('UPDATE perfil SET contrasena=$1, codigo_unico=$2 WHERE usuario=$3', [hash, '', usuario]);
            return res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
        } catch (err) {
            return res.status(500).json({ message: 'No se pudo cambiar la contraseña', error: err.message });
        }
    }
}

module.exports = new authControler();