import React, { useEffect, useState } from 'react';

// Definir la URL base del backend
const API_URL = "https://backend-monitoreo-seguridad.onrender.com";
// Nota: En un entorno de producción, podrías usar una variable de entorno como:
// const API_URL = process.env.REACT_APP_API_URL || "https://backend-monitoreo-seguridad.onrender.com";
// Luego, configura REACT_APP_API_URL en Vercel con el valor "https://backend-monitoreo-seguridad.onrender.com"

function Graphics() {
  const [activeTab, setActiveTab] = useState('barras');
  const [isLoading, setIsLoading] = useState(true);
  const [delegations, setDelegations] = useState([]);

  useEffect(() => {
    // Obtener la lista de delegaciones
    const fetchDelegations = async () => {
      try {
        const response = await fetch(`${API_URL}/api/zonas_riesgo`);
        const data = await response.json();
        setDelegations(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al obtener delegaciones:', error);
      }
    };

    fetchDelegations();
  }, []);

  const renderBarCharts = () => (
    <div className="row g-4">
      {delegations.map((delegation, index) => (
        <div key={index} className="col-md-6 col-lg-4 col-xl-3 mb-4">
          <div className="card shadow h-100 border-0 rounded-3 overflow-hidden">
            <div className="card-header bg-light py-3 fw-bold d-flex justify-content-between align-items-center border-bottom border-light">
              <span className="fs-5 text-dark">{delegation.nombre}</span>
              <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">{delegation.total} casos</span>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium text-danger">Alto riesgo</span>
                  <span className="fw-bold text-danger">{delegation.red}%</span>
                </div>
                <div className="progress mb-3 rounded-pill" style={{ height: "24px", backgroundColor: "rgba(220, 53, 69, 0.1)" }}>
                  <div
                    className="progress-bar bg-danger rounded-pill"
                    role="progressbar"
                    style={{ width: `${delegation.red}%` }}
                  >
                    <span className="fw-bold">{delegation.red}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium text-warning">Riesgo medio</span>
                  <span className="fw-bold text-warning">{delegation.yellow}%</span>
                </div>
                <div className="progress mb-3 rounded-pill" style={{ height: "24px", backgroundColor: "rgba(255, 193, 7, 0.1)" }}>
                  <div
                    className="progress-bar bg-warning rounded-pill"
                    role="progressbar"
                    style={{ width: `${delegation.yellow}%` }}
                  >
                    <span className="fw-bold">{delegation.yellow}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium text-success">Bajo riesgo</span>
                  <span className="fw-bold text-success">{delegation.green}%</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "24px", backgroundColor: "rgba(25, 135, 84, 0.1)" }}>
                  <div
                    className="progress-bar bg-success rounded-pill"
                    role="progressbar"
                    style={{ width: `${delegation.green}%` }}
                  >
                    <span className="fw-bold">{delegation.green}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="table-responsive rounded-3 shadow overflow-hidden">
      <table className="table table-hover mb-0 w-100">
        <thead className="bg-light text-dark">
          <tr>
            <th className="py-3 px-4 border-0" style={{ width: "25%" }}>Delegación</th>
            <th className="py-3 px-4 border-0 text-center" style={{ width: "15%" }}>Total Casos</th>
            <th className="py-3 px-4 border-0 text-center" style={{ width: "15%" }}>Alto Riesgo</th>
            <th className="py-3 px-4 border-0 text-center" style={{ width: "15%" }}>Riesgo Medio</th>
            <th className="py-3 px-4 border-0 text-center" style={{ width: "15%" }}>Bajo Riesgo</th>
            <th className="py-3 px-4 border-0" style={{ width: "15%" }}>Comparativa</th>
          </tr>
        </thead>
        <tbody>
          {delegations.map((delegation, index) => (
            <tr key={index}>
              <td className="py-3 px-4 fw-bold">{delegation.nombre}</td>
              <td className="py-3 px-4 text-center">{delegation.total}</td>
              <td className="py-3 px-4 text-center fw-medium text-danger">{delegation.red}%</td>
              <td className="py-3 px-4 text-center fw-medium text-warning">{delegation.yellow}%</td>
              <td className="py-3 px-4 text-center fw-medium text-success">{delegation.green}%</td>
              <td className="py-3 px-4">
                <div className="progress rounded-pill" style={{ height: "18px" }}>
                  <div className="progress-bar bg-danger" style={{ width: `${delegation.red}%` }}></div>
                  <div className="progress-bar bg-warning" style={{ width: `${delegation.yellow}%` }}></div>
                  <div className="progress-bar bg-success" style={{ width: `${delegation.green}%` }}></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">Análisis por Delegación</h2>
      </div>

      <div className="card mb-4 bg-light border-0 rounded-3 shadow-sm">
        <div className="card-body p-4">
          <h5 className="card-title d-flex align-items-center mb-3">
            <i className="bi bi-info-circle-fill text-primary me-2 fs-4"></i>
            <span className="fw-bold">Monitoreo de seguridad</span>
          </h5>
          <p className="card-text text-secondary mb-0">
            Estos gráficos muestran la distribución de incidentes por nivel de riesgo en cada delegación.
            Los porcentajes representan la proporción de zonas categorizadas según su nivel de seguridad.
          </p>
        </div>
      </div>

      <div className="btn-group mb-4 shadow-sm" role="group">
        <button
          className={`btn ${activeTab === 'barras' ? 'btn-primary' : 'btn-light'} py-2 px-4 fw-medium`}
          onClick={() => setActiveTab('barras')}
        >
          <i className="bi bi-bar-chart-fill me-2"></i>Barras
        </button>
        <button
          className={`btn ${activeTab === 'tabla' ? 'btn-primary' : 'btn-light'} py-2 px-4 fw-medium`}
          onClick={() => setActiveTab('tabla')}
        >
          <i className="bi bi-table me-2"></i>Tabla
        </button>
      </div>

      {isLoading ? (
        <div className="text-center my-5 py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-secondary fw-medium">Cargando datos...</p>
        </div>
      ) : (
        <div className="fade-in w-100">
          {activeTab === 'barras' ? renderBarCharts() : renderTable()}
        </div>
      )}
    </div>
  );
}

export default Graphics;