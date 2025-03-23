// components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Querétaro Seguro</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/graphics">Gráficas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/delegations">Delegaciones</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">Nosotros</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;