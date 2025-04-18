// App.js - Main component with routing
import { Routes, Route, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import Dashboard from './pages/Dashboard';
import ImportData from './pages/ImportData';
import SkylanderDetail from './pages/SkylanderDetail';
import ScanCamera from './pages/ScanCamera';
import TradeView from './pages/TradeView';
import ShareView from './pages/ShareView';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="skylander-app">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Skylander Inventory Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/import">Import Data</Nav.Link>
              <Nav.Link as={Link} to="/trade">Trade View</Nav.Link>
              <Nav.Link as={Link} to="/share">Share Collection</Nav.Link>
              <Nav.Link as={Link} to="/scan">Scan Skylander</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/import" element={<ImportData />} />
          <Route path="/skylander/:id" element={<SkylanderDetail />} />
          <Route path="/scan" element={<ScanCamera />} />
          <Route path="/trade" element={<TradeView />} />
          <Route path="/share" element={<ShareView />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;

// context/SkylanderContext.js - Context for managing skylander data
import React, { createContext, useContext, useState, useEffect } from 'react';

const SkylanderContext = createContext();

export function useSkylanderContext() {
  return useContext(SkylanderContext);
}

export function SkylanderProvider({ children }) {
  const [skylanders, setSkylanders] = useState([]);
  const [userInventory, setUserInventory] = useState({});
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on initial load
  useEffect(() => {
    const savedSkylanders = localStorage.getItem('skylanders');
    const savedInventory = localStorage.getItem('userInventory');
    
    if (savedSkylanders) {
      setSkylanders(JSON.parse(savedSkylanders));
    }
    
    if (savedInventory) {
      setUserInventory(JSON.parse(savedInventory));
    }
    
    setLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('skylanders', JSON.stringify(skylanders));
      localStorage.setItem('userInventory', JSON.stringify(userInventory));
    }
  }, [skylanders, userInventory, loading]);

  // Import skylanders data from CSV or Google Sheet
  const importSkylanders = (data) => {
    setSkylanders(data);
    
    // Initialize inventory for new skylanders
    const newInventory = { ...userInventory };
    data.forEach(skylander => {
      if (!newInventory[skylander.id]) {
        newInventory[skylander.id] = {
          have: false,
          need: false,
          count: 0,
          value: 0,
          currency: 'USD',
          forTrade: false,
          notes: ''
        };
      }
    });
    
    setUserInventory(newInventory);
  };

  // Update inventory status for a skylander
  const updateInventoryStatus = (id, field, value) => {
    setUserInventory(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Add a skylander to inventory
  const addToInventory = (id) => {
    setUserInventory(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        have: true,
        count: (prev[id]?.count || 0) + 1
      }
    }));
  };

  // Get filtered skylanders based on criteria
  const getFilteredSkylanders = (criteria) => {
    return skylanders.filter(skylander => {
      for (const [key, value] of Object.entries(criteria)) {
        if (skylander[key] !== value) {
          return false;
        }
      }
      return true;
    });
  };

  // Clear all inventory data
  const clearInventory = () => {
    const clearedInventory = {};
    skylanders.forEach(skylander => {
      clearedInventory[skylander.id] = {
        have: false,
        need: false,
        count: 0,
        value: 0,
        currency: 'USD',
        forTrade: false,
        notes: ''
      };
    });
    
    setUserInventory(clearedInventory);
  };

  const value = {
    skylanders,
    userInventory,
    loading,
    importSkylanders,
    updateInventoryStatus,
    addToInventory,
    getFilteredSkylanders,
    clearInventory
  };

  return (
    <SkylanderContext.Provider value={value}>
      {children}
    </SkylanderContext.Provider>
  );
}
