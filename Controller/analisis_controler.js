database= require('../database/conexion');
const axios= require('axios');
class AnalisisController{

    constructor(){}
    
    async crearAnalisis(req,res){
    let Probabilidad_diabetes;
    const {id_usuario,
        glucosa,
        insulina, 
        numero_de_embarazos, 
        presion_arterial,
        grosor_de_piel, 
        indice_de_masa_corporal,
        funcion_de_herencia, 
        edad,  
        fecha_de_analisis}=req.body;
    
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

  try{
    // Llama a la api de Python para obtener la predicción
    const response = await axios.post('http://localhost:5000/predict', {
      features: features
    });

     Probabilidad_diabetes = response.data.probabilidad_diabetes;
  }catch(error){}

        database.query('INSERT INTO analisis (id_usuario, glucosa, insulina, numero_de_embarazos, presion_arterial, grosor_de_piel, indice_de_masa_corporal, funcion_de_herencia, edad, Probabilidad_diabetes, fecha_de_analisis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id_usuario, glucosa, insulina, numero_de_embarazos, presion_arterial, grosor_de_piel, indice_de_masa_corporal, funcion_de_herencia, edad, Probabilidad_diabetes, fecha_de_analisis], (error, results) => {
            if (error) {
              
                return res.status(500).json(error.message);
            }
            return res.status(201).json({ message: 'Análisis creado', id: results.insertId });
        });
    }

    obtenerAnalisis(req,res){
      const  {id}=req.params;

       database.query('SELECT * FROM analisis WHERE id_usuario = ?', [id], (error, results) => {
        if(error){
           return res.status(500).json(error.message);
        }

        return res.status(200).json(results);

       });

    }
    obtenerProbabilidad(req,res){
        const  {id_usuario}=req.params;
       try{ 
             database.query('SELECT Probabilidad_diabetes FROM Analisis WHERE id_usuario = ? ORDER BY fecha_de_analisis DESC LIMIT 1',[id_usuario],(error,result)=>{
            if(error){
               return res.status(401).json(error.message);
            }
            return res.status(200).json(result[0]);
        });
        }catch(error){
            return res.status(500).json(error.message);
        }
}

    eliminarAnalisis(req,res){
        const {id}= req.params;

        database.query('DELETE FROM analisis WHERE id_usuario = ?', [id], (error, results) => {
            if (error) {
               return res.status(500).json(error.message);
            }
             if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontró ningún análisis para eliminar' });
        }
            return res.status(200).json(results);
        });
    }

}

module.exports=  new AnalisisController();