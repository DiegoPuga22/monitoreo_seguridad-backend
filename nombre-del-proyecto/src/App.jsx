// App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import About from './pages/About';
import Delegations from './pages/Delegations';
import Graphics from './pages/Graphics';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/graphics" element={<Graphics />} />
          <Route path="/delegations" element={<Delegations />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;