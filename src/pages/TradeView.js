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