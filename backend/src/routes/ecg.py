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

ecg_bp = Blueprint('ecg', __name__)

# Configuration
ALLOWED_EXTENSIONS = {'csv', 'txt', 'json', 'apn'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

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
    Simulated sleep apnea detection algorithm
    Returns analysis results with apnea events and statistics
    """
    try:
        if len(ecg_data) == 0:
            return None
            
        # Simulate realistic sleep apnea detection
        sampling_rate = 250  # Assume 250 Hz sampling rate
        duration_hours = len(ecg_data) / (sampling_rate * 3600)
        
        # Simulate apnea detection based on ECG variability
        # Real algorithms would analyze heart rate variability, R-R intervals, etc.
        
        # Calculate basic statistics
        mean_signal = np.mean(ecg_data)
        std_signal = np.std(ecg_data)
        
        # Simulate apnea events based on signal characteristics and sensitivity
        base_apnea_rate = 5 + (1 - sensitivity) * 15  # 5-20 events per hour based on sensitivity
        expected_events = int(duration_hours * base_apnea_rate)
        
        # Add some randomness based on signal characteristics
        signal_variability = std_signal / (abs(mean_signal) + 1e-6)
        variability_factor = min(2.0, max(0.5, signal_variability))
        actual_events = max(0, int(expected_events * variability_factor * (0.8 + 0.4 * random.random())))
        
        # Generate apnea event timestamps
        apnea_events = []
        if actual_events > 0:
            event_indices = sorted(random.sample(range(len(ecg_data)), min(actual_events * 10, len(ecg_data) // 100)))
            
            for i in range(0, len(event_indices), 10):  # Group events
                start_idx = event_indices[i]
                duration = random.randint(10, 60)  # 10-60 seconds
                end_idx = min(start_idx + duration * sampling_rate, len(ecg_data) - 1)
                
                apnea_events.append({
                    'start_time': start_idx / sampling_rate,
                    'end_time': end_idx / sampling_rate,
                    'duration': (end_idx - start_idx) / sampling_rate,
                    'start_index': int(start_idx),
                    'end_index': int(end_idx),
                    'severity': random.choice(['mild', 'moderate', 'severe'])
                })
        
        # Calculate AHI (Apnea-Hypopnea Index)
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
        window_size = max(1, len(ecg_data) // 1000)  # Reduce data points for visualization
        
        for i in range(0, len(ecg_data), window_size):
            time_point = i / sampling_rate
            
            # Calculate probability based on proximity to apnea events
            prob = 0.1  # Base probability
            for event in apnea_events:
                if event['start_time'] <= time_point <= event['end_time']:
                    prob = 0.8 + 0.2 * random.random()
                    break
                elif abs(time_point - event['start_time']) < 30:  # Within 30 seconds
                    distance = abs(time_point - event['start_time'])
                    prob = max(prob, 0.3 * (1 - distance / 30) + 0.1 * random.random())
            
            prob_data.append({
                'time': time_point,
                'probability': min(1.0, prob + 0.05 * random.random())
            })
        
        return {
            'apnea_count': len(apnea_events),
            'ahi': round(ahi, 2),
            'severity': severity,
            'duration_hours': round(duration_hours, 2),
            'apnea_events': apnea_events[:50],  # Limit for frontend performance
            'probability_data': prob_data,
            'signal_stats': {
                'mean': float(mean_signal),
                'std': float(std_signal),
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

