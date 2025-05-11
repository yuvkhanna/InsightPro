import pandas as pd
import matplotlib.pyplot as plt
from fpdf import FPDF
import os
from datetime import datetime
import json

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def process_csv_data(file_path):
    df = pd.read_csv(file_path)
    
    # Calculate metrics
    total_revenue = df['revenue'].sum()
    avg_order_value = df['revenue'].mean()
    top_product = df.groupby('product')['revenue'].sum().idxmax()
    
    # Monthly revenue trend
    df['date'] = pd.to_datetime(df['date'])
    monthly_revenue = df.groupby(df['date'].dt.strftime('%Y-%m'))['revenue'].sum()
    
    return {
        'total_revenue': float(total_revenue),
        'avg_order_value': float(avg_order_value),
        'top_product': top_product,
        'monthly_revenue': monthly_revenue.to_dict()
    }

def generate_revenue_chart(monthly_revenue, save_path):
    plt.figure(figsize=(10, 6))
    plt.bar(monthly_revenue.keys(), monthly_revenue.values())
    plt.title('Monthly Revenue Trend')
    plt.xlabel('Month')
    plt.ylabel('Revenue')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def generate_pdf_report(data, chart_path, output_path):
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'Sales Report', ln=True, align='C')
    pdf.ln(10)
    
    # Metrics
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f'Total Revenue: ${data["total_revenue"]:,.2f}', ln=True)
    pdf.cell(0, 10, f'Average Order Value: ${data["avg_order_value"]:,.2f}', ln=True)
    pdf.cell(0, 10, f'Top Selling Product: {data["top_product"]}', ln=True)
    
    # Add chart
    pdf.image(chart_path, x=10, y=100, w=190)
    
    pdf.output(output_path) 