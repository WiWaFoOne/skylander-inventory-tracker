// src/context/SkylanderContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const SkylanderContext = createContext();

// Custom hook for using the context
export function useSkylanderContext() {
  return useContext(SkylanderContext);
}

// Provider component
export function SkylanderProvider({ children }) {
  // State for storing skylander data
  const [skylanders, setSkylanders] = useState([]);
  
  // State for storing user inventory data
  const [userInventory, setUserInventory] = useState({});
  
  // Loading state
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on initial mount
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

  // Function to import skylander data from CSV or Google Sheet
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

  // Function to update inventory status for a skylander
  const updateInventoryStatus = (id, field, value) => {
    setUserInventory(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Function to add a skylander to inventory
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

  // Function to get filtered skylanders based on criteria
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

  // Function to clear all inventory data
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

  // Create a value object with all the data and functions to be provided
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

  // Return the provider with the value
  return (
    <SkylanderContext.Provider value={value}>
      {children}
    </SkylanderContext.Provider>
  );
}
