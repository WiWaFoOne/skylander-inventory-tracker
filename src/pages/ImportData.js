// pages/ImportData.js - Component for importing Skylander data
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, 
  Alert, Tabs, Tab, Spinner, Table
} from 'react-bootstrap';
import Papa from 'papaparse';
import { useSkylanderContext } from '../context/SkylanderContext';

function ImportData() {
  const navigate = useNavigate();
  const { importSkylanders } = useSkylanderContext();
  
  const [activeTab, setActiveTab] = useState('sheet');
  const [sheetUrl, setSheetUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [importStatus, setImportStatus] = useState('idle');
  const [valueFetchingStatus, setValueFetchingStatus] = useState('idle');
  const [scrapingProgress, setScrapingProgress] = useState(0);
  
  // For populating pricing data
  const [populatePrices, setPopulatePrices] = useState(true);

  // Handle import from Google Sheet URL
  const handleSheetImport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Extract sheet ID from Google Sheets URL
      const sheetIdMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      
      if (!sheetIdMatch) {
        throw new Error('Invalid Google Sheets URL. Please provide a valid sharing link.');
      }
      
      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Google Sheet. Make sure it is publicly accessible.');
      }
      
      const csvData = await response.text();
      
      // Parse CSV data
      parseCSVData(csvData);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Handle import from local CSV file
  const handleFileImport = () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!file) {
      setError('Please select a CSV file to import.');
      setLoading(false);
      return;
    }
    
    // Use PapaParse to read the file
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          setLoading(false);
          return;
        }
        
        processImportData(results.data);
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
        setLoading(false);
      }
    });
  };
  
  // Parse CSV data from Google Sheets
  const parseCSVData = (csvData) => {
    Papa.parse(csvData, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0 && !results.data.length) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          setLoading(false);
          return;
        }
        
        processImportData(results.data);
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
        setLoading(false);
      }
    });
  };
  
  // Process the parsed data
  const processImportData = async (data) => {
    try {
      // Filter out empty rows
      const filteredData = data.filter(row => 
        row.name && row.name.trim() !== ''
      );
      
      if (filteredData.length === 0) {
        throw new Error('No valid Skylander data found in the imported file.');
      }
      
      // Map data to our expected format
      const formattedData = filteredData.map((row, index) => ({
        id: row.id || `skylander-${index}`,
        name: row.name || 'Unknown Skylander',
        element: row.element || 'Unknown',
        category: row.category || 'Figure',
        game: row.game || 'Unknown Game',
        imageUrl: row.imageUrl || row.image || '',
        link: row.link || ''
      }));
      
      // Set preview data
      setPreviewData(formattedData);
      setImportStatus('preview');
      
      // If auto-populate prices is enabled, fetch them
      if (populatePrices) {
        setValueFetchingStatus('processing');
        await fetchSkylanderPrices(formattedData);
      }
      
      setLoading(false);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Fetch Skylander prices
  const fetchSkylanderPrices = async (skylanders) => {
    try {
      // This would typically call an API or web scraper
      // For this demo, we'll simulate fetching prices with a delay
      const totalSkylanders = skylanders.length;
      
      for (let i = 0; i < totalSkylanders; i++) {
        // Update progress
        setScrapingProgress(Math.round((i / totalSkylanders) * 100));
        
        // In a real implementation, you would make API calls to fetch prices
        // For this demo, we'll set random prices
        skylanders[i].price = (Math.random() * 20 + 2).toFixed(2);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setScrapingProgress(100);
      setValueFetchingStatus('complete');
      setPreviewData([...skylanders]);
      
    } catch (error) {
      setError('Error fetching prices: ' + error.message);
      setValueFetchingStatus('error');
    }
  };
  
  // Confirm import after preview
  const confirmImport = () => {
    try {
      // Add pricing data to the skylanders if available
      const dataToImport = previewData.map(skylander => ({
        ...skylander,
        value: skylander.price || 0
      }));
      
      importSkylanders(dataToImport);
      setSuccess('Skylanders data imported successfully!');
      setImportStatus('success');
      
      // Redirect to dashboard after successful import
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      setError('Error importing data: ' + error.message);
    }
  };
  
  // Reset the import process
  const resetImport = () => {
    setSheetUrl('');
    setFile(null);
    setPreviewData([]);
    setImportStatus('idle');
    setValueFetchingStatus('idle');
    setScrapingProgress(0);
    setError('');
    setSuccess('');
  };
  
  return (
    <Container>
      <h2 className="mb-4">Import Skylander Data</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {importStatus === 'idle' && (
        <Card>
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="sheet" title="Google Sheet">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Google Sheet URL</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Make sure your Google Sheet is publicly accessible (or shared with anyone with the link).
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-flex">
                    <Form.Check 
                      type="checkbox"
                      id="auto-populate-prices"
                      label="Auto-populate Skylander prices from SCL Collectibles"
                      checked={populatePrices}
                      onChange={(e) => setPopulatePrices(e.target.checked)}
                      className="mb-3 me-4"
                    />
                  </div>
                  
                  <Button 
                    variant="primary" 
                    onClick={handleSheetImport}
                    disabled={loading || !sheetUrl}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Importing...
                      </>
                    ) : 'Import from Google Sheet'}
                  </Button>
                </Form>
              </Tab>
              
              <Tab eventKey="file" title="CSV File">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload CSV File</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <Form.Text className="text-muted">
                      Your CSV should include columns for name, element, category, and imageUrl.
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-flex">
                    <Form.Check 
                      type="checkbox"
                      id="auto-populate-prices-file"
                      label="Auto-populate Skylander prices from SCL Collectibles"
                      checked={populatePrices}
                      onChange={(e) => setPopulatePrices(e.target.checked)}
                      className="mb-3 me-4"
                    />
                  </div>
                  
                  <Button 
                    variant="primary" 
                    onClick={handleFileImport}
                    disabled={loading || !file}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Importing...
                      </>
                    ) : 'Import CSV File'}
                  </Button>
                </Form>
              </Tab>
              
              <Tab eventKey="manual" title="Manual Entry">
                <p>For manual entry, please use the Dashboard to add Skylanders one by one.</p>
                <Button variant="primary" onClick={() => navigate('/')}>
                  Go to Dashboard
                </Button>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      )}
      
      {importStatus === 'preview' && (
        <Card>
          <Card.Body>
            <h4>Data Preview</h4>
            <p>Please review the imported data before confirming:</p>
            
            {valueFetchingStatus === 'processing' && (
              <Alert variant="info">
                <Spinner animation="border" size="sm" className="me-2" />
                Fetching Skylander prices... {scrapingProgress}% complete
              </Alert>
            )}
            
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Element</th>
                  <th>Category</th>
                  <th>Image</th>
                  {valueFetchingStatus === 'complete' && <th>Estimated Value</th>}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((skylander, index) => (
                  <tr key={index}>
                    <td>{skylander.name}</td>
                    <td>{skylander.element}</td>
                    <td>{skylander.category}</td>
                    <td>
                      {skylander.imageUrl && (
                        <img 
                          src={skylander.imageUrl} 
                          alt={skylander.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                        />
                      )}
                    </td>
                    {valueFetchingStatus === 'complete' && (
                      <td>${skylander.price}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {previewData.length > 10 && (
              <p className="text-muted">
                Showing 10 of {previewData.length} Skylanders. All data will be imported.
              </p>
            )}
            
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="secondary" 
                onClick={resetImport} 
                className="me-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmImport}
                disabled={valueFetchingStatus === 'processing'}
              >
                Confirm Import
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default ImportData;
