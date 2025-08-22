const mysql=require('mysql2')

const conexion=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'diabetesIA'
});

conexion.connect((error)=>{
    if(error){
        console.error('Error de conexión: ', error);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

module.exports=conexion;