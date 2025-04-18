// pages/TradeView.js - View for managing tradable Skylanders
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Form, InputGroup, Alert
} from 'react-bootstrap';
import { useSkylanderContext } from '../context/SkylanderContext';

function TradeView() {
  const { skylanders, userInventory, updateInventoryStatus } = useSkylanderContext();
  const [tradeableSkylanders, setTradeableSkylanders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [elementFilter, setElementFilter] = useState('all');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  // Filter skylanders for trade
  useEffect(() => {
    // Find all skylanders marked for trade
    let forTrade = skylanders.filter(skylander => 
      userInventory[skylander.id]?.forTrade && 
      userInventory[skylander.id]?.have
    );
    
    // Apply element filter
    if (elementFilter !== 'all') {
      forTrade = forTrade.filter(skylander => 
        skylander.element === elementFilter
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      forTrade = forTrade.filter(skylander =>
        skylander.name.toLowerCase().includes(query) ||
        skylander.element.toLowerCase().includes(query) ||
        skylander.category.toLowerCase().includes(query)
      );
    }
    
    // Sort by name
    forTrade.sort((a, b) => a.name.localeCompare(b.name));
    
    setTradeableSkylanders(forTrade);
  }, [skylanders, userInventory, searchQuery, elementFilter]);
  
  // Generate unique elements list from data
  const elements = ['all', ...new Set(skylanders.map(s => s.element))].sort();
  
  // Generate trade list text
  const generateTradeListText = () => {
    let text = 'Skylanders Available for Trade:\n\n';
    
    tradeableSkylanders.forEach(skylander => {
      const count = userInventory[skylander.id]?.count || 1;
      const value = userInventory[skylander.id]?.value || 0;
      
      text += `${skylander.name} (${skylander.element}) - ${count} available`;
      if (value > 0) {
        text += ` - Value: ${value.toFixed(2)} each`;
      }
      text += '\n';
    });
    
    if (tradeableSkylanders.length === 0) {
      text += 'No Skylanders currently available for trade.';
    } else {
      text += '\nContact me to discuss trades!';
    }
    
    return text;
  };
  
  // Copy trade list to clipboard
  const copyTradeList = () => {
    const text = generateTradeListText();
    navigator.clipboard.writeText(text)
      .then(() => {
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy trade list: ', err);
      });
  };
  
  return (
    <Container>
      <h2 className="mb-4">Trade Management</h2>
      
      {showCopySuccess && (
        <Alert variant="success" onClose={() => setShowCopySuccess(false)} dismissible>
          Trade list copied to clipboard!
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>Trade Summary</Card.Header>
            <Card.Body>
              <p><strong>Total For Trade:</strong> {tradeableSkylanders.length}</p>
              <p>
                <strong>Total Value:</strong> $
                {tradeableSkylanders.reduce((sum, skylander) => {
                  const count = userInventory[skylander.id]?.count || 0;
                  const value = userInventory[skylander.id]?.value || 0;
                  return sum + (count * value);
                }, 0).toFixed(2)}
              </p>
              
              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  onClick={copyTradeList}
                >
                  Copy Trade List
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="h-100">
            <Card.Header>Quick Tips</Card.Header>
            <Card.Body>
              <h5>Managing Your Trade List</h5>
              <ul>
                <li>Mark Skylanders as "For Trade" from the Dashboard or Details page</li>
                <li>Set accurate values to help with fair trades</li>
                <li>Use the copy feature to share your list on forums or social media</li>
                <li>Consider trade value vs. collection value when deciding what to trade</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Skylanders Available for Trade</span>
          <div className="d-flex">
            <Form.Control 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="me-2"
              style={{ width: '200px' }}
            />
            <Form.Select
              value={elementFilter}
              onChange={(e) => setElementFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              {elements.map(element => (
                <option key={element} value={element}>
                  {element === 'all' ? 'All Elements' : element}
                </option>
              ))}
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          {tradeableSkylanders.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}></th>
                  <th>Name</th>
                  <th>Element</th>
                  <th>Quantity</th>
                  <th>Value</th>
                  <th>For Trade</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tradeableSkylanders.map(skylander => (
                  <tr key={skylander.id}>
                    <td>
                      {skylander.imageUrl && (
                        <img 
                          src={skylander.imageUrl} 
                          alt={skylander.name}
                          style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                        />
                      )}
                    </td>
                    <td>
                      <Link to={`/skylander/${skylander.id}`}>
                        {skylander.name}
                      </Link>
                    </td>
                    <td>
                      <Badge 
                        bg={getElementColor(skylander.element)}
                        className="text-white"
                      >
                        {skylander.element}
                      </Badge>
                    </td>
                    <td>
                      <Form.Control 
                        type="number"
                        min="0"
                        value={userInventory[skylander.id]?.count || 0}
                        onChange={(e) => updateInventoryStatus(
                          skylander.id, 
                          'count', 
                          parseInt(e.target.value) || 0
                        )}
                        style={{ width: '70px' }}
                      />
                    </td>
                    <td>
                      <InputGroup size="sm">
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control 
                          type="number"
                          min="0"
                          step="0.01"
                          value={userInventory[skylander.id]?.value || 0}
                          onChange={(e) => updateInventoryStatus(
                            skylander.id, 
                            'value', 
                            parseFloat(e.target.value) || 0
                          )}
                          style={{ width: '80px' }}
                        />
                      </InputGroup>
                    </td>
                    <td>
                      <Form.Check 
                        type="checkbox"
                        checked={userInventory[skylander.id]?.forTrade || false}
                        onChange={(e) => updateInventoryStatus(
                          skylander.id, 
                          'forTrade', 
                          e.target.checked
                        )}
                      />
                    </td>
                    <td>
                      <Button 
                        as={Link}
                        to={`/skylander/${skylander.id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <p>No Skylanders marked for trade matching your filters.</p>
              <Button 
                as={Link} 
                to="/" 
                variant="primary"
              >
                Go to Dashboard to Mark Skylanders for Trade
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

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

export default TradeView;

// pages/ShareView.js - Component for creating and sharing collection views
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, 
  Table, Badge, Alert, Tab, Tabs,
  ListGroup, InputGroup
} from 'react-bootstrap';
import { useSkylanderContext } from '../context/SkylanderContext';

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
    // In a real app, this would generate a unique link or ID
    // For this demo, we'll just simulate it
    
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

// Helper function to get color for element badges (reused)
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

export default ShareView;
