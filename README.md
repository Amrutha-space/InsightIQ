# InsightIQ - AI-Powered Business Analytics Platform

🧠 **Transform your business data into actionable insights with AI-powered analytics**

InsightIQ is a production-ready SaaS-style platform where users can upload business datasets, analyze data using SQL queries, visualize insights via animated dashboards, generate AI-powered insights, run "what-if" simulations, and export reports.

![InsightIQ](https://img.shields.io/badge/InsightIQ-AI%20Analytics-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔐 Authentication
- Secure JWT-based authentication
- User registration and login
- Protected routes and middleware
- Password hashing with bcrypt

### 📊 Data Management
- Upload CSV/Excel files with validation
- Automatic data type inference
- Data preview and sample extraction
- Dataset organization and metadata

### 📈 Analytics Engine
- SQL query execution on uploaded data
- Predefined query templates
- Query history and favorites
- Real-time result visualization

### 🤖 AI-Powered Insights
- Automated trend analysis
- Anomaly detection
- Predictive analytics
- Actionable business recommendations

### 🎯 What-If Simulations
- Price change impact analysis
- Market expansion modeling
- Customer growth projections
- Scenario-based predictions

### 📱 Modern UI/UX
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Interactive charts with Recharts
- Dark mode support
- Glass morphism and gradient themes

### 📄 Report Generation
- PDF report export
- CSV data export
- JSON format support
- Customizable report templates

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast development build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Recharts** - Interactive data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Joi** - Input validation
- **bcryptjs** - Password hashing
- **dotenv** - Environment configuration

### AI & Analytics
- **OpenAI/Groq API** - AI insights generation
- **CSV Parser** - Data processing
- **XLSX** - Excel file handling
- **jsPDF** - PDF generation
- **html2canvas** - Chart export

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/insightiq.git
cd insightiq
```

2. **Install dependencies**
```bash
# Install all dependencies (root, client, server)
npm run install:all

# Or install separately
npm install
cd client && npm install
cd ../server && npm install
```

3. **Setup environment variables**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

4. **Setup PostgreSQL database**
```bash
# Create database
createdb insightiq

# Run database migrations
psql -d insightiq -f server/models/init.sql
```

5. **Start the application**
```bash
# Start both client and server
npm run dev

# Or start separately
npm run server  # Backend on port 5000
npm run client  # Frontend on port 5173
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insightiq
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# AI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
# OR
GROQ_API_KEY=your_groq_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Database Setup

1. **Create PostgreSQL database**
```sql
CREATE DATABASE insightiq;
CREATE USER insightiq_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE insightiq TO insightiq_user;
```

2. **Run migrations**
```bash
psql -d insightiq -f server/models/init.sql
```

## 📁 Project Structure

```
insightiq/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── server.js
├── uploads/                # File upload directory
├── .env.example           # Environment template
├── package.json           # Root package.json
└── README.md
```

## 🎯 Usage Guide

### 1. User Registration & Login
- Visit http://localhost:5173
- Click "Sign Up" to create an account
- Use email and password (minimum 6 characters)
- Login with your credentials

### 2. Upload Data
- Navigate to "Data Management"
- Click "Upload Dataset"
- Drag & drop or select CSV/Excel files
- View data preview and column information

### 3. Run Analytics
- Go to "Analytics" page
- Select uploaded dataset
- Write custom SQL queries or use predefined templates
- View results in table format

### 4. Generate AI Insights
- Visit "AI Insights" page
- Select dataset and insight type
- Click "Generate Insights" for AI analysis
- Review confidence scores and recommendations

### 5. Run Simulations
- Navigate to "Simulation" page
- Choose scenario type (price change, market expansion, etc.)
- Adjust parameters
- Run simulation and view predictions

### 6. Export Reports
- Go to "Reports & Exports"
- Select dataset and report type
- Generate and download PDF/CSV reports

## 🔧 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`
User login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/verify`
Verify JWT token
```headers
Authorization: Bearer <token>
```

### Data Management Endpoints

#### POST `/api/data/upload`
Upload dataset (multipart/form-data)
```
file: [CSV/Excel file]
name: "Dataset Name"
description: "Dataset Description"
```

#### GET `/api/data/datasets`
Get all user datasets

#### GET `/api/data/datasets/:id`
Get specific dataset details

#### DELETE `/api/data/datasets/:id`
Delete dataset

### Analytics Endpoints

#### POST `/api/analytics/query`
Execute SQL query
```json
{
  "query": "SELECT * FROM data LIMIT 10",
  "datasetId": 1
}
```

#### GET `/api/analytics/queries/predefined`
Get predefined query templates

#### GET `/api/analytics/dashboard/stats`
Get dashboard statistics

### AI Endpoints

#### POST `/api/ai/insights`
Generate AI insights
```json
{
  "datasetId": 1,
  "insightType": "trend",
  "data": [...]
}
```

#### POST `/api/ai/simulation`
Run what-if simulation
```json
{
  "datasetId": 1,
  "scenario": "price_change",
  "parameters": {
    "priceChange": 10,
    "currentRevenue": 100000
  }
}
```

## 🚀 Deployment

### Frontend (Vercel)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy frontend**
```bash
cd client
vercel --prod
```

3. **Environment Variables**
Set `VITE_API_URL` to your backend URL

### Backend (Render/Railway)

1. **Prepare for deployment**
```bash
# Add production dependencies
cd server
npm install --production
```

2. **Deploy to Render**
- Connect GitHub repository
- Set environment variables
- Configure PostgreSQL database
- Deploy automatically

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

2. **Build and run**
```bash
docker build -t insightiq-server ./server
docker run -p 5000:5000 insightiq-server
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests (if configured)
cd client
npm test
```

### Test Coverage
- Authentication flows
- Data upload and processing
- Query execution
- AI insights generation
- Simulation results

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Joi schema validation
- **File Upload Security** - Type and size validation
- **CORS Protection** - Configured cross-origin policy
- **Rate Limiting** - API request throttling
- **SQL Injection Prevention** - Parameterized queries
- **Helmet.js** - Security headers

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL status
pg_isready

# Verify database exists
psql -l

# Check connection string in .env
```

#### Frontend Build Error
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

#### File Upload Issues
```bash
# Check uploads directory permissions
mkdir -p uploads
chmod 755 uploads
```

#### AI API Errors
- Verify API key in environment variables
- Check API rate limits
- Ensure proper endpoint configuration

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- Use ESLint for code formatting
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Recharts](https://recharts.org/) - Chart library

## 📞 Support

For support and questions:
- 📧 Email: support@insightiq.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/insightiq/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/insightiq/wiki)

---

**Built with ❤️ by the InsightIQ Team**
