import React from "react";
import '../css/Navbar.css';
import Logo from '../Logo.jpeg';
import { AiFillHome, AiFillPlusSquare, AiFillClockCircle, AiFillProfile, AiFillCloseCircle } from "react-icons/ai";
function Navbar() {
    return(
        <nav className="navbar">
            <div className="navbar-brand">
                <img src={Logo} alt="Logo" className="logo-navbar" />
            </div>
            <div className="navbar-content">
              <div className="Inicio"><a href='#'><AiFillHome/>Inicio</a></div>
              <div className="NuevoAnalisis"><a href='#'><AiFillPlusSquare/>Nuevo Análisis</a></div>
              <div className="Historial"><a href='#'><AiFillClockCircle/>Historial</a></div>
              <div className="Perfil"><a href='#'><AiFillProfile/>Perfil</a></div>
              <div className="CerrarSesion"><a href='#'><AiFillCloseCircle/>Cerrar Sesión</a></div>
            </div>
        </nav>
    )
}
export {Navbar};