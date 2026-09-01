const database = require('../database/conexion');
const analisisService = require('../Services/analisisService');

class AnalisisController {
    constructor() {}

    async crearAnalisis(req, res) {
        let Probabilidad_diabetes;
        const {
            id_paciente,
            glucosa,
            insulina,
            numero_de_embarazos,
            presion_arterial,
            grosor_de_piel,
            indice_de_masa_corporal,
            funcion_de_herencia,
            edad,
            fecha_de_analisis
        } = req.body;

        const features = [
            numero_de_embarazos,
            glucosa,
            presion_arterial,
            grosor_de_piel,
            insulina,
            indice_de_masa_corporal,
            funcion_de_herencia,
            edad
        ];

        try {
            // Llama al servicio que consulta el microservicio de modelo
            Probabilidad_diabetes = await analisisService.getProbability(features);
        } catch (error) {
            Probabilidad_diabetes = null;
        }

        // Validación: no registrar si la probabilidad es null o 0
        if (Probabilidad_diabetes === null || Probabilidad_diabetes === 0) {
            return res.status(400).json({ message: 'No se pudo obtener una probabilidad válida del modelo. El análisis no será registrado.' });
        }

        database.query(
            'INSERT INTO analisis (id_paciente, glucosa, insulina, numero_de_embarazos, presion_arterial, grosor_de_piel, indice_de_masa_corporal, funcion_de_herencia, edad, probabilidad_diabetes, fecha_de_analisis) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id_analisis',
            [
                id_paciente,
                glucosa,
                insulina,
                numero_de_embarazos,
                presion_arterial,
                grosor_de_piel,
                indice_de_masa_corporal,
                funcion_de_herencia,
                edad,
                Probabilidad_diabetes,
                fecha_de_analisis
            ],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'No se pudo crear el analisis' });
                }
                return res.status(201).json({ message: 'Análisis creado', id: result.rows[0].id_analisis });
            }
        );
    }

    obtenerAnalisis(req, res) {
        const id_paciente = req.params.id_paciente || req.params.id;

        database.query(
            'SELECT * FROM analisis WHERE id_paciente = $1',
            [id_paciente],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'No se pudieron obtener los analisis del paciente' });
                }
                return res.status(200).json(result.rows);
            }
        );
    }

    obtenerUltimoAnalisis(req, res) {
        const id_paciente = req.params.id_paciente || req.params.id;

        database.query(
            'SELECT * FROM analisis WHERE id_paciente = $1 ORDER BY fecha_de_analisis DESC NULLS LAST, id_analisis DESC LIMIT 1',
            [id_paciente],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'No se pudo obtener el ultimo analisis del paciente' });
                }
                if (result.rows.length === 0) {
                    return res.status(404).json({ message: 'El paciente no tiene analisis registrados' });
                }
                return res.status(200).json(result.rows[0]);
            }
        );
    }

    obtenerProbabilidad(req, res) {
        const id_paciente = req.params.id_paciente || req.params.id_usuario;
        try {
            database.query(
                'SELECT probabilidad_diabetes FROM analisis WHERE id_paciente = $1 ORDER BY id_analisis DESC LIMIT 1',
                [id_paciente],
                (error, result) => {
                    if (error) {
                        return res.status(500).json({ message: 'No se pudo obtener la probabilidad' });
                    }
                    if (result.rows.length === 0) {
                        return res.status(404).json({ message: 'No se encontró probabilidad para este usuario' });
                    }
                    return res.status(200).json(result.rows[0]);
                }
            );
        } catch (error) {
            return res.status(500).json({ message: 'Error interno al consultar la probabilidad' });
        }
    }

    eliminarAnalisis(req, res) {
        const id_paciente = req.params.id_paciente || req.params.id;

        database.query(
            'DELETE FROM analisis WHERE id_paciente = $1 RETURNING *',
            [id_paciente],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'No se pudieron eliminar los analisis del paciente' });
                }
                if (result.rows.length === 0) {
                    return res.status(404).json({ message: 'No se encontró ningún análisis para eliminar' });
                }
                return res.status(200).json(result.rows[0]);
            }
        );
    }
}

module.exports = new AnalisisController();