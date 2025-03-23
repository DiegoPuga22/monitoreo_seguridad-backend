// pages/About.js
import React from 'react';

function About() {
  const teamMembers = [
    { 
      name: "Owen Arredondo", 
      role: "Líder de Proyecto",
      description: "Especialista en análisis de datos y seguridad urbana con 7 años de experiencia.",
      image: null // Using null to trigger the silhouette placeholder
    },
    { 
      name: "David Tovar", 
      role: "Científico de Datos",
      description: "Experto en modelos predictivos y análisis estadístico de patrones de criminalidad.",
      image: null 
    },
    { 
      name: "Fernanda ", 
      role: "Desarrolladora Full-Stack",
      description: "Ingeniera de software especializada en aplicaciones de geolocalización y seguridad.",
      image: null
    },
    { 
      name: "Angel Isai", 
      role: "Experto en Seguridad",
      description: "Consultor con experiencia en prevención del delito y estrategias de seguridad comunitaria.",
      image: null
    },
    { 
      name: "Diego Ivan", 
      role: "Analista de Datos",
      description: "Especialista en visualización de datos y comunicación efectiva de información compleja.",
      image: null
    }
  ];

  return (
    <div className="container mt-5">
      {/* Hero section */}
      <div className="row mb-5">
        <div className="col-lg-6 order-lg-2 mb-4 mb-lg-0">
          <div className="position-relative">
            <div className="bg-primary position-absolute top-0 end-0 w-75 h-75 rounded" style={{ zIndex: 0, opacity: 0.1 }}></div>
            <img 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3" 
              alt="Equipo de trabajo" 
              className="img-fluid rounded shadow-sm position-relative" 
              style={{ zIndex: 1 }}
            />
          </div>
        </div>
        <div className="col-lg-6 order-lg-1 d-flex flex-column justify-content-center">
          <h1 className="display-5 fw-bold mb-4">Impulsando una Ciudad Segura</h1>
          <p className="lead">
            Somos un equipo multidisciplinario de cinco profesionales uniendo tecnología y seguridad para crear un Querétaro más seguro para todos.
          </p>
          <p>
            Nuestra misión es proporcionar información precisa y oportuna sobre los niveles de seguridad en diferentes zonas de la ciudad, permitiendo a los ciudadanos tomar decisiones informadas.
          </p>
          <div className="d-flex gap-2 mt-3">
            <a href="mailto:queretaroseguro@gmail.com">
              <button className="btn btn-primary px-4">
                <i className="bi bi-envelope me-2"></i>
                Contáctanos
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Process section */}
      <div className="row my-5">
        <div className="col-12 text-center mb-4">
          <h2 className="fw-bold">Nuestro Proceso</h2>
          <p className="text-muted">Cómo transformamos datos en seguridad</p>
        </div>
        
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-body p-4">
              <div className="row g-4">
                {[
                  { 
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3",
                    title: "Recopilación de datos", 
                    description: "Analizamos información histórica de incidentes de seguridad en las delegaciones de Querétaro." 
                  },
                  { 
                    image: "https://images.unsplash.com/photo-1551135049-8a33b5883817?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3",
                    title: "Análisis estadístico", 
                    description: "Aplicamos modelos predictivos para identificar patrones y tendencias en los datos." 
                  },
                  { 
                    image: "https://images.unsplash.com/photo-1569396116180-210c182bedb8?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3",
                    title: "Mapeo de riesgos", 
                    description: "Creamos visualizaciones que muestran niveles de riesgo por zonas y momentos del día." 
                  },
                  { 
                    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3",
                    title: "Recomendaciones", 
                    description: "Ofrecemos información práctica para ayudar a los ciudadanos a mantenerse seguros." 
                  }
                ].map((step, index) => (
                  <div key={index} className="col-md-6 col-lg-3">
                    <div className="text-center">
                      <div 
                        className="d-inline-flex justify-content-center align-items-center bg-white rounded-circle shadow-sm mb-3 overflow-hidden" 
                        style={{ width: "80px", height: "80px" }}
                      >
                        <img 
                          src={step.image} 
                          alt={step.title} 
                          className="img-fluid" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <h5 className="fw-bold">{step.title}</h5>
                      <p className="mb-0">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team section */}
      <div className="row my-5">
        <div className="col-12 text-center mb-4">
          <h2 className="fw-bold">Nuestro Equipo</h2>
          <p className="text-muted">Conoce a los profesionales detrás del proyecto</p>
        </div>
      </div>
      
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
        {teamMembers.map((member, index) => (
          <div key={index} className="col">
            <div className="card h-100 border-0 shadow-sm">
              <div className="text-center mt-4">
                <div className="rounded-circle overflow-hidden mx-auto bg-light" style={{ width: "120px", height: "120px" }}>
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="img-fluid" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex justify-content-center align-items-center bg-secondary">
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="#ffffff" 
                        className="w-75 h-75"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body text-center">
                <h5 className="card-title fw-bold mb-1">{member.name}</h5>
                <p className="text-primary mb-3">{member.role}</p>
                <p className="card-text">{member.description}</p>
              </div>
              {/* Se eliminó el card-footer con los botones de contacto */}
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="row my-5">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body p-5 text-center">
              <h3 className="fw-bold mb-3">¿Quieres colaborar en este proyecto?</h3>
              <p className="mb-4">
                Siempre estamos buscando mejorar nuestros modelos y análisis. Si tienes experiencia en seguridad, 
                ciencia de datos o desarrollo, nos encantaría hablar contigo.
              </p>
              <a href="mailto:queretaroseguro@gmail.com">
                <button className="btn btn-light text-primary px-4">
                  <i className="bi bi-envelope me-2"></i>
                  Contáctanos
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;