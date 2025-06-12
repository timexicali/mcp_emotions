# MCP Emotions

A full-stack application for emotion detection and analysis, built with FastAPI and React.

## Project Structure

```
mcp_emotions/
├── mcp_server/          # FastAPI backend
├── frontend/            # React/Vite frontend
├── docker-compose.yml   # Docker configuration
├── .gitignore
└── README.md
```

## Features

- Emotion detection in multiple languages
- Sarcasm detection
- User authentication
- Emotion history tracking
- Real-time analysis
- Beautiful and responsive UI

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- PyTorch
- Transformers
- JWT Authentication

### Frontend
- React
- Vite
- TypeScript
- TailwindCSS
- Axios

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Python 3.11+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcp_emotions.git
cd mcp_emotions
```

2. Set up environment variables:

For the frontend, create a `.env` file in the `frontend` directory:
```bash
cd frontend
cp .env.example .env  # Create .env from example
```

Edit the `.env` file and set:
```
VITE_API_URL=http://localhost:8000
```

3. Start the services:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Development

#### Backend Development
```bash
cd mcp_server
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn mcp_server:app --reload
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

The API documentation is available at http://localhost:8000/docs when the backend is running.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 