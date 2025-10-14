const database = require('../database/conexion');
const bcrypt = require('bcryptjs');
const salt_round = 10;

class authControler {
    constructor() {}

    RegistroUsuario(req, res) {
        const { usuario, contrasena, nombre, apellido } = req.body;
        database.query("INSERT INTO usuario(nombre,apellido) VALUES ($1,$2)", [nombre, apellido], (err, result) => {
            if (err){
                return res.status(400).json({ message: 'Error al registrar usuario', error: err.message });
            }
            return res.status(200).json({ message: 'Usuario registrado exitosamente en la tabla usuario' });
        });
        bcrypt.hash(contrasena, salt_round, (err, hash) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            database.query(
                'INSERT INTO perfil(usuario, contrasena) VALUES ($1, $2)',
                [usuario, hash],
                (err, result) => {
                    if (err) {
                        return res.status(400).json({ message: 'Error al registrar usuario', error: err.message });
                    }
                    res.status(201).json({ message: 'Usuario registrado exitosamente' });
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
                        return res.status(200).json({ message: 'Inicio de sesión exitoso' });
                    });
                }
            );
        } catch (err) {
            return res.status(500).json({ message: 'Error al iniciar sesión catch' });
        }
    }
}

module.exports = new authControler();