const database = require('../database/conexion');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
}

module.exports = new authControler();