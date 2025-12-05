import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRCodeComponent({ data, width = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, { width });
    }
  }, [data, width]);

  return (
    <div className="qr-box">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
