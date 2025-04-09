import React, { useEffect, useState } from 'react';

// Definir la URL base del backend
const API_URL = "https://backend-monitoreo-seguridad.onrender.com";
//const API_URL = "https://backend-monitoreo-seguridad.onrender.com";

// Nota: En un entorno de producción, podrías usar una variable de entorno como:
// const API_URL = process.env.REACT_APP_API_URL || "https://backend-monitoreo-seguridad.onrender.com";
// Luego, configura REACT_APP_API_URL en Vercel con el valor "https://backend-monitoreo-seguridad.onrender.com"

function Delegations() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDelegation, setSelectedDelegation] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [delegations, setDelegations] = useState([]);
  const [viewPeriod, setViewPeriod] = useState('day'); // 'day', 'week', 'month'
  const [selectedMonth, setSelectedMonth] = useState(""); // Para vista de mes
  const [selectedYear, setSelectedYear] = useState(""); // Para selección de año
  const [isPrediction, setIsPrediction] = useState(false); // Para identificar si es una predicción
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/delegaciones`)
      .then((response) => response.json())
      .then((data) => setDelegations(data))
      .catch((error) => console.error("Error fetching delegations:", error));
  }, []);

  useEffect(() => {
    if (selectedDelegation) {
      setIsLoading(true);
      let dateParam = '';
      let periodParam = viewPeriod;

      if (viewPeriod === 'month' && selectedMonth && selectedYear) {
        dateParam = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
      } else if (selectedDate) {
        dateParam = selectedDate.toISOString().split('T')[0];
      }

      // Verificar si la fecha es futura
      const currentDate = new Date();
      const isDateFuture = selectedDate ? selectedDate > currentDate : false;
      const isMonthFuture = selectedYear && selectedMonth ? 
        new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1) > currentDate : false;
      
      setIsPrediction(isDateFuture || isMonthFuture);

      fetch(
        `${API_URL}/incidentes?delegacion_id=${selectedDelegation.id}&fecha=${dateParam}&periodo=${periodParam}`
      )
        .then((response) => response.json())
        .then((data) => {
          setIncidents(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching incidents:", error);
          setIsLoading(false);
        });
    }
  }, [selectedDelegation, selectedDate, viewPeriod, selectedMonth, selectedYear]);

  // Actualizar la fecha de fin cuando cambia la fecha seleccionada para la vista de semana
  useEffect(() => {
    if (selectedDate && viewPeriod === 'week') {
      const endDateObj = new Date(selectedDate);
      endDateObj.setDate(endDateObj.getDate() + 6);
      setEndDate(endDateObj);
    } else {
      setEndDate(null);
    }
  }, [selectedDate, viewPeriod]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (newDate.toString() !== "Invalid Date") {
      setSelectedDate(newDate);
      setSelectedMonth(""); // Limpiar mes seleccionado si se selecciona una fecha específica
      setSelectedYear(""); // Limpiar año seleccionado si se selecciona una fecha específica
    } else {
      console.error("Invalid date selected");
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setSelectedDate(null); // Limpiar fecha seleccionada si se selecciona un mes
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedDate(null); // Limpiar fecha seleccionada si se selecciona un año
  };

  const handleDelegationClick = (delegation) => {
    setSelectedDelegation(delegation);
  };

  const handleViewPeriodChange = (period) => {
    setViewPeriod(period);
    setSelectedDate(null); // Resetear fecha al cambiar el período
    setSelectedMonth(""); // Resetear mes seleccionado al cambiar el período
    setSelectedYear(""); // Resetear año seleccionado al cambiar el período
    setEndDate(null); // Resetear fecha final al cambiar el período
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  // Función para obtener la clase del color basado en el código de color
  const getRiskBadgeClass = (colorCode) => {
    switch (colorCode) {
      case 'danger':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning text-dark';
      case 'success':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  // Función para obtener años para el selector
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    // Permitir selección de años desde el actual hasta 5 años adelante
    return Array.from({ length: 6 }, (_, index) => currentYear + index);
  };

  // Función para abrir el formulario de retroalimentación
  const handleFeedbackClick = (incident) => {
    setSelectedIncident(incident);
    setShowFeedbackForm(true);
  };

  // Función para enviar retroalimentación sobre una predicción
  const submitFeedback = (confirmed) => {
    if (!selectedIncident) return;

    // Parsear la hora y nivel de riesgo
    const hourMinute = selectedIncident.hora.split(':');
    const hour = hourMinute[0];
    const minute = hourMinute[1];
    
    // Determinar el nivel de riesgo basado en el nombre
    let riskLevel = 1; // Valor por defecto (bajo)
    if (selectedIncident.riesgo === "Medio") riskLevel = 2;
    if (selectedIncident.riesgo === "Alto") riskLevel = 3;

    const feedbackData = {
      incidente_id: selectedIncident.id,
      delegacion_id: selectedDelegation.id,
      tipo: selectedIncident.tipo,
      ubicacion: selectedIncident.ubicacion,
      fecha: selectedIncident.fecha,
      hora: `${hour}:${minute}:00`,
      nivel_riesgo_id: riskLevel,
      confirmado: confirmed
    };

    fetch(`${API_URL}/retroalimentacion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Feedback submitted:", data);
        setFeedbackSubmitted(true);
        setTimeout(() => {
          setShowFeedbackForm(false);
          setFeedbackSubmitted(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error submitting feedback:", error);
      });
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-geo-alt-fill me-2"></i>
                Delegaciones
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group rounded-0">
                {delegations.map((delegation) => (
                  <button
                    key={delegation.id}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                      selectedDelegation?.id === delegation.id ? 'active' : ''
                    }`}
                    onClick={() => handleDelegationClick(delegation)}
                  >
                    <div>
                      <i className="bi bi-building me-2"></i>
                      {delegation.nombre}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Selecciona una fecha
              </h5>
              {viewPeriod === 'month' ? (
                <div className="d-flex">
                  <select
                    className="form-control w-auto me-2"
                    value={selectedYear}
                    onChange={handleYearChange}
                  >
                    <option value="">Selecciona año</option>
                    {getYearOptions().map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control w-auto"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                  >
                    <option value="">Selecciona mes</option>
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index} value={`${index + 1}`.padStart(2, '0')}>
                        {new Date(0, index).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              ) : viewPeriod === 'week' ? (
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    <input
                      type="date"
                      className="form-control"
                      value={selectedDate ? formatDate(selectedDate) : ""}
                      onChange={handleDateChange}
                      min={formatDate(new Date())} // Permitir seleccionar desde hoy
                      placeholder="Fecha inicial"
                    />
                    <small className="text-muted">Fecha inicial</small>
                  </div>
                  <div className="me-2">
                    <span className="fw-bold">a</span>
                  </div>
                  <div>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate ? formatDate(endDate) : ""}
                      disabled
                      placeholder="Fecha final"
                    />
                    <small className="text-muted">Fecha final</small>
                  </div>
                </div>
              ) : (
                <input
                  type="date"
                  className="form-control w-auto"
                  value={selectedDate ? formatDate(selectedDate) : ""}
                  onChange={handleDateChange}
                  min={formatDate(new Date())} // Permitir seleccionar desde hoy
                />
              )}
            </div>
            <div className="card-body">
              <div className="btn-group w-100 mt-3" role="group">
                <button
                  className={`btn btn-outline-primary ${viewPeriod === 'day' ? 'active' : ''}`}
                  onClick={() => handleViewPeriodChange('day')}
                >
                  Día
                </button>
                <button
                  className={`btn btn-outline-primary ${viewPeriod === 'week' ? 'active' : ''}`}
                  onClick={() => handleViewPeriodChange('week')}
                >
                  Semana
                </button>
                <button
                  className={`btn btn-outline-primary ${viewPeriod === 'month' ? 'active' : ''}`}
                  onClick={() => handleViewPeriodChange('month')}
                >
                  Mes
                </button>
              </div>
            </div>
          </div>

          {selectedDelegation && (
            <div className="card shadow-sm">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-clipboard-data me-2"></i>
                  {isPrediction ? "Predicción de Incidentes" : "Incidentes"} en {selectedDelegation.nombre}
                </h5>
                {isPrediction && (
                  <span className="badge bg-info">Predicción</span>
                )}
              </div>
              <div className="card-body">
                {isLoading ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">
                      {isPrediction 
                        ? "Generando predicción de incidentes..." 
                        : "Cargando incidentes..."}
                    </p>
                  </div>
                ) : incidents.length > 0 ? (
                  <div>
                    {isPrediction && (
                      <div className="alert alert-info mb-4">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        ⚠️ Esta es una predicción basada en patrones históricos. Los incidentes mostrados son posibles escenarios que podrían ocurrir.
                      </div>
                    )}
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Ubicación</th>
                            <th>Hora</th>
                            {viewPeriod !== 'day' && <th>Fecha</th>}
                            <th>Nivel de Riesgo</th>
                            {isPrediction && <th>Acciones</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {incidents.map((incident) => (
                            <tr key={incident.id}>
                              <td>{incident.tipo}</td>
                              <td>{incident.ubicacion}</td>
                              <td>{incident.hora}</td>
                              {viewPeriod !== 'day' && (
                                <td>
                                  {new Date(incident.fecha).toLocaleDateString()}
                                </td>
                              )}
                              <td>
                                <span className={`badge ${getRiskBadgeClass(incident.codigo_color)}`}>
                                  {incident.riesgo}
                                </span>
                              </td>
                              {isPrediction && (
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleFeedbackClick(incident)}
                                  >
                                    <i className="bi bi-chat-left-text"></i> Feedback
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-center">
                    {isPrediction 
                      ? "No hay predicciones disponibles para esta fecha." 
                      : "No hay incidentes registrados para esta fecha."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Retroalimentación para Predicciones */}
      {showFeedbackForm && selectedIncident && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Retroalimentación de Predicción</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFeedbackForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                {feedbackSubmitted ? (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    ¡Gracias por tu retroalimentación! Esto ayudará a mejorar nuestras predicciones.
                  </div>
                ) : (
                  <>
                    <p>
                      ¿Consideras que esta predicción de incidente es acertada? Tu retroalimentación ayuda a mejorar nuestro sistema.
                    </p>
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Detalles del incidente:</h6>
                        <p className="mb-1"><strong>Tipo:</strong> {selectedIncident.tipo}</p>
                        <p className="mb-1"><strong>Ubicación:</strong> {selectedIncident.ubicacion}</p>
                        <p className="mb-1"><strong>Fecha:</strong> {new Date(selectedIncident.fecha).toLocaleDateString()}</p>
                        <p className="mb-1"><strong>Hora:</strong> {selectedIncident.hora}</p>
                        <p className="mb-0">
                          <strong>Nivel de Riesgo:</strong> 
                          <span className={`badge ms-2 ${getRiskBadgeClass(selectedIncident.codigo_color)}`}>
                            {selectedIncident.riesgo}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {!feedbackSubmitted && (
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => submitFeedback(false)}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    No Acertada
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => submitFeedback(true)}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Acertada
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay para el modal */}
      {showFeedbackForm && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}

export default Delegations;