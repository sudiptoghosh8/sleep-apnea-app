import os
import json
import csv
import numpy as np
import pandas as pd
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest
import tempfile
import io
from datetime import datetime
import random
import lightgbm as lgb

ecg_bp = Blueprint('ecg', __name__)

# Configuration
ALLOWED_EXTENSIONS = {'csv', 'txt', 'json', 'apn'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Placeholder for the LightGBM model
# In a real application, you would load a trained model here.
# For demonstration, we'll simulate a model loading and prediction.
# model_path = os.path.join(os.path.dirname(__file__), 'lgbm_model.txt') # Assuming model is saved as text
# try:
#     with open(model_path, 'r') as f:
#         lgbm_model = lgb.Booster(model_str=f.read())
# except Exception as e:
#     current_app.logger.warning(f'Error loading LightGBM model: {e}. Using simulated detection.')
#     lgbm_model = None

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_csv_file(file_content):
    """Parse CSV file content and extract ECG data"""
    try:
        # Try to read as CSV with different delimiters
        for delimiter in [',', ';', '\t', ' ']:
            try:
                df = pd.read_csv(io.StringIO(file_content), delimiter=delimiter)
                if len(df.columns) >= 1:
                    # Look for ECG-like column names
                    ecg_columns = [col for col in df.columns if any(keyword in col.lower() 
                                 for keyword in ['ecg', 'ekg', 'signal', 'voltage', 'amplitude', 'value'])]
                    
                    if ecg_columns:
                        ecg_data = df[ecg_columns[0]].dropna().values
                    else:
                        # Use first numeric column
                        numeric_cols = df.select_dtypes(include=[np.number]).columns
                        if len(numeric_cols) > 0:
                            ecg_data = df[numeric_cols[0]].dropna().values
                        else:
                            ecg_data = df.iloc[:, 0].dropna().values
                    
                    return ecg_data.astype(float)
            except:
                continue
        
        # If CSV parsing fails, try as simple numeric data
        lines = file_content.strip().split('\n')
        data = []
        for line in lines:
            try:
                # Try to extract numeric values from each line
                values = [float(x) for x in line.replace(',', ' ').split() if x.strip()]
                data.extend(values)
            except:
                continue
        
        return np.array(data) if data else None
        
    except Exception as e:
        raise ValueError(f"Error parsing CSV file: {str(e)}")

def parse_txt_file(file_content):
    """Parse TXT file content and extract ECG data"""
    try:
        lines = file_content.strip().split('\n')
        data = []
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#') or line.startswith('//'):
                continue
                
            try:
                # Try to extract numeric values from each line
                values = [float(x) for x in line.replace(',', ' ').replace('\t', ' ').split() if x.strip()]
                data.extend(values)
            except:
                continue
        
        return np.array(data) if data else None
        
    except Exception as e:
        raise ValueError(f"Error parsing TXT file: {str(e)}")

def parse_json_file(file_content):
    """Parse JSON file content and extract ECG data"""
    try:
        data = json.loads(file_content)
        
        # Handle different JSON structures
        if isinstance(data, list):
            # Simple array of numbers
            if all(isinstance(x, (int, float)) for x in data):
                return np.array(data)
            # Array of objects with ECG data
            elif isinstance(data[0], dict):
                for key in ['ecg', 'signal', 'value', 'amplitude', 'voltage']:
                    if key in data[0]:
                        return np.array([item[key] for item in data if key in item])
        
        elif isinstance(data, dict):
            # Look for ECG data in dictionary
            for key in ['ecg', 'signal', 'data', 'values', 'amplitudes', 'voltages']:
                if key in data and isinstance(data[key], list):
                    return np.array(data[key])
            
            # If no direct match, try first list found
            for key, value in data.items():
                if isinstance(value, list) and len(value) > 0:
                    if all(isinstance(x, (int, float)) for x in value):
                        return np.array(value)
        
        return None
        
    except Exception as e:
        raise ValueError(f"Error parsing JSON file: {str(e)}")

def parse_apn_file(file_content):
    """Parse APN file content (custom format for apnea data)"""
    try:
        # APN files might be similar to TXT or CSV
        # Try parsing as structured data first
        lines = file_content.strip().split('\n')
        data = []
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
                
            try:
                # APN format might have timestamp and value
                parts = line.split()
                if len(parts) >= 2:
                    # Take the last numeric value as ECG signal
                    data.append(float(parts[-1]))
                elif len(parts) == 1:
                    data.append(float(parts[0]))
            except:
                continue
        
        return np.array(data) if data else None
        
    except Exception as e:
        raise ValueError(f"Error parsing APN file: {str(e)}")

def detect_sleep_apnea(ecg_data, sensitivity=0.5):
    """
    Detect sleep apnea using a LightGBM model (simulated for now)
    Returns analysis results with apnea events and statistics
    """
    try:
        if len(ecg_data) == 0:
            return None
            
        # In a real scenario, you would preprocess ecg_data to create features
        # that your LightGBM model expects. For this simulation, we'll create
        # dummy features.
        
        # Example: Create simple features (mean, std, min, max of segments)
        # This is a very basic example and would need to be much more sophisticated
        # for a real-world sleep apnea detection.
        segment_length = 250 # 1 second segments if sampling rate is 250 Hz
        features = []
        for i in range(0, len(ecg_data), segment_length):
            segment = ecg_data[i:i + segment_length]
            if len(segment) == segment_length:
                features.append([
                    np.mean(segment),
                    np.std(segment),
                    np.min(segment),
                    np.max(segment)
                ])
        
        if not features:
            return None
            
        feature_df = pd.DataFrame(features, columns=['mean', 'std', 'min', 'max'])
        
        # Simulate LightGBM prediction
        # In a real scenario, you would use: lgbm_model.predict(feature_df)
        # For now, we'll generate random probabilities based on sensitivity
        
        # Generate random probabilities for each segment
        simulated_probabilities = np.random.rand(len(feature_df)) * (1 - sensitivity) + (sensitivity * 0.5)
        
        # Determine apnea events based on a threshold
        apnea_threshold = 0.5 # This would be learned by the model
        apnea_predictions = (simulated_probabilities > apnea_threshold).astype(int)
        
        # Convert segment-level predictions back to original ECG data scale for visualization
        # This is a simplified mapping for demonstration
        apnea_events = []
        for i, prediction in enumerate(apnea_predictions):
            if prediction == 1:
                start_idx = i * segment_length
                end_idx = min((i + 1) * segment_length, len(ecg_data) - 1)
                duration = (end_idx - start_idx) / 250 # Assuming 250 Hz
                
                # Simulate severity
                severity = random.choice(['mild', 'moderate', 'severe'])
                apnea_events.append({
                    'start_time': start_idx / 250,
                    'end_time': end_idx / 250,
                    'duration': duration,
                    'start_index': int(start_idx),
                    'end_index': int(end_idx),
                    'severity': severity
                })
        
        # Calculate AHI (Apnea-Hypopnea Index)
        sampling_rate = 250
        duration_hours = len(ecg_data) / (sampling_rate * 3600)
        ahi = len(apnea_events) / max(duration_hours, 0.1)
        
        # Determine severity based on AHI
        if ahi < 5:
            severity = 'Normal'
        elif ahi < 15:
            severity = 'Mild'
        elif ahi < 30:
            severity = 'Moderate'
        else:
            severity = 'Severe'
        
        # Generate probability data for visualization
        prob_data = []
        for i, prob in enumerate(simulated_probabilities):
            time_point = (i * segment_length) / sampling_rate
            prob_data.append({
                'time': time_point,
                'probability': float(prob)
            })
        
        return {
            'apnea_count': len(apnea_events),
            'ahi': round(ahi, 2),
            'severity': severity,
            'duration_hours': round(duration_hours, 2),
            'apnea_events': apnea_events[:50],  # Limit for frontend performance
            'probability_data': prob_data,
            'signal_stats': {
                'mean': float(np.mean(ecg_data)),
                'std': float(np.std(ecg_data)),
                'min': float(np.min(ecg_data)),
                'max': float(np.max(ecg_data)),
                'length': len(ecg_data)
            }
        }
        
    except Exception as e:
        raise ValueError(f"Error in sleep apnea detection: {str(e)}")



@ecg_bp.route('/upload', methods=['POST'])
def upload_file():
    """Handle ECG file upload and processing"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported. Allowed types: CSV, TXT, JSON, APN'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': f'File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB'}), 400
        
        # Read file content
        file_content = file.read().decode('utf-8', errors='ignore')
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        # Parse file based on extension
        ecg_data = None
        if file_ext == 'csv':
            ecg_data = parse_csv_file(file_content)
        elif file_ext == 'txt':
            ecg_data = parse_txt_file(file_content)
        elif file_ext == 'json':
            ecg_data = parse_json_file(file_content)
        elif file_ext == 'apn':
            ecg_data = parse_apn_file(file_content)
        
        if ecg_data is None or len(ecg_data) == 0:
            return jsonify({'error': 'Could not extract ECG data from file'}), 400
        
        # Get sensitivity parameter
        sensitivity = float(request.form.get('sensitivity', 0.5))
        sensitivity = max(0.0, min(1.0, sensitivity))  # Clamp between 0 and 1
        
        # Perform sleep apnea analysis
        analysis_result = detect_sleep_apnea(ecg_data, sensitivity)
        
        if analysis_result is None:
            return jsonify({'error': 'Failed to analyze ECG data'}), 500
        
        # Prepare ECG data for visualization (downsample for performance)
        max_points = 5000
        if len(ecg_data) > max_points:
            step = len(ecg_data) // max_points
            ecg_visualization = ecg_data[::step]
        else:
            ecg_visualization = ecg_data
        
        # Create time axis for ECG visualization
        sampling_rate = 250
        time_axis = np.arange(len(ecg_visualization)) / sampling_rate
        
        ecg_chart_data = [
            {'time': float(t), 'value': float(v)} 
            for t, v in zip(time_axis, ecg_visualization)
        ]
        
        response_data = {
            'success': True,
            'filename': filename,
            'analysis': analysis_result,
            'ecg_data': ecg_chart_data,
            'processing_time': datetime.now().isoformat()
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Error processing file: {str(e)}")
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@ecg_bp.route('/analyze', methods=['POST'])
def analyze_ecg():
    """Analyze ECG data with custom parameters"""
    try:
        data = request.json
        
        if 'ecg_data' not in data:
            return jsonify({'error': 'ECG data not provided'}), 400
        
        ecg_data = np.array(data['ecg_data'])
        sensitivity = float(data.get('sensitivity', 0.5))
        
        # Perform analysis
        analysis_result = detect_sleep_apnea(ecg_data, sensitivity)
        
        if analysis_result is None:
            return jsonify({'error': 'Failed to analyze ECG data'}), 500
        
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'processing_time': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error analyzing ECG: {str(e)}")
        return jsonify({'error': f'Error analyzing ECG: {str(e)}'}), 500

@ecg_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ECG Sleep Apnea Detection API',
        'timestamp': datetime.now().isoformat(),
        'supported_formats': list(ALLOWED_EXTENSIONS),
        'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024)
    }), 200




