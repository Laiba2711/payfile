# PayFile

PayFile is a high-fidelity full-stack MERN application for uploading, sharing, and selling files via Bitcoin on the Internet Computer blockchain.

## Features

- **Modern UI**: Dark-themed landing page with neon green accents and glassmorphism.
- **Authentication**: Secure JWT-based login, registration, and password recovery.
- **User Dashboard**: Manage uploads, sale listings, and purchase tokens.
- **Bitcart Integration**: Seamless Bitcoin payment processing with automated payouts.
- **Full Stack**: Powered by MongoDB, Express, React (Vite), and Node.js.
- **Vercel Ready**: Pre-configured for seamless cloud deployment.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Lucide Icons, React Router.
- **Backend**: Node.js, Express, Mongoose, JWT, Bcryptjs.
- **Payments**: Bitcart (Self-hosted via Docker).
- **Database**: MongoDB.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Laiba2711/payfile.git
   cd payfile
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend/` directory using `.env.example` as a template.
   - Configure your Bitcart credentials in the `.env` file.

### Bitcart Setup (Optional for Local Payments)

1. Navigate to the `bitcart/` directory:
   ```bash
   cd bitcart
   ```

2. Start Bitcart using Docker:
   ```bash
   docker-compose up -d
   ```

3. Access the Bitcart Admin Dashboard at `http://localhost:8000` to create your store and obtain API keys.

### Development

Start both the backend and frontend servers simultaneously:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Deployment

This project is configured for Vercel. Refer to the `walkthrough.md` in the `.gemini/antigravity/brain/` directory for detailed deployment instructions.

## License

All rights reserved. © 2026 PayFile.
