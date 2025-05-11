# InsightPro - Business Dashboard

A modern web application for analyzing sales data and generating professional reports.

## Features

- CSV file upload with drag-and-drop support
- Interactive dashboard with key metrics
- Monthly revenue trend visualization
- PDF report generation
- Modern and responsive UI

## Tech Stack

### Backend
- Flask (Python)
- Pandas for data processing
- Matplotlib for chart generation
- FPDF for PDF generation

### Frontend
- React with Vite
- Chart.js for data visualization
- Bootstrap 5 for UI components
- Axios for API communication

## Setup Instructions

### Backend Setup

1. Make sure you have Python 3.7+ installed

2. Navigate to the project root:
```bash
cd InsightPro
```

3. Create a virtual environment:
```bash
python -m venv venv
```

4. Activate the virtual environment:
   - On Windows:
   ```bash
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

5. Install dependencies:
```bash
pip install -r requirements.txt
```

6. Navigate to the backend directory:
```bash
cd backend
```

7. Run the Flask server:
```bash
python run.py
```

8. Verify the backend is working by visiting http://localhost:5000/api/test in your browser. You should see a JSON response: `{"message":"API is working","status":"success"}`

### Frontend Setup

1. Make sure you have Node.js 14+ installed

2. Open a new terminal and navigate to the frontend directory:
```bash
cd InsightPro/frontend
```

3. Install dependencies:
```bash
npm install
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Troubleshooting

### Backend Issues

1. **Import errors**: If you see import errors, make sure you're running the Flask app from the correct directory:
```bash
cd InsightPro/backend
python run.py
```

2. **404 errors**: Ensure the API routes are correct. Test with http://localhost:5000/api/test

3. **File permissions**: Make sure the uploads directory has write permissions:
```bash
mkdir -p backend/app/static/uploads
chmod 755 backend/app/static/uploads  # On macOS/Linux
```

### Frontend Issues

1. **Missing dependencies**: If you see errors about missing modules, run:
```bash
cd frontend
npm install
```

2. **API connection issues**: Check that the backend is running on port 5000

3. **CORS issues**: Ensure the Flask CORS extension is working correctly

## CSV File Format

The application expects CSV files with the following columns:
- date: Date of the sale (YYYY-MM-DD)
- revenue: Revenue amount
- product: Product name

Example:
```csv
date,revenue,product
2024-01-01,100.50,Product A
2024-01-02,75.25,Product B
```

## Usage

1. Open http://localhost:3000 in your browser
2. Upload a CSV file using the drag-and-drop interface
3. View the dashboard with key metrics and revenue trend
4. Download the PDF report using the "Download Report" button

## Development

- Backend API endpoints:
  - GET /api/test: Test if the API is working
  - POST /api/upload: Upload CSV file
  - GET /api/download-pdf: Download generated PDF report

- Frontend components:
  - UploadCSV: File upload interface
  - Dashboard: Main dashboard with metrics
  - RevenueChart: Monthly revenue visualization 