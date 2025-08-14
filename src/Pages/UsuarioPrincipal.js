import {React} from 'react';
import Logo from '../Logo.jpeg';
import '../css/UsuarioPrincipal.css';
import {Navbar} from '../Componentes/Navbar';
import {InputField} from '../Componentes/inputField.js';
import {ProbabilityDonut} from '../Componentes/barraDonat.js';

function UsuarioPrincipal(){
    let probability = 70;

    return(

        <div className='Contenedor-principal'>
            <div className='Pantalla-principal'>
                <div className="navbar-container">
                <Navbar />
                </div>
                
                <div className='contendor-formulario'>
                    
                    <form className='Formulario'>
                        <h1> Entrada de datos clinicos</h1>
                            <InputField type="number" placeholder="Numero de embarazos" />
                            <InputField type="number" placeholder="Indice de glucosa" />
                            <InputField type="number" placeholder="Presion arterial" />
                            <InputField type="number" placeholder="Grosor de la piel" />
                            <InputField type="number" placeholder="Nivel de insulina" />
                            <InputField type="number" placeholder="Indice de masa corporal" />
                            <InputField type="number" placeholder="Funcion de herencia diabetica" />
                            <InputField type="number" placeholder="Edad" />
                            <input type="submit" value="Enviar" className="boton-enviar"/>
                    </form>
               
                </div>
                <div className='contenedor-grafica'> 
                    <h2>Resultado</h2>
                    <ProbabilityDonut probability={probability} />
                    {probability>=50? <p className='resultado-negativo'>Alto riesgo de diabetes</p> : <p className='resultado-positivo'>Bajo riesgo de diabetes</p>}
                </div>

              

            </div>
            

        </div>






    )
}

export default UsuarioPrincipal;