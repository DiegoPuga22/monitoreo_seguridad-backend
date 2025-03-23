import React, { useState, useEffect } from "react";

const GenderStatsCard = () => {
  const [menPercentage, setMenPercentage] = useState(0);
  const [womenPercentage, setWomenPercentage] = useState(0);

  useEffect(() => {
    fetch("/gender-stats")
      .then(response => response.json())
      .then(data => {
        setMenPercentage(data.menPercentage);
        setWomenPercentage(data.womenPercentage);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-light fw-bold">
        Estadísticas por género
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h5 className="text-center mb-3">Incidentes por género</h5>
            <div
              className="position-relative"
              style={{ height: "200px", width: "200px", margin: "0 auto" }}
            >
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  width: "100%",
                  borderRadius: "50%",
                  background: `conic-gradient(#36a2eb 0% ${menPercentage}%, #ff6384 ${menPercentage}% 100%)`
                }}
              />
              <div
                className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "80px", height: "80px" }}
              >
                <div className="text-center">
                  <div className="small">Total</div>
                  <div className="fw-bold">100%</div>
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex justify-content-center gap-4">
              <div className="d-flex align-items-center">
                <div
                  style={{ width: "20px", height: "20px", backgroundColor: "#36a2eb", marginRight: "5px" }}
                />
                <span>Hombres ({menPercentage}%)</span>
              </div>
              <div className="d-flex align-items-center">
                <div
                  style={{ width: "20px", height: "20px", backgroundColor: "#ff6384", marginRight: "5px" }}
                />
                <span>Mujeres ({womenPercentage}%)</span>
              </div>
            </div>
          </div>
          <div className="col-md-6 d-flex align-items-center">
            <div>
              <h5 className="mb-3">Distribución de incidentes por género</h5>
              <p>
                Los datos muestran que el <strong>{menPercentage}%</strong> de las víctimas son hombres, mientras que el{" "}
                <strong>{womenPercentage}%</strong> son mujeres.
              </p>
              <div className="alert alert-info">
                <i className="bi bi-info-circle-fill me-2"></i>
                Estos datos corresponden al total de incidentes reportados en todas las delegaciones durante el último trimestre.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderStatsCard;
