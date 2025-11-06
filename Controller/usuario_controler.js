const database = require('../database/conexion');
class usuarioController {
    constructor() {}

    obtenerIdUsuario(req, res) {
        const { correo } = req.params;
        try {
            database.query(
                'SELECT u.id_usuario FROM usuario u JOIN perfil p ON u.id_perfil = p.id WHERE p.usuario = $1',
                [correo],
                (err, result) => {
                    if (err) {
                        return res.status(400).send(err.message);
                    }
                    if (result.rows.length > 0) {
                        return res.status(200).json(result.rows[0]);
                    } else {
                        return res.status(404).send('Usuario no encontrado');
                    }
                }
            );
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    obtenerUsuario(req, res) {
        const { id } = req.params;
        try {
            database.query(
                'SELECT * FROM usuario WHERE id_usuario = $1',
                [id],
                (err, result) => {
                    if (err) {
                        return res.status(400).send(err.message);
                    }
                    if (result.rows.length > 0) {
                        return res.status(200).json(result.rows);
                    } else {
                        return res.status(404).send('Usuario no encontrado');
                    }
                }
            );
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    ingresarUsuario(req, res) {
        const { id_perfil, cedula, telefono, direccion } = req.body;
        try {
            database.query(
                'INSERT INTO usuario (id_perfil, cedula, telefono, direccion) VALUES ($1, $2, $3, $4) RETURNING *',
                [id_perfil, cedula, telefono, direccion],
                (err, result) => {
                    if (err) {
                        return res.status(400).send(err.message);
                    }
                    return res.status(201).json(result.rows[0]);
                }
            );
        } catch (err) {
            res.status(500).send(err.message);
        }
    }


            actualizarUsuario(req, res) {
    const { id } = req.params;
    const { cedula, telefono, direccion } = req.body;
    try {
        database.query(
            'UPDATE usuario SET cedula = $1, telefono = $2, direccion = $3 WHERE id_usuario = $4 RETURNING *',
            [cedula, telefono, direccion, id],
            (err, result) => {
                if (err) {
                    return res.status(400).send(err.message);
                }
                if (result.rows.length > 0) {
                    return res.status(200).json(result.rows[0]);
                } else {
                    return res.status(404).send('Usuario no encontrado');
                }
            }
        );
    } catch (err) {
        res.status(500).send(err.message);
    }
}

    
    eliminarUsuario(req, res) {
        const { id } = req.params;
        try {
            database.query(
                'DELETE FROM usuario WHERE id_usuario = $1 RETURNING *',
                [id],
                (err, result) => {
                    if (err) {
                        return res.status(400).send(err.message);
                    }
                    return res.status(200).json(result.rows[0]);
                }
            );
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    obtenerAnalisisUsuario(req, res) {
        const { id } = req.params;
        try {
            database.query(
                'SELECT * FROM analisis WHERE id_usuario = $1',
                [id],
                (err, result) => {
                    if (err) {
                        return res.status(400).send(err.message);
                    }
                    if (result.rows.length > 0) {
                        return res.status(200).json(result.rows);
                    } else {
                        return res.status(404).send('No se encontraron análisis para este usuario');
                    }
                }
            );
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }
}

module.exports = new usuarioController();