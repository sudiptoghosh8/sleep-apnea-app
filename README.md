# Sleep Apnea Detection Web Application

## Overview

A complete web application for ECG-based sleep apnea detection with advanced visualization capabilities. The application features a responsive React frontend with interactive charts and a Flask backend with ECG processing algorithms.

## Features

### Frontend Features
- **Mobile-first responsive design** with glass-morphism UI
- **Interactive ECG visualization** with dual-mode charts (ECG Signal & Apnea Probability)
- **Real-time file upload** with drag-and-drop support
- **Comprehensive settings panel** with customization options
- **Dark/Light theme switching**
- **Configuration save/load functionality**
- **Professional animations and transitions**

### Backend Features
- **Multi-format file support** (CSV, TXT, JSON, APN)
- **Simulated sleep apnea detection algorithms**
- **RESTful API endpoints** with CORS support
- **Robust error handling and validation**
- **File size limits and security measures**

### Supported File Formats
- **CSV**: Comma-separated values with time,ecg_signal columns
- **TXT**: Tab or space-separated values
- **JSON**: Structured data with time and signal arrays
- **APN**: Apnea-specific format files

## Project Structure

```
sleep-apnea-app/
├── backend/                 # Flask backend application
│   ├── src/
│   │   ├── main.py         # Main Flask application
│   │   ├── routes/
│   │   │   ├── ecg.py      # ECG processing endpoints
│   │   │   └── user.py     # User management routes
│   │   └── models/         # Database models
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Virtual environment
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── components/    # React components
│   │   │   ├── ECGChart.jsx
│   │   │   ├── ProbabilityChart.jsx
│   │   │   └── SettingsPanel.jsx
│   │   └── App.css        # Custom styles
│   ├── package.json       # Node.js dependencies
│   └── dist/             # Built frontend files
└── README.md             # This file
```

## Installation & Setup

### Prerequisites
- Node.js 20.18.0 or higher
- Python 3.11 or higher
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd sleep-apnea-app/backend
   ```

2. **Activate virtual environment**
   ```bash
   source venv/bin/activate  # On Linux/macOS
   # or
   venv\Scripts\activate     # On Windows
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask server**
   ```bash
   python src/main.py
   ```
   
   The backend will be available at `http://localhost:5002`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd sleep-apnea-app/frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm run dev --host
   ```
   
   The frontend will be available at `http://localhost:5173`

## Usage Guide

### Basic Usage

1. **Upload ECG File**
   - Drag and drop your ECG file onto the upload area
   - Or click to browse and select a file
   - Supported formats: CSV, TXT, JSON, APN (max 10MB)

2. **Adjust Detection Sensitivity**
   - Use the sensitivity slider to adjust detection threshold
   - Range: 0% (low sensitivity) to 100% (high sensitivity)

3. **View Analysis Results**
   - Summary cards show Apnea Events, AHI Score, and Severity
   - Detailed analysis includes Sleep Study Summary and Signal Statistics

4. **Interactive Visualization**
   - **ECG Signal tab**: View the raw ECG signal with detected apnea events
   - **Apnea Probability tab**: View probability of apnea occurrence over time

### Advanced Features

#### Settings Panel
Access via the settings (gear) icon in the top-right corner:

- **Display Settings**: Animations, tooltips, grid lines, chart style, height
- **Analysis Settings**: Sensitivity, probability threshold, auto-analysis options
- **Color Themes**: 5 predefined themes + custom color picker
- **Export Settings**: Save/load configuration files

#### Theme Switching
- Click the moon/sun icon to toggle between light and dark modes
- Theme preference is automatically saved

#### Configuration Management
- **Save Config**: Download current settings as JSON file
- **Load Config**: Upload previously saved configuration file

## API Documentation

### Base URL
```
http://localhost:5002/api/ecg
```

### Endpoints

#### Health Check
```http
GET /health
```
Returns server status and API information.

#### File Upload & Analysis
```http
POST /upload
Content-Type: multipart/form-data

Parameters:
- file: ECG data file (CSV, TXT, JSON, APN)
- sensitivity: Detection sensitivity (0.0-1.0, optional, default: 0.5)
```

Returns comprehensive analysis results including:
- ECG data points
- Detected apnea events
- AHI (Apnea-Hypopnea Index) calculation
- Severity classification
- Probability data for visualization

### Response Format
```json
{
  "success": true,
  "data": {
    "filename": "ecg_data.csv",
    "total_events": 0,
    "ahi_score": 0.0,
    "severity": "Normal",
    "duration_hours": 0.0,
    "apnea_events": [],
    "signal_stats": {
      "data_points": 26,
      "mean_value": 0.223,
      "std_deviation": 0.072,
      "min_value": 0.125,
      "max_value": 0.330
    },
    "probability_data": [
      {"time": 0, "probability": 0.125},
      ...
    ]
  }
}
```

## Deployment

### Local Development
Both frontend and backend are configured to run locally with hot-reload for development.

### Production Deployment

#### Frontend Deployment
1. **Build the frontend**
   ```bash
   cd frontend
   pnpm run build
   ```

2. **Deploy static files**
   The `dist/` folder contains all static files ready for deployment to any static hosting service.

#### Backend Deployment
1. **Configure production settings**
   - Update CORS settings for production domain
   - Set appropriate host and port
   - Configure environment variables

2. **Deploy to production server**
   - Use gunicorn or similar WSGI server
   - Configure reverse proxy (nginx)
   - Set up SSL certificates

### Environment Variables
```bash
# Backend
FLASK_ENV=production
CORS_ORIGINS=https://yourdomain.com

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Backend runs on port 5002 by default
   - Frontend runs on port 5173 by default
   - Change ports in configuration if needed

2. **CORS errors**
   - Ensure backend CORS is configured for frontend domain
   - Check that API endpoints are accessible

3. **File upload errors**
   - Verify file format is supported
   - Check file size (max 10MB)
   - Ensure proper CSV structure (time,ecg_signal columns)

4. **Chart rendering issues**
   - Ensure Recharts is properly installed
   - Check browser console for JavaScript errors

### File Format Examples

#### CSV Format
```csv
time,ecg_signal
0.000,0.125
0.004,0.130
0.008,0.128
```

#### JSON Format
```json
{
  "time": [0.000, 0.004, 0.008],
  "ecg_signal": [0.125, 0.130, 0.128]
}
```

## Technical Specifications

### Frontend Stack
- **React 18** with Hooks
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **Lucide React** for icons
- **Vite** for build tooling

### Backend Stack
- **Flask** web framework
- **Flask-CORS** for cross-origin requests
- **Pandas** for data processing
- **NumPy** for numerical computations
- **Werkzeug** for file handling

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- **File Processing**: Optimized for files up to 10MB
- **Chart Rendering**: Efficient rendering with data sampling for large datasets
- **Memory Usage**: Minimal memory footprint with proper data cleanup
- **Mobile Performance**: Optimized for mobile devices with responsive design

## Security Features

- **File Validation**: Strict file type and size validation
- **Input Sanitization**: All user inputs are sanitized
- **CORS Configuration**: Proper cross-origin request handling
- **Error Handling**: Secure error messages without sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: July 2025  
**Developed by**: Manus AI Team

# sleep-apnea-app
