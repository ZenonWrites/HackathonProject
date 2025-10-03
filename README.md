# CyRA: Conversational SIEM Assistant for ISRO

## 🚀 Project Overview

**CyRA** (Cybersecurity Response Assistant) is a conversational SIEM (Security Incident and Event Management) Assistant specifically designed for the Indian Space Research Organisation (ISRO). This hackathon project combines **Blockchain** and **Cybersecurity** technologies to provide real-time threat analysis, incident response, and immutable security reporting for space operations.

### Key Features
- 🤖 **Conversational AI**: Natural language security queries powered by OpenRouter API
- 📊 **Data Visualization**: Interactive charts and tables for security analytics
- 🔗 **Blockchain Integration**: Immutable security report logging with hash verification
- 🛡️ **Mock SIEM Data**: Realistic security event simulation for demonstration
- 🎨 **Professional UI**: Enterprise-grade cybersecurity dashboard design
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **OpenRouter API**: AI-powered natural language processing
- **Python**: Core backend logic and blockchain implementation
- **Pydantic**: Data validation and serialization

### Frontend
- **React 19**: Modern frontend framework
- **TailwindCSS**: Utility-first CSS framework
- **Recharts**: Data visualization library
- **Axios**: HTTP client for API communication
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

### Database
- **Simple Blockchain**: Custom blockchain implementation for report integrity
- **In-Memory Storage**: Mock SIEM data simulation

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Yarn package manager**

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cyra-siem-assistant
```

### 2. Backend Setup

#### Create Python Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Setup Environment Variables
Create a `.env` file in the `backend` directory:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
OPENROUTER_API_KEY="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"
```

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd ../frontend
```

#### Install Node.js Dependencies
```bash
yarn install
```

#### Setup Environment Variables
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=3000
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend Development Server
```bash
cd frontend
yarn start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
HackathonProject/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Styling and animations
│   │   └── components/ui/    # Shadcn UI components
│   ├── package.json          # Node.js dependencies
│   └── .env                  # Environment variables
└── README.md                 # This file
```

## 🔌 API Endpoints

### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user", 
      "content": "Show me recent malware detections"
    }
  ]
}
```

### Report Logging Endpoint
```http
POST /api/log_report
Content-Type: application/json

{
  "report_summary": "Critical security incident detected..."
}
```

### System Status
```http
GET /api/
```

### Blockchain Status
```http
GET /api/blockchain
```

## 🧪 Testing the Application

### 1. Chat Interface Tests

#### Malware Detection Queries (Returns Tables)
```
• "Show me recent malware detections on ISRO systems"
• "What virus infections have been detected this week?"
• "Display all Trojan detections in satellite communication systems"
• "List recent malware threats targeting mission control"
```

#### Authentication Analysis (Returns Bar Charts)
```
• "Show me failed login attempts for ISRO systems"
• "Display authentication failures by system"
• "What are the login failure trends across ground stations?"
• "Show failed authentication attempts on satellite control systems"
```

#### Network Analysis (Returns Line Charts)
```
• "Show me network anomaly trends"
• "Display network traffic patterns over the last 24 hours"
• "What are the bandwidth anomalies in satellite communications?"
• "Show me network intrusion detection alerts timeline"
```

#### General Security Queries (Returns Text Analysis)
```
• "What's the current security status of ISRO systems?"
• "Provide a security assessment of our satellite infrastructure"
• "How secure are our mission control systems?"
• "Give me an overview of cybersecurity posture"
```

### 2. Blockchain Report Generator Tests

After receiving analysis results, test the report generator with:
```
• "Critical APT detected targeting ISRO satellite systems"
• "Weekly security assessment: 23 malware incidents, 45 failed logins"
• "Incident Response: DDoS attack on Mission Control mitigated"
• "Security audit findings: Multiple vulnerabilities patched"
```

### 3. ISRO-Specific Test Scenarios
```
• "Check security of Chandrayaan mission control systems"
• "Analyze cybersecurity threats to PSLV launch operations"
• "What security incidents affected our satellite constellation?"
• "Display security alerts from Vikram lander communication systems"
```

## 🎯 Key Components Explained

### 1. OpenRouter Integration
- **Model**: `mistralai/mistral-7b-instruct`
- **Purpose**: Converts natural language to Elasticsearch DSL queries
- **System Prompt**: Specialized for ISRO cybersecurity operations
- **Response Types**: Text analysis, structured data for tables/charts

### 2. Mock SIEM Service
- **Malware Detection**: Simulates threats like "Trojan.SpaceHack", "Worm.OrbitKill"
- **Authentication Logs**: Failed login attempts across ISRO systems
- **Network Analysis**: Traffic anomalies and intrusion detection
- **Threat Intelligence**: APT activities and attack patterns

### 3. Simple Blockchain Implementation
- **Block Structure**: Index, timestamp, data, previous hash, current hash
- **Hash Algorithm**: SHA-256
- **Purpose**: Immutable audit trail for security reports
- **Genesis Block**: "Genesis Block - ISRO CyRA Report Chain"

### 4. Smart Content Rendering
- **Text Responses**: AI analysis and recommendations
- **Tables**: Structured incident data with severity badges
- **Charts**: Interactive visualizations using Recharts
- **Context-Aware**: Determines response type based on query content

## 🎨 UI/UX Features

### Professional Cybersecurity Theme
- **Font**: Space Grotesk (tech startup aesthetic)
- **Colors**: Professional dark blues, grays, and cyan accents
- **Layout**: Enterprise-grade dashboard with proper spacing
- **Animations**: Micro-interactions and loading states

### Component Library
- **Shadcn UI**: Modern, accessible components
- **Recharts**: Interactive data visualizations
- **Lucide Icons**: Professional iconography
- **Toast Notifications**: User feedback system

## 🔧 Troubleshooting

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:8000/api/

# Check backend logs
tail -f backend.log

# Restart backend with debug
uvicorn server:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

### Frontend Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
yarn install

# Check for compilation errors
yarn start

# Build for production
yarn build
```

### Common Issues
1. **Port Conflicts**: Change ports in .env files if 3000/8000 are occupied
2. **API Key Issues**: Verify OpenRouter API key is correctly set
3. **CORS Errors**: Ensure backend CORS_ORIGINS includes frontend URL
4. **Dependencies**: Run `pip install -r requirements.txt` and `yarn install`

## 🚀 Production Deployment

### Backend Deployment
```bash
# Using gunicorn
pip install gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Using Docker
# Create Dockerfile and build image
docker build -t cyra-backend .
docker run -p 8000:8000 cyra-backend
```

### Frontend Deployment
```bash
# Build for production
yarn build

# Serve static files
# Deploy 'build' folder to your preferred hosting service
```

## 📝 Environment Variables Reference

### Backend `.env`
```env
MONGO_URL="mongodb://localhost:27017"          # MongoDB connection (not used but required)
DB_NAME="test_database"                        # Database name
CORS_ORIGINS="*"                               # Allowed CORS origins
OPENROUTER_API_KEY="your-api-key-here"         # OpenRouter API key
```

### Frontend `.env`
```env
REACT_APP_BACKEND_URL=http://localhost:8000    # Backend API URL
WDS_SOCKET_PORT=3000                            # WebSocket port for hot reload
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Hackathon Project Goals

This project demonstrates:
- ✅ **Blockchain Integration**: Immutable security report logging
- ✅ **Cybersecurity Focus**: SIEM operations and threat analysis  
- ✅ **AI/ML Integration**: Conversational interface for security operations
- ✅ **Real-world Application**: ISRO space infrastructure security
- ✅ **Modern Tech Stack**: FastAPI, React 19, and cutting-edge tools
- ✅ **Professional UI/UX**: Enterprise-grade security dashboard

