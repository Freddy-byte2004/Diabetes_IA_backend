database= require('../database/conexion'); 
const bcrypt= require('bcrypt');
const salt_round=10;
class authControler{ 
    constructor(){} 
    RegistroUsuario(req,res){ 
        
        const {usuario, contrasena}= req.body; 
        bcrypt.hash(contrasena,salt_round, (err, hash)=>{ 
            if(err){ 
                res.status(500).send(err.message) 
            } 
            database.query('INSERT INTO `perfil`(`usuario`, `contraseña`) VALUES (?, ?)',
             [usuario, hash], 
             (err, result)=>{ 
                if(err){ 
                    res.status(400).json({message: 'Error al registrar usuario'}) 
                } 
                res.status(201).json(result) 
            } ) 
        } ) 
    } 
        
        InicioSesion(req,res){ 
            const{usuario, contrasena}= req.body; 
            try{
                database.query('SELECT * FROM `perfil` WHERE usuario=?', [usuario], (err, result)=>{
                    if(err){
                       return  res.status(400).json({message: 'Error al iniciar sesión'}) 
                    }
                    if(result.length===0){
                        return res.status(401).json({message: 'Usuario no encontrado'}) 
                    }
                    const usuarioDB= result[0];
                    bcrypt.compare(contrasena, usuarioDB.contraseña, (err, comprobado)=>{
                      
                        if(err){
                           return res.status(500).json({message: 'Error al comparar contraseñas'});
                        }
                        if(!comprobado){
                           return res.status(401).json({message: 'Contraseña incorrecta'}) 
                        }
                       return res.status(200).json({message: 'Inicio de sesión exitoso'})
                    })
                })

            }catch(err){
                if(err){
                   return  res.status(500).json({message: 'Error al iniciar sesión catch'}) 
                }
            }
            } 
        } 
            module.exports= new authControler();