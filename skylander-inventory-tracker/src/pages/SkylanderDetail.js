// pages/SkylanderDetail.js - Detail view for a specific Skylander
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button,
  Alert, Spinner, Badge, InputGroup, Tabs, Tab 
} from 'react-bootstrap';
import { useSkylanderContext } from '../context/SkylanderContext';

function SkylanderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    skylanders, 
    userInventory, 
    updateInventoryStatus, 
    loading 
  } = useSkylanderContext();
  
  const [skylander, setSkylander] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [notes, setNotes] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);
  const [priceError, setPriceError] = useState('');
  
  // Find the skylander and inventory data
  useEffect(() => {
    if (!loading) {
      const skylanderData = skylanders.find(s => s.id === id);
      
      if (skylanderData) {
        setSkylander(skylanderData);
        
        const inventoryData = userInventory[id] || {
          have: false,
          need: false,
          count: 0,
          value: 0,
          currency: 'USD',
          forTrade: false,
          notes: ''
        };
        
        setInventory(inventoryData);
        setNotes(inventoryData.notes || '');
      }
    }
  }, [id, skylanders, userInventory, loading]);
  
  // Handle updating notes
  const handleNotesUpdate = () => {
    updateInventoryStatus(id, 'notes', notes);
  };
  
  // Check current price from SCL Collectibles
  const checkCurrentPrice = async () => {
    setIsCheckingPrice(true);
    setPriceError('');
    
    try {
      // In a real app, this would call an API or web scraper
      // For this demo, we'll simulate a price check with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate a price
      const mockPrice = (Math.random() * 20 + 2).toFixed(2);
      setCurrentPrice(mockPrice);
      
    } catch (error) {
      setPriceError('Error fetching current price: ' + error.message);
    } finally {
      setIsCheckingPrice(false);
    }
  };
  
  // Update inventory value with current price
  const updateWithCurrentPrice = () => {
    if (currentPrice) {
      updateInventoryStatus(id, 'value', parseFloat(currentPrice));
    }
  };
  
  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading Skylander details...</p>
      </Container>
    );
  }
  
  if (!skylander) {
    return (
      <Container className="text-center my-5">
        <Alert variant="warning">
          <h4>Skylander Not Found</h4>
          <p>The Skylander you're looking for doesn't exist in your collection.</p>
          <Button as={Link} to="/" variant="primary" className="mt-3">
            Return to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }
  
  const totalValue = (inventory.value || 0) * (inventory.count || 0);
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{skylander.name}</h2>
        <Button 
          as={Link} 
          to="/" 
          variant="outline-secondary"
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              {skylander.imageUrl ? (
                <img 
                  src={skylander.imageUrl} 
                  alt={skylander.name}
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  className="mb-3"
                />
              ) : (
                <div 
                  className="bg-light d-flex justify-content-center align-items-center mb-3"
                  style={{ height: '300px' }}
                >
                  <p className="text-muted">No image available</p>
                </div>
              )}
              
              <div className="d-flex justify-content-center mb-3">
                <Badge 
                  bg={getElementColor(skylander.element)}
                  className="me-2 px-3 py-2"
                >
                  {skylander.element}
                </Badge>
                <Badge 
                  bg="secondary"
                  className="px-3 py-2"
                >
                  {skylander.category}
                </Badge>
              </div>
              
              {skylander.game && (
                <p className="mb-2">
                  <strong>Game:</strong> {skylander.game}
                </p>
              )}
              
              {skylander.link && (
                <Button 
                  href={skylander.link} 
                  target="_blank"
                  variant="outline-primary"
                  className="w-100"
                >
                  View on SCL Collectibles
                </Button>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>Price Information</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <p className="mb-1"><strong>Your Value:</strong> ${inventory.value || 0}</p>
                <p className="mb-1"><strong>Quantity:</strong> {inventory.count || 0}</p>
                <p className="mb-0"><strong>Total Value:</strong> ${totalValue.toFixed(2)}</p>
              </div>
              
              {priceError && (
                <Alert variant="danger" className="mb-3">
                  {priceError}
                </Alert>
              )}
              
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary"
                  onClick={checkCurrentPrice}
                  disabled={isCheckingPrice}
                >
                  {isCheckingPrice ? (
                    <>
                      <Spinner 
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Checking...
                    </>
                  ) : 'Check Current Price'}
                </Button>
                
                {currentPrice && (
                  <div className="mt-3">
                    <Alert variant="info" className="mb-3">
                      <p className="mb-0">
                        <strong>Current Price:</strong> ${currentPrice}
                      </p>
                    </Alert>
                    <Button 
                      variant="success"
                      onClick={updateWithCurrentPrice}
                      className="w-100"
                    >
                      Update to Current Price
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>Inventory Management</Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <div className="d-flex">
                      <Form.Check 
                        type="checkbox"
                        id={`have-${id}`}
                        label="In Collection"
                        checked={inventory.have || false}
                        onChange={(e) => updateInventoryStatus(id, 'have', e.target.checked)}
                        className="me-4"
                      />
                      <Form.Check 
                        type="checkbox"
                        id={`need-${id}`}
                        label="Need"
                        checked={inventory.need || false}
                        onChange={(e) => updateInventoryStatus(id, 'need', e.target.checked)}
                        className="me-4"
                      />
                      <Form.Check 
                        type="checkbox"
                        id={`trade-${id}`}
                        label="For Trade"
                        checked={inventory.forTrade || false}
                        onChange={(e) => updateInventoryStatus(id, 'forTrade', e.target.checked)}
                      />
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control 
                      type="number"
                      min="0"
                      value={inventory.count || 0}
                      onChange={(e) => updateInventoryStatus(id, 'count', parseInt(e.target.value) || 0)}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Value</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control 
                        type="number"
                        min="0"
                        step="0.01"
                        value={inventory.value || 0}
                        onChange={(e) => updateInventoryStatus(id, 'value', parseFloat(e.target.value) || 0)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group>
                <Form.Label>Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={5} 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about condition, variants, etc."
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end mt-3">
                <Button 
                  variant="primary" 
                  onClick={handleNotesUpdate}
                >
                  Save Notes
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>Additional Information</Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="history" id="skylander-info-tabs">
                <Tab eventKey="history" title="Price History">
                  <div className="p-3">
                    <div className="text-center my-4">
                      <p className="text-muted">
                        Price history tracking will be available in a future update.
                      </p>
                    </div>
                  </div>
                </Tab>
                
                <Tab eventKey="trades" title="Trade Offers">
                  <div className="p-3">
                    <div className="text-center my-4">
                      <p className="text-muted">
                        Trade offers will be available in a future update.
                      </p>
                    </div>
                  </div>
                </Tab>
                
                <Tab eventKey="similar" title="Similar Skylanders">
                  <div className="p-3">
                    <div className="text-center my-4">
                      <p className="text-muted">
                        Similar Skylanders recommendations will be available in a future update.
                      </p>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
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

export default SkylanderDetail;
