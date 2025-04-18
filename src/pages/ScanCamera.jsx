// pages/ScanCamera.js - Camera scanning for Skylanders identification
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Card, Button, Alert, 
  Spinner, Modal, Row, Col, Form
} from 'react-bootstrap';
import Webcam from 'react-webcam';
import { useSkylanderContext } from '../context/SkylanderContext';

function ScanCamera() {
  const navigate = useNavigate();
  const { skylanders, addToInventory } = useSkylanderContext();
  const webcamRef = useRef(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [matchedSkylander, setMatchedSkylander] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cameraLoaded, setCameraLoaded] = useState(false);
  const [cameraList, setCameraList] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  
  // Get list of available cameras
  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraList(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        setError('Error accessing camera: ' + error.message);
      }
    };
    
    getAvailableCameras();
  }, []);
  
  // Handle camera load success
  const handleCameraLoad = () => {
    setCameraLoaded(true);
  };
  
  // Handle camera load error
  const handleCameraError = (error) => {
    setError('Error accessing camera: ' + error.message);
    setCameraLoaded(false);
  };
  
  // Capture image from webcam
  const captureImage = useCallback(() => {
    setIsCapturing(true);
    setError('');
    
    if (webcamRef.current) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        
        if (imageSrc) {
          setCapturedImage(imageSrc);
          analyzeImage(imageSrc);
        } else {
          setError('Failed to capture image. Please try again.');
        }
      } catch (err) {
        setError('Error capturing image: ' + err.message);
      }
    } else {
      setError('Camera not ready. Please wait and try again.');
    }
    
    setIsCapturing(false);
  }, [webcamRef]);
  
  // Analyze the captured image
  const analyzeImage = async (imageSrc) => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      // In a real app, you would call an image recognition API here
      // For this demo, we'll simulate analyzing with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate finding a random match from the skylanders list
      if (skylanders.length > 0) {
        const randomIndex = Math.floor(Math.random() * skylanders.length);
        const randomSkylander = skylanders[randomIndex];
        setMatchedSkylander(randomSkylander);
        setShowConfirmModal(true);
      } else {
        setError('No Skylanders in your collection to match against. Please import Skylanders data first.');
      }
      
    } catch (error) {
      setError('Error analyzing image: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Confirm matched Skylander
  const confirmMatch = () => {
    if (matchedSkylander) {
      addToInventory(matchedSkylander.id);
      navigate(`/skylander/${matchedSkylander.id}`);
    }
  };
  
  // Reset scan process
  const resetScan = () => {
    setCapturedImage(null);
    setMatchedSkylander(null);
    setShowConfirmModal(false);
    setError('');
  };
  
  // Switch camera
  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
    resetScan();
  };
  
  const videoConstraints = {
    width: 1280,
    height: 720,
    deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
    facingMode: "environment" // Prefer back camera if available
  };
  
  return (
    <Container>
      <h2 className="mb-4">Scan a Skylander</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <p className="mb-4">
            Position your Skylander figure in front of the camera and tap "Capture" to identify it.
          </p>
          
          {cameraList.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Select Camera</Form.Label>
              <Form.Select
                value={selectedCamera}
                onChange={handleCameraChange}
              >
                {cameraList.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${cameraList.indexOf(camera) + 1}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
          
          <div className="webcam-container">
            {!capturedImage ? (
              <div 
                className="webcam-wrapper"
                style={{ 
                  maxWidth: '100%', 
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '8px'
                }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMedia={handleCameraLoad}
                  onUserMediaError={handleCameraError}
                  style={{ 
                    width: '100%', 
                    borderRadius: '8px'
                  }}
                />
                
                {!cameraLoaded && (
                  <div className="webcam-loading">
                    <Spinner animation="border" />
                    <p>Loading camera...</p>
                  </div>
                )}
                
                {cameraLoaded && (
                  <div className="targeting-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div style={{
                      border: '2px dashed white',
                      width: '60%',
                      height: '60%',
                      borderRadius: '8px',
                      boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.3)'
                    }}></div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="captured-image"
                style={{ 
                  maxWidth: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>
          
          <div className="d-flex justify-content-center mt-4">
            {!capturedImage ? (
              <Button 
                variant="primary" 
                size="lg"
                onClick={captureImage}
                disabled={isCapturing || !cameraLoaded}
              >
                {isCapturing ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Capturing...
                  </>
                ) : 'Capture'}
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="lg"
                onClick={resetScan}
                disabled={isAnalyzing}
              >
                Try Again
              </Button>
            )}
          </div>
          
          {isAnalyzing && (
            <div className="text-center mt-4">
              <Spinner animation="border" />
              <p>Analyzing image... Please wait.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Instructions Card */}
      <Card>
        <Card.Header>Tips for Best Results</Card.Header>
        <Card.Body>
          <ul>
            <li>Position the Skylander in good lighting.</li>
            <li>Make sure the figure is centered in the frame.</li>
            <li>Keep the camera steady while capturing.</li>
            <li>Remove any obstructions from the background.</li>
            <li>If the scan fails, try positioning the Skylander at a different angle.</li>
          </ul>
        </Card.Body>
      </Card>
      
      {/* Confirmation Modal */}
      <Modal 
        show={showConfirmModal} 
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Skylander Identified</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {matchedSkylander && (
            <Row>
              <Col xs={4} className="text-center">
                {matchedSkylander.imageUrl && (
                  <img 
                    src={matchedSkylander.imageUrl} 
                    alt={matchedSkylander.name}
                    style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                  />
                )}
              </Col>
              <Col xs={8}>
                <h4>{matchedSkylander.name}</h4>
                <p><strong>Element:</strong> {matchedSkylander.element}</p>
                <p><strong>Category:</strong> {matchedSkylander.category}</p>
                
                <p className="mt-3">Is this the correct Skylander?</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            No, Try Again
          </Button>
          <Button variant="primary" onClick={confirmMatch}>
            Yes, Add to Collection
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ScanCamera;
