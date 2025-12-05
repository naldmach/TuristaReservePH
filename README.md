# TuristaReserve PH

A QR-based reservation system for tourist spots with capacity management and parking slot allocation.

## Features

- **QR-first design**: Landing page displays a QR code for easy access
- **Daily capacity limits**: Automatically manages visitor capacity per day
- **Auto-rebooking**: Moves reservations to the next available day when capacity is reached
- **Parking management**: Free parking slots reserved for visitors with vehicles
- **QR code generation**: Each reservation gets a unique QR code for entry
- **Admin dashboard**: View daily summaries and all reservations

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **QRCode.js** - QR code generation

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Configuration

Edit `src/utils/reservationLogic.js` to adjust:

- `CAPACITY_PER_DAY` - Maximum visitors per day (default: 80)
- `PARKING_SLOTS_PER_DAY` - Maximum parking slots per day (default: 30)

## Project Structure

```
src/
  components/
    Hero.jsx           # Landing page with QR code
    ReservationForm.jsx # Reservation form and confirmation
    AdminPanel.jsx     # Admin dashboard
    QRCode.jsx         # Reusable QR code component
  hooks/
    useReservations.js # Custom hook for reservation state management
  utils/
    reservationLogic.js # Business logic for capacity and date calculations
  App.jsx              # Main app component
  main.jsx             # React entry point
  styles.css           # Global styles
```

## Data Storage

Reservations are stored in browser localStorage under the key `turista-reservations`. Data persists across browser sessions but is specific to each browser/device.
