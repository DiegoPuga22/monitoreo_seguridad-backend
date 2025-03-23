import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Añade una animación de entrada al cargar la página
    setIsVisible(true);
  }, []);
  
  return (
    <div
      className="container-fluid p-0 position-relative text-center"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(/queretaro-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden'
      }}
    >
      {/* Overlay para mejorar la legibilidad del texto */}
      <div className="position-absolute w-100 h-100 top-0 start-0 bg-dark opacity-40"></div>
      
      {/* Contenido principal */}
      <div
        className={`d-flex flex-column justify-content-center align-items-center h-100 position-relative ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transition: 'opacity 1.5s ease-in-out, transform 1s ease-out',
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          zIndex: 10
        }}
      >
        <h1 className="display-2 fw-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Querétaro seguro, futuro seguro
        </h1>
        <p className="lead fw-normal text-white mb-5 px-3 col-md-8" style={{ fontSize: '1.3rem', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
          Juntos construimos una ciudad más segura para todos. Descubre cómo puedes 
          contribuir a proteger tu comunidad y crear un entorno de confianza.
        </p>
        <div className="d-flex gap-3">
          <Link to="/delegations" className="btn btn-primary btn-lg px-4 py-2 fw-semibold shadow-sm" 
                style={{ transition: 'transform 0.3s ease' }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
            Comenzar
          </Link>
          <Link to="/about" className="btn btn-outline-light btn-lg px-4 py-2 shadow-sm"
                style={{ transition: 'transform 0.3s ease' }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
            Más información
          </Link>
        </div>
        
        {/* Estadísticas o información adicional */}
        <div className="container mt-5">
          <div className="row text-white g-4 justify-content-center">
            <div className="col-md-4 col-lg-3">
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(5px)' }}>
                <i className="bi bi-shield-check mb-2" style={{ fontSize: '2rem' }}></i>
                <h4 className="fs-5 fw-semibold">Seguridad Comunitaria</h4>
                <p className="small mb-0">Protección en cada rincón de nuestra ciudad</p>
              </div>
            </div>
            <div className="col-md-4 col-lg-3">
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(5px)' }}>
                <i className="bi bi-buildings mb-2" style={{ fontSize: '2rem' }}></i>
                <h4 className="fs-5 fw-semibold">Patrimonio Cultural</h4>
                <p className="small mb-0">Preservando nuestra historia y tradiciones</p>
              </div>
            </div>
            <div className="col-md-4 col-lg-3">
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(5px)' }}>
                <i className="bi bi-people-fill mb-2" style={{ fontSize: '2rem' }}></i>
                <h4 className="fs-5 fw-semibold">Comunidad Unida</h4>
                <p className="small mb-0">Trabajando juntos por un mejor Querétaro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 text-white">
      
        <i className="bi bi-chevron-down" style={{ 
          fontSize: '1.5rem', 
          animation: 'bounce 2s infinite',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          transitionDelay: '0.5s'
        }}></i>
      </div>
      
      {/* Estilos para la animación */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-20px); }
            60% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  );
}

export default Home;