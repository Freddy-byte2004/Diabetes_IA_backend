const database = require('../database/conexion');
const axios = require('axios');

class AnalisisController {
    constructor() {}

    async crearAnalisis(req, res) {
        let Probabilidad_diabetes;
        const {
            id_usuario,
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
            // Llama a la api de Python para obtener la predicción
            const response = await axios.post('https://microserviciomodelo.onrender.com/predict', {
                features: features
            });

            Probabilidad_diabetes = response.data.probabilidad_diabetes;
        } catch (error) {
            Probabilidad_diabetes = null;
        }

        database.query(
            'INSERT INTO analisis (id_usuario, glucosa, insulina, numero_de_embarazos, presion_arterial, grosor_de_piel, indice_de_masa_corporal, funcion_de_herencia, edad, probabilidad_diabetes, fecha_de_analisis) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id_analisis',
            [
                id_usuario,
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
                    return res.status(500).json(error.message);
                }
                return res.status(201).json({ message: 'Análisis creado', id: result.rows[0].id_analisis });
            }
        );
    }

    obtenerAnalisis(req, res) {
        const { id } = req.params;

        database.query(
            'SELECT * FROM analisis WHERE id_usuario = $1',
            [id],
            (error, result) => {
                if (error) {
                    return res.status(500).json(error.message);
                }
                return res.status(200).json(result.rows);
            }
        );
    }

    obtenerProbabilidad(req, res) {
        const { id_usuario } = req.params;
        try {
            database.query(
                'SELECT probabilidad_diabetes FROM analisis WHERE id_usuario = $1 ORDER BY fecha_de_analisis DESC LIMIT 1',
                [id_usuario],
                (error, result) => {
                    if (error) {
                        return res.status(401).json(error.message);
                    }
                    if (result.rows.length === 0) {
                        return res.status(404).json({ message: 'No se encontró probabilidad para este usuario' });
                    }
                    return res.status(200).json(result.rows[0]);
                }
            );
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }

    eliminarAnalisis(req, res) {
        const { id } = req.params;

        database.query(
            'DELETE FROM analisis WHERE id_usuario = $1 RETURNING *',
            [id],
            (error, result) => {
                if (error) {
                    return res.status(500).json(error.message);
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