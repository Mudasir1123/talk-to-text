# TalkToText Pro - AI-Powered Meeting Notes Generator

Transform your meeting recordings into structured, actionable notes using advanced AI technology.

## 🚀 Features

- **AI Speech-to-Text**: Advanced transcription with 95%+ accuracy
- **Multi-Language Support**: Automatic translation from 50+ languages to English
- **Smart Summarization**: Intelligent extraction of key points, decisions, and action items
- **Modern UI**: Futuristic glassmorphism design with smooth animations
- **Secure Authentication**: User management with admin controls
- **Real-time Processing**: Live status updates during AI processing
- **Export Options**: Download meeting notes as PDF

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with React 18
- **TypeScript** for type safety
- **Tailwind CSS v4** with glassmorphism design
- **Shadcn/UI** components
- **Lucide React** icons

### Backend
- **Python Flask** REST API
- **SQLite** database
- **Google Gemini 2.5 Flash** for AI processing
- **JWT** authentication
- **Speech Recognition** for transcription

## 📋 Prerequisites

Before installation, ensure you have:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

## 🔧 Installation Instructions

### 1. Clone/Download the Project

\`\`\`bash
# If using Git
git clone <your-repo-url>
cd talktotext-pro

# Or download and extract the ZIP file
\`\`\`

### 2. Quick Installation (Recommended)

\`\`\`bash
# Run the automated installation script
chmod +x install.sh
./install.sh
\`\`\`

### 3. Manual Installation

#### Backend Setup (Python Flask)

\`\`\`bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables (create .env file)
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "SECRET_KEY=your_secret_key_here" >> .env
echo "JWT_SECRET_KEY=your_jwt_secret_here" >> .env

# Initialize database
python3 database.py

# Start the Flask server
python3 app.py
\`\`\`

The backend will run on `http://localhost:5000`

#### Frontend Setup (Next.js)

Open a new terminal window:

\`\`\`bash
# Navigate back to project root
cd ..

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
\`\`\`

The frontend will run on `http://localhost:3000`

## 🚀 Quick Start

\`\`\`bash
# 1. Install everything
./install.sh

# 2. Add your Gemini API key to backend/.env
# Edit backend/.env and replace 'your_gemini_api_key_here' with your actual key

# 3. Start both servers
./start.sh
\`\`\`

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory with:

\`\`\`env
# Required: Get from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Security keys (generate random strings)
SECRET_KEY=your_flask_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here

# Optional: Database path
DATABASE_PATH=talktotext_pro.db
\`\`\`

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `backend/.env` file

## 👤 Default Admin Credentials

\`\`\`
Email: admin@gmail.com
Password: admin123
\`\`\`

## 🚀 Usage

1. **Start both servers** using `./start.sh` or manually
2. **Open browser** to `http://localhost:3000`
3. **Sign up** for a new account or **login** with admin credentials
4. **Upload** your meeting recording (MP3, WAV, MP4, etc.)
5. **Wait** for AI processing to complete
6. **View** structured meeting notes with summaries and action items
7. **Download** notes as PDF or view in dashboard

## 📁 Project Structure

\`\`\`
talktotext-pro/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── upload/           # File upload page
│   ├── history/          # Meeting history
│   ├── login/            # Authentication pages
│   └── ...
├── components/            # React components
│   ├── navbar.tsx        # Navigation bar
│   ├── footer.tsx        # Footer component
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   └── auth.ts           # Authentication service
├── backend/              # Python Flask backend
│   ├── app.py           # Flask main application
│   ├── database.py      # Database setup and models
│   ├── ai_processor.py  # AI processing pipeline
│   ├── config.py        # Configuration settings
│   ├── requirements.txt # Python dependencies
│   ├── utils/           # Python utilities
│   │   ├── audio_processor.py
│   │   ├── text_processor.py
│   │   ├── gemini_client.py
│   │   └── pdf_generator.py
│   └── uploads/         # File upload directory
├── package.json         # Node.js dependencies
├── install.sh          # Installation script
├── start.sh           # Startup script
└── README.md         # This file
\`\`\`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### File Upload & Processing
- `POST /api/upload` - Upload meeting recording
- `POST /api/process/<id>` - Start processing
- `GET /api/processing-status/<id>` - Get processing status

### Meeting Management
- `GET /api/meetings` - Get user meetings
- `GET /api/meetings/<id>` - Get meeting details
- `GET /api/meetings/<id>/download` - Download notes as PDF

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check Python version: `python3 --version`
   - Install dependencies: `cd backend && pip install -r requirements.txt`
   - Check port 5000 is available

2. **Frontend not starting**
   - Check Node.js version: `node --version`
   - Install dependencies: `npm install`
   - Check port 3000 is available

3. **Database errors**
   - Run: `cd backend && python3 database.py`
   - Check file permissions in backend directory

4. **AI processing fails**
   - Verify Gemini API key in `backend/.env` file
   - Check internet connection
   - Ensure audio file is in supported format

5. **File upload issues**
   - Check file size (max 100MB)
   - Verify file format (MP3, WAV, MP4, etc.)
   - Ensure `backend/uploads/` directory exists

### Supported File Formats

- **Audio**: MP3, WAV, M4A, FLAC
- **Video**: MP4, AVI, MOV

## 📝 Development Notes

- The application uses SQLite for simplicity in development
- For production, consider using PostgreSQL or MySQL
- File uploads are stored locally in the `backend/uploads/` directory
- Processing happens in background threads
- Real-time status updates via polling

## 🔒 Security Features

- JWT-based authentication
- Password hashing with SHA-256
- File type validation
- File size limits
- CORS protection
- Input sanitization

## 📄 License

This project is for educational purposes. Please ensure you have proper licenses for any AI services used in production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review the API documentation
- Ensure all dependencies are properly installed
- Verify environment variables are set correctly in `backend/.env`

---

**Happy Meeting Processing! 🎉**
