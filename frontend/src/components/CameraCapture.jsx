import { useRef, useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";

function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setLoading(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setHasCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : "Could not access camera. Please check permissions."
      );
      setHasCamera(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    const video = videoRef.current;

    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.95);
    setCapturedImage(imageDataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirmCapture = () => {
    if (!capturedImage) return;

    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], "camera_capture.jpg", {
        type: "image/jpeg",
      });

      onCapture(file, capturedImage);
      stopCamera();
    }, "image/jpeg");
  };

  if (error) {
    return (
      <div className="rounded-4 border border-danger bg-danger bg-opacity-10 p-4 text-center">
        <p className="text-danger mb-3">
          <strong>Camera Error:</strong> {error}
        </p>
        <Button variant="outline-danger" onClick={onCancel}>
          Back to Upload
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="success" className="mb-3" />
        <p className="text-muted">Accessing your camera...</p>
      </div>
    );
  }

  if (!hasCamera) {
    return (
      <div className="rounded-4 border border-warning bg-warning bg-opacity-10 p-4 text-center">
        <p className="text-warning mb-3">
          <strong>Camera not available</strong>
        </p>
        <Button variant="outline-warning" onClick={onCancel}>
          Use File Upload Instead
        </Button>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className="text-center">
        <div className="mb-4 rounded-4 overflow-hidden shadow-sm border">
          <img
            src={capturedImage}
            alt="Captured food"
            className="w-100 d-block"
            style={{ maxHeight: "500px", objectFit: "cover" }}
          />
        </div>

        <div className="d-flex gap-3 justify-content-center">
          <Button variant="outline-success" onClick={handleRetake} size="lg">
            Retake
          </Button>
          <Button variant="success" onClick={handleConfirmCapture} size="lg">
            Confirm & Analyze
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="position-relative rounded-4 overflow-hidden shadow-sm border border-success border-2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-100 d-block"
        style={{
          maxHeight: "500px",
          backgroundColor: "#000",
          objectFit: "cover",
        }}
      />

      <canvas ref={canvasRef} className="d-none" />

      <div className="position-absolute bottom-0 start-0 end-0 p-4 d-flex gap-3 justify-content-center bg-gradient">
        <Button
          variant="outline-light"
          onClick={onCancel}
          size="lg"
          className="border-2"
        >
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={capturePhoto}
          size="lg"
          className="px-5"
        >
          📸 Capture
        </Button>
      </div>

      <style>{`
        .bg-gradient {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        }
      `}</style>
    </div>
  );
}

export default CameraCapture;
