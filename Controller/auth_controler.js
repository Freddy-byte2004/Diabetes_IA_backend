const database = require('../database/conexion');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const salt_round = 10;

function generarCodigoUnico() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
}

class authControler {
    constructor() {}

    RegistroUsuario(req, res) {
    const { usuario, contrasena, nombre, direccion } = req.body;
    const codigoUnico = generarCodigoUnico();

    bcrypt.hash(contrasena, salt_round, (err, hash) => {
        if (err) {
            return res.status(500).send({ message: 'No se pudo procesar la contraseña' });
        }

        bcrypt.hash(codigoUnico, salt_round, (errCodigo, hashCodigo) => {
            if (errCodigo) {
                return res.status(500).send({ message: 'No se pudo generar el codigo de verificacion' });
            }

            database.query(
                'INSERT INTO perfil(usuario, contrasena, codigo_unico) VALUES ($1, $2, $3) RETURNING id',
                [usuario, hash, hashCodigo],
                (err, result) => {
                if (err) {
                    return res.status(400).json({ message: 'No se pudo registrar el perfil' });
                }

                const id_perfil = result.rows[0].id;

                database.query(
                    'INSERT INTO usuario(nombre, direccion, id_perfil) VALUES ($1, $2, $3)',
                    [nombre, direccion, id_perfil],
                    (err, result) => {
                        if (err) {
                            return res.status(400).json({ message: 'No se pudo registrar el usuario' });
                        }

                        return res.status(200).json({
                            message: 'Usuario registrado exitosamente',
                            codigo_unico: codigoUnico
                        });
                    }
                );
            }
        );
        });
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
                        return res.status(500).json({ message: 'No se pudo iniciar sesion' });
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
    // 2. Verificar código
    async VerificarCodigo(req, res) {
        const { usuario, codigo } = req.body;
        try {
            const result = await database.query(
                'SELECT codigo_unico FROM perfil WHERE usuario=$1',
                [usuario]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const perfil = result.rows[0];
            const codigoValido = await bcrypt.compare(codigo, perfil.codigo_unico);
            if (!codigoValido) {
                return res.status(400).json({ message: 'Código incorrecto' });
            }

            return res.status(200).json({ message: 'Código válido' });
        } catch (err) {
            return res.status(500).json({ message: 'No se pudo verificar el codigo' });
        }
    }

    async NuevoCodigoUnico(req, res) {

        const { usuario } = req.body;
        try {
            const nuevoCodigo = generarCodigoUnico();
            const hashCodigo = await bcrypt.hash(nuevoCodigo, salt_round);
            await database.query(
                'UPDATE perfil SET codigo_unico=$1 WHERE usuario=$2',
                [hashCodigo, usuario]
            );
            return res.status(200).json({ message: 'Nuevo código generado', codigo_unico: nuevoCodigo });
        } catch (err) {
            return res.status(500).json({ message: 'No se pudo generar un nuevo codigo' });
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
            return res.status(500).json({ message: 'No se pudo cambiar la contraseña' });
        }
    }
}

module.exports = new authControler();