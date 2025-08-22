database= require('../database/conexion');
class AnalisisController{

    constructor(){}

    crearAnalisis(req,res){
    const {id_usuario,
        glucosa,
        insulina, 
        numero_de_embarazos, 
        presion_arterial,
        grosor_de_piel, 
        indice_de_masa_corporal,
        funcion_de_herencia, 
        edad, 
        Probabilidad_diabetes, 
        fecha_de_analisis}=req.body;

        database.query('INSERT INTO analisis (id_usuario, glucosa, insulina, numero_de_embarazos, presion_arterial, grosor_de_piel, indice_de_masa_corporal, funcion_de_herencia, edad, Probabilidad_diabetes, fecha_de_analisis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id_usuario, glucosa, insulina, numero_de_embarazos, presion_arterial, grosor_de_piel, indice_de_masa_corporal, funcion_de_herencia, edad, Probabilidad_diabetes, fecha_de_analisis], (error, results) => {
            if (error) {
              
                 res.status(500).json(error.message);
            }
            res.status(201).json({ message: 'Análisis creado', id: results.insertId });
        });
    }

    obtenerAnalisis(req,res){
      const  {id}=req.params;

       database.query('SELECT * FROM analisis WHERE id_usuario = ?', [id], (error, results) => {
        if(error){
            res.status(500).json(error.message);
        }

        res.status(200).json(results);

       });

    }

    eliminarAnalisis(req,res){
        const {id}= req.params;

        database.query('DELETE FROM analisis WHERE id_usuario = ?', [id], (error, results) => {
            if (error) {
                res.status(500).json(error.message);
            }
             if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontró ningún análisis para eliminar' });
        }
            res.status(200).json(results);
        });
    }

}

module.exports=  new AnalisisController();