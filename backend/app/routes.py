import os
from flask import jsonify, request, send_file
from werkzeug.utils import secure_filename
from app import app
from app.utils import allowed_file, process_csv_data, generate_revenue_chart, generate_pdf_report

@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({'status': 'success', 'message': 'API is working'})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename, app.config['ALLOWED_EXTENSIONS']):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(file_path)
        
        # Process data
        data = process_csv_data(file_path)
        
        # Generate chart
        chart_path = os.path.join(app.config['UPLOAD_FOLDER'], 'revenue_trend.png')
        generate_revenue_chart(data['monthly_revenue'], chart_path)
        
        # Generate PDF
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], 'report.pdf')
        generate_pdf_report(data, chart_path, pdf_path)
        
        return jsonify(data)
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/download-pdf', methods=['GET'])
def download_pdf():
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], 'report.pdf')
    if os.path.exists(pdf_path):
        return send_file(pdf_path, as_attachment=True)
    return jsonify({'error': 'PDF not found'}), 404 