import QRCodeComponent from "./QRCode";

export default function Hero({ onViewAdmin }) {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <header className="hero">
      <div className="hero-text">
        <p className="badge">QR-first reservation</p>
        <h1>Reserve your visit before you arrive.</h1>
        <p className="subhead">
          Daily capacity is limited. Book ahead, secure a free parking slot, and
          enter quickly with your QR.
        </p>
        <div className="cta-row">
          <a href="#reserve" className="primary-btn">
            Make a reservation
          </a>
          <button onClick={onViewAdmin} className="ghost-btn" type="button">
            View admin
          </button>
        </div>
      </div>
      <div className="hero-qr">
        <div className="card">
          <p className="card-title">Scan to start</p>
          <QRCodeComponent data={currentUrl} width={170} />
          <p className="card-foot">
            The site always opens with a QR to keep scanning frictionless.
          </p>
        </div>
      </div>
    </header>
  );
}
