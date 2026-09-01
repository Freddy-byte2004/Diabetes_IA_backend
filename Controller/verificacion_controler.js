const database = require('../database/conexion');
const authService = require('../Services/authService');

class verificacionControler {
    constructor() {}

    async VerificarCuenta(req, res) {
        const { usuario, codigo } = req.body;
        if (!usuario || !codigo) {
            return res.status(400).json({ message: 'Debe enviar usuario y codigo' });
        }

        try {
            const result = await database.query(
                'SELECT verification_code, code_expires_at, is_verified FROM perfil WHERE usuario=$1',
                [usuario]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const perfil = result.rows[0];

            if (perfil.is_verified) {
                return res.status(200).json({ message: 'La cuenta ya esta verificada' });
            }

            if (!perfil.verification_code || !perfil.code_expires_at) {
                return res.status(400).json({ message: 'No hay un codigo de verificacion activo' });
            }

            const now = new Date();
            const expiresAt = new Date(perfil.code_expires_at);
            if (now > expiresAt) {
                return res.status(400).json({ message: 'El codigo de verificacion ha expirado' });
            }

            const codigoValido = await authService.comparePassword(codigo, perfil.verification_code);
            if (!codigoValido) {
                return res.status(400).json({ message: 'Codigo incorrecto' });
            }

            await database.query(
                'UPDATE perfil SET is_verified=$1, verification_code=$2, code_expires_at=$3 WHERE usuario=$4',
                [true, null, null, usuario]
            );

            return res.status(200).json({ message: 'Cuenta verificada exitosamente' });
        } catch (err) {
            return res.status(500).json({ message: 'No se pudo verificar la cuenta', error: err.message });
        }
    }

    async ReenviarCodigoVerificacion(req, res) {
        const { usuario } = req.body;
        if (!usuario) {
            return res.status(400).json({ message: 'Debe enviar el usuario' });
        }

        try {
            const result = await database.query('SELECT is_verified FROM perfil WHERE usuario=$1', [usuario]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            if (result.rows[0].is_verified) {
                return res.status(400).json({ message: 'La cuenta ya esta verificada' });
            }

            const verificationCode = authService.generateVerificationCode();
            const verificationHash = await authService.hashPassword(verificationCode);
            const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

            await database.query(
                'UPDATE perfil SET verification_code=$1, code_expires_at=$2 WHERE usuario=$3',
                [verificationHash, codeExpiresAt, usuario]
            );

            await authService.sendAccountVerificationCodeEmail(usuario, verificationCode);

            return res.status(200).json({ message: 'Codigo de verificacion reenviado al correo' });
        } catch (err) {
            return res.status(500).json({ message: 'No se pudo reenviar el codigo', error: err.message });
        }
    }
}

module.exports = new verificacionControler();
