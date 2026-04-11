const database = require('../database/conexion');

class PacienteController {
	constructor() {}

	obtenerPacientes(req, res) {
		const { id_institucion } = req.params;
		   
		database.query(
			'SELECT * FROM paciente WHERE id_institucion=$1 ORDER BY id_paciente DESC',
			[id_institucion],
			(error, result) => {
				if (error) {
					return res.status(500).json({ message: 'No se pudieron obtener los pacientes' });
				}
				return res.status(200).json(result.rows);
			}
		);
	}

	obtenerPacientePorID(req, res) {
		const { id } = req.params;

		database.query(
			'SELECT * FROM paciente WHERE id_paciente = $1',
			[id],
			(error, result) => {
				if (error) {
					return res.status(500).json({ message: 'No se pudo consultar el paciente' });
				}
				if (result.rows.length === 0) {
					return res.status(404).json({ message: 'Paciente no encontrado' });
				}
				return res.status(200).json(result.rows[0]);
			}
		);
	}

	crearPaciente(req, res) {
		
		const {
			cedula,
			nombre,
			apellido,
			direccion,
			telefono,
			sexo,
			fecha_de_nacimiento,
			fecha_de_diagnostico,
			id_institucion
		} = req.body;

		database.query(
			'INSERT INTO paciente (cedula, nombre, apellido, direccion, telefono, sexo, fecha_de_nacimiento, fecha_de_diagnostico, id_institucion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
			[
				cedula,
				nombre,
				apellido,
				direccion,
				telefono,
				sexo,
				fecha_de_nacimiento,
				fecha_de_diagnostico,
				id_institucion
			],
				(error, result) => {
					if (error) {
						
						return res.status(500).json({ message: 'No se pudo crear el paciente', error: error.message });
					}
					return res.status(201).json(result.rows[0]);
				}
		);
	}

	actualizarPaciente(req, res) {
		const { id } = req.params;
		const {
			cedula,
			nombre,
			apellido,
			direccion,
			telefono,
			sexo,
			fecha_de_nacimiento,
			fecha_de_diagnostico
		} = req.body;

		database.query(
			'UPDATE paciente SET cedula = $1, nombre = $2, apellido = $3, direccion = $4, telefono = $5, sexo = $6, fecha_de_nacimiento = $7, fecha_de_diagnostico = $8 WHERE id_paciente = $9 RETURNING *',
			[
				cedula,
				nombre,
				apellido,
				direccion,
				telefono,
				sexo,
				fecha_de_nacimiento,
				fecha_de_diagnostico,
				id
			],
			(error, result) => {
				if (error) {
					return res.status(500).json({ message: 'No se pudo actualizar el paciente' });
				}
				if (result.rows.length === 0) {
					return res.status(404).json({ message: 'Paciente no encontrado' });
				}
				return res.status(200).json(result.rows[0]);
			}
		);
	}

	eliminarPaciente(req, res) {
		const { id } = req.params;

		database.query(
			'DELETE FROM paciente WHERE id_paciente = $1 RETURNING *',
			[id],
			(error, result) => {
				if (error) {
					return res.status(500).json({ message: 'No se pudo eliminar el paciente' });
				}
				if (result.rows.length === 0) {
					return res.status(404).json({ message: 'Paciente no encontrado' });
				}
				return res.status(200).json({ message: 'Paciente eliminado', paciente: result.rows[0] });
			}
		);
	}
}

module.exports = new PacienteController();
