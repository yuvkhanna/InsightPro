import React, { useState } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import UploadCSV from './components/UploadCSV';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [dashboardData, setDashboardData] = useState(null);

  const handleUploadSuccess = (data) => {
    setDashboardData(data);
  };

  return (
    <div className="app">
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">
            <i className="bi bi-graph-up me-2"></i>
            InsightPro
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container>
        {!dashboardData ? (
          <UploadCSV onUploadSuccess={handleUploadSuccess} />
        ) : (
          <Dashboard data={dashboardData} />
        )}
      </Container>
    </div>
  );
}

export default App; 