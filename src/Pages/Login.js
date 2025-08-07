import Logo from '../Logo.jpeg';
import '../css/login.css';
import { AiFillMail, AiFillLock } from "react-icons/ai";
function onSubmit(event) {
  event.preventDefault();
}
function Login() {
return( 
  <div className='Contenedor-principal'>
    <div className='Contenedor-login'>
        <div className='logo'>
            <img src={Logo} alt="Logo de la aplicación" />  
        </div>
        <div className='titulo'><h1>AI Prediccion de diabetes</h1></div>
        <div className='formulario'>
            <form onSubmit={onSubmit}>
                <div className='input-correo'><AiFillMail />  <input type="email" placeholder='Ingrese su correo' /></div>
              

               <div className='input-contraseña'><AiFillLock />  <input type="password" placeholder='Ingrese su contraseña' /></div> 
                <div className='boton'> <input type="submit" value="Iniciar sesión" /></div>
               
            </form>
            
        </div>
        <div className='pie'>
          <div className='Olvido-contrasena'><a href='#'>¿Has olvidado la contraseña?</a></div>  
            <div className='registro'><a href='#'>Regístrate</a></div>
        </div>
    </div>
  </div>
);
}

export default Login;