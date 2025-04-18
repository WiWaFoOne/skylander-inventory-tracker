// src/pages/ShareView.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, 
  Table, Badge, Alert, Tab, Tabs,
  ListGroup, InputGroup
} from 'react-bootstrap';
import { useSkylanderContext } from '../context/SkylanderContext';

// Helper function to get color for element badges
function getElementColor(element) {
  const colors = {
    'Air': 'info',
    'Earth': 'success',
    'Fire': 'danger',
    'Life': 'success',
    'Magic': 'purple',
    'Tech': 'warning',
    'Undead': 'dark',
    'Water': 'primary',
    'Light': 'warning',
    'Dark': 'dark'
  };
  
  return colors[element] || 'secondary';
}

function ShareView() {
  const { skylanders, userInventory } = useSkylanderContext();
  
  const [selectedSkylanders, setSelectedSkylanders] = useState({});
  const [shareTitle, setShareTitle] = useState('My Skylanders Collection');
  const [shareDescription, setShareDescription] = useState('Check out my Skylanders collection!');
  const [showValues, setShowValues] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [activeSave, setActiveSave] = useState(null);
  const [savedViews, setSavedViews] = useState([]);
  
  // Load saved views from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedShareViews');
    if (saved) {
      setSavedViews(JSON.parse(saved));
    }
  }, []);
  
  // Save views to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedShareViews', JSON.stringify(savedViews));
  }, [savedViews]);
  
  // Handle selecting/deselecting a skylander
  const toggleSelectSkylander = (skylanderId) => {
    setSelectedSkylanders(prev => ({
      ...prev,
      [skylanderId]: !prev[skylanderId]
    }));
  };
  
  // Select all skylanders in inventory
  const selectAllInInventory = () => {
    const newSelected = {};
    skylanders.forEach(skylander => {
      if (userInventory[skylander.id]?.have) {
        newSelected[skylander.id] = true;
      }
    });
    setSelectedSkylanders(newSelected);
  };
  
  // Clear all selections
  const clearSelections = () => {
    setSelectedSkylanders({});
  };
  
  // Generate share link
  const generateShareLink = () => {
    // Create share data object
    const shareData = {
      title: shareTitle,
      description: shareDescription,
      showValues: showValues,
      skylanders: Object.keys(selectedSkylanders)
        .filter(id => selectedSkylanders[id])
        .map(id => {
          const skylander = skylanders.find(s => s.id === id);
          const inventoryData = userInventory[id];
          
          return {
            id: id,
            name: skylander.name,
            element: skylander.element,
            category: skylander.category,
            imageUrl: skylander.imageUrl,
            count: inventoryData?.count || 0,
            value: showValues ? (inventoryData?.value || 0) : null
          };
        })
    };
    
    // In a real app, you would send this data to a server and get a shareable link
    // For this demo, we'll encode it as a JSON string in a fake URL
    const encodedData = btoa(JSON.stringify(shareData));
    const link = `https://skylander-inventory.example.com/shared/${encodedData}`;
    
    setShareLink(link);
    setShowShareLink(true);
  };
  
  // Save current view
  const saveCurrentView = () => {
    const newView = {
      id: Date.now().toString(),
      title: shareTitle,
      description: shareDescription,
      showValues: showValues,
      selectedIds: Object.keys(selectedSkylanders).filter(id => selectedSkylanders[id]),
      createdAt: new Date().toISOString()
    };
    
    setSavedViews(prev => [...prev, newView]);
    setActiveSave(newView.id);
  };
  
  // Load a saved view
  const loadSavedView = (viewId) => {
    const view = savedViews.find(v => v.id === viewId);
    
    if (view) {
      setShareTitle(view.title);
      setShareDescription(view.description);
      setShowValues(view.showValues);
      
      const newSelected = {};
      view.selectedIds.forEach(id => {
        newSelected[id] = true;
      });
      
      setSelectedSkylanders(newSelected);
      setActiveSave(viewId);
    }
  };
  
  // Delete a saved view
  const deleteSavedView = (viewId, event) => {
    event.stopPropagation();
    
    setSavedViews(prev => prev.filter(v => v.id !== viewId));
    
    if (activeSave === viewId) {
      setActiveSave(null);
    }
  };
  
  // Filter skylanders that are in the user's inventory
  const inventorySkylanders = skylanders.filter(
    skylander => userInventory[skylander.id]?.have
  );
  
  // Count selected skylanders
  const selectedCount = Object.values(selectedSkylanders).filter(Boolean).length;
  
  return (
    <Container>
      <h2 className="mb-4">Share Your Collection</h2>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>Collection Details</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control 
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder="My Awesome Skylanders Collection"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={3}
                    value={shareDescription}
                    onChange={(e) => setShareDescription(e.target.value)}
                    placeholder="Share details about your collection..."
                  />
                </Form.Group>
                
                <Form.Check 
                  type="checkbox"
                  id="show-values"
                  label="Show Skylander Values"
                  checked={showValues}
                  onChange={(e) => setShowValues(e.target.checked)}
                  className="mb-3"
                />
                
                <div className="d-flex justify-content-between">
                  <div>
                    <Button 
                      variant="outline-primary" 
                      onClick={selectAllInInventory}
                      className="me-2"
                    >
                      Select All ({inventorySkylanders.length})
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={clearSelections}
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div>
                    <Button 
                      variant="outline-success" 
                      onClick={saveCurrentView}
                      className="me-2"
                    >
                      Save View
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={generateShareLink}
                      disabled={selectedCount === 0}
                    >
                      Generate Share Link
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          {showShareLink && (
            <Card className="mb-4">
              <Card.Header>Share Link</Card.Header>
              <Card.Body>
                <InputGroup>
                  <Form.Control 
                    type="text"
                    value={shareLink}
                    readOnly
                  />
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      alert('Link copied to clipboard!');
                    }}
                  >
                    Copy
                  </Button>
                </InputGroup>
                <p className="text-muted mt-2">
                  Share this link with others to show them your Skylanders collection.
                </p>
              </Card.Body>
            </Card>
          )}
          
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                Select Skylanders to Share ({selectedCount} selected)
              </span>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}></th>
                    <th style={{ width: '60px' }}></th>
                    <th>Name</th>
                    <th>Element</th>
                    <th>Quantity</th>
                    {showValues && <th>Value</th>}
                  </tr>
                </thead>
                <tbody>
                  {inventorySkylanders.map(skylander => (
                    <tr 
                      key={skylander.id}
                      className={selectedSkylanders[skylander.id] ? 'table-primary' : ''}
                      onClick={() => toggleSelectSkylander(skylander.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <Form.Check 
                          type="checkbox"
                          checked={selectedSkylanders[skylander.id] || false}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td>
                        {skylander.imageUrl && (
                          <img 
                            src={skylander.imageUrl} 
                            alt={skylander.name}
                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                          />
                        )}
                      </td>
                      <td>{skylander.name}</td>
                      <td>
                        <Badge 
                          bg={getElementColor(skylander.element)}
                          className="text-white"
                        >
                          {skylander.element}
                        </Badge>
                      </td>
                      <td>{userInventory[skylander.id]?.count || 0}</td>
                      {showValues && (
                        <td>${(userInventory[skylander.id]?.value || 0).toFixed(2)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {inventorySkylanders.length === 0 && (
                <Alert variant="info">
                  You don't have any Skylanders in your collection yet. 
                  Add some Skylanders to your inventory first.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>Saved Views</Card.Header>
            <Card.Body>
              {savedViews.length > 0 ? (
                <ListGroup>
                  {savedViews.map(view => (
                    <ListGroup.Item 
                      key={view.id}
                      action
                      active={activeSave === view.id}
                      onClick={() => loadSavedView(view.id)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-bold">{view.title}</div>
                        <small>
                          {view.selectedIds.length} Skylanders - 
                          {new Date(view.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={(e) => deleteSavedView(view.id, e)}
                      >
                        ×
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted text-center my-3">
                  No saved views yet. Save a view to reuse it later.
                </p>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>Share Preview</Card.Header>
            <Card.Body>
              <div className="share-preview">
                <h4>{shareTitle}</h4>
                <p className="text-muted">{shareDescription}</p>
                
                <div className="mt-3">
                  <strong>Elements:</strong> 
                  <div className="mt-2 d-flex flex-wrap gap-1">
                    {Array.from(new Set(
                      Object.keys(selectedSkylanders)
                        .filter(id => selectedSkylanders[id])
                        .map(id => {
                          const skylander = skylanders.find(s => s.id === id);
                          return skylander?.element;
                        })
                        .filter(Boolean)
                    )).sort().map(element => (
                      <Badge 
                        key={element}
                        bg={getElementColor(element)}
                        className="me-1 mb-1"
                      >
                        {element}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3">
                  <strong>Selected:</strong> {selectedCount} Skylanders
                </div>
                
                {showValues && (
                  <div className="mt-3">
                    <strong>Total Value:</strong> $
                    {Object.keys(selectedSkylanders)
                      .filter(id => selectedSkylanders[id])
                      .reduce((sum, id) => {
                        const count = userInventory[id]?.count || 0;
                        const value = userInventory[id]?.value || 0;
                        return sum + (count * value);
                      }, 0).toFixed(2)}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ShareView;
