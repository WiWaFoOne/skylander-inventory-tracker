// pages/Dashboard.js - Main inventory view
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Table, Form, 
  Button, Badge, Spinner, InputGroup, 
  Dropdown, DropdownButton 
} from 'react-bootstrap';
import { useSkylanderContext } from '../context/SkylanderContext';

function Dashboard() {
  const { 
    skylanders, 
    userInventory, 
    loading,
    updateInventoryStatus 
  } = useSkylanderContext();
  
  const [filter, setFilter] = useState('all');
  const [elementFilter, setElementFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filteredSkylanders, setFilteredSkylanders] = useState([]);
  
  // Apply filters, search, and sorting
  useEffect(() => {
    if (loading) return;
    
    let result = [...skylanders];
    
    // Apply inventory filter
    if (filter === 'have') {
      result = result.filter(skylander => userInventory[skylander.id]?.have);
    } else if (filter === 'need') {
      result = result.filter(skylander => userInventory[skylander.id]?.need);
    } else if (filter === 'trade') {
      result = result.filter(skylander => userInventory[skylander.id]?.forTrade);
    }
    
    // Apply element filter
    if (elementFilter !== 'all') {
      result = result.filter(skylander => skylander.element === elementFilter);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(skylander => 
        skylander.name.toLowerCase().includes(query) ||
        skylander.element.toLowerCase().includes(query) ||
        skylander.category.toLowerCase().includes(query)
      );
    }
    
    // Apply sort
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'element') {
        comparison = a.element.localeCompare(b.element);
      } else if (sortBy === 'value') {
        const aValue = userInventory[a.id]?.value || 0;
        const bValue = userInventory[b.id]?.value || 0;
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredSkylanders(result);
  }, [skylanders, userInventory, filter, elementFilter, searchQuery, sortBy, sortDirection, loading]);
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Calculate inventory stats
  const inventoryStats = {
    total: skylanders.length,
    have: skylanders.filter(s => userInventory[s.id]?.have).length,
    need: skylanders.filter(s => userInventory[s.id]?.need).length,
    forTrade: skylanders.filter(s => userInventory[s.id]?.forTrade).length,
    totalValue: skylanders.reduce((sum, s) => {
      const itemValue = userInventory[s.id]?.have ? (userInventory[s.id]?.value || 0) * (userInventory[s.id]?.count || 0) : 0;
      return sum + itemValue;
    }, 0)
  };
  
  // Generate unique elements list from data
  const elements = ['all', ...new Set(skylanders.map(s => s.element))].sort();
  
  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading your Skylanders collection...</p>
      </Container>
    );
  }
  
  if (skylanders.length === 0) {
    return (
      <Container className="text-center my-5">
        <h2>Welcome to your Skylander Inventory Tracker!</h2>
        <p>You don't have any Skylanders data yet. Start by importing your collection.</p>
        <Button as={Link} to="/import" variant="primary" size="lg" className="mt-3">
          Import Data
        </Button>
      </Container>
    );
  }
  
  return (
    <Container fluid>
      {/* Inventory Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total</Card.Title>
              <h3>{inventoryStats.have} / {inventoryStats.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Need</Card.Title>
              <h3>{inventoryStats.need}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>For Trade</Card.Title>
              <h3>{inventoryStats.forTrade}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Collection Value</Card.Title>
              <h3>${inventoryStats.totalValue.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Filter Controls */}
      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <Form.Control 
              placeholder="Search Skylanders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button 
                variant="outline-secondary"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Skylanders</option>
            <option value="have">In Collection</option>
            <option value="need">Needed</option>
            <option value="trade">For Trade</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value)}
          >
            {elements.map(element => (
              <option key={element} value={element}>
                {element === 'all' ? 'All Elements' : element}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <DropdownButton 
            title={`Sort: ${sortBy}`} 
            variant="outline-secondary"
          >
            <Dropdown.Item 
              active={sortBy === 'name'} 
              onClick={() => handleSort('name')}
            >
              Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Dropdown.Item>
            <Dropdown.Item 
              active={sortBy === 'element'} 
              onClick={() => handleSort('element')}
            >
              Element {sortBy === 'element' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Dropdown.Item>
            <Dropdown.Item 
              active={sortBy === 'value'} 
              onClick={() => handleSort('value')}
            >
              Value {sortBy === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>
      
      {/* Skylanders Table */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}></th>
                    <th>Name</th>
                    <th>Element</th>
                    <th>Category</th>
                    <th>Have</th>
                    <th>Need</th>
                    <th>Count</th>
                    <th>Value</th>
                    <th>For Trade</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSkylanders.map(skylander => (
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
                      <td>{skylander.category}</td>
                      <td>
                        <Form.Check 
                          type="checkbox"
                          checked={userInventory[skylander.id]?.have || false}
                          onChange={(e) => updateInventoryStatus(skylander.id, 'have', e.target.checked)}
                        />
                      </td>
                      <td>
                        <Form.Check 
                          type="checkbox"
                          checked={userInventory[skylander.id]?.need || false}
                          onChange={(e) => updateInventoryStatus(skylander.id, 'need', e.target.checked)}
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="number" 
                          min="0"
                          value={userInventory[skylander.id]?.count || 0}
                          onChange={(e) => updateInventoryStatus(skylander.id, 'count', parseInt(e.target.value) || 0)}
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
                            onChange={(e) => updateInventoryStatus(skylander.id, 'value', parseFloat(e.target.value) || 0)}
                            style={{ width: '80px' }}
                          />
                        </InputGroup>
                      </td>
                      <td>
                        <Form.Check 
                          type="checkbox"
                          checked={userInventory[skylander.id]?.forTrade || false}
                          onChange={(e) => updateInventoryStatus(skylander.id, 'forTrade', e.target.checked)}
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
              {filteredSkylanders.length === 0 && (
                <div className="text-center my-5">
                  <p>No Skylanders match your current filters. Try adjusting your search criteria.</p>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="text-muted">
              Showing {filteredSkylanders.length} of {skylanders.length} Skylanders
            </Card.Footer>
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

export default Dashboard;
