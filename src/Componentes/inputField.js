import {React} from 'react';
import '../css/input.css';
function InputField({type, placeholder}){
    return(

           <div className='input-field'>
                <input type={type} placeholder={placeholder}></input>
         
              </div>



    )
}

export {InputField};