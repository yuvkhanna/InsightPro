import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
from fpdf import FPDF
from io import StringIO
import csv
from datetime import datetime
import numpy as np

def process_csv_data(file_path):
    """Process CSV data and generate insights"""
    # Load and clean the dataframe first
    df, _ = load_and_clean_dataframe(file_path)
    
    # Calculate basic metrics
    total_revenue = df['revenue'].sum()
    avg_order_value = df['revenue'].mean()
    
    # Normalize product names (trim whitespace and standardize case)
    df['product_normalized'] = df['product'].str.strip().str.title()
    
    # Use normalized product names for aggregation and top product identification
    top_product = df.groupby('product_normalized')['revenue'].sum().idxmax()
    
    # Sort dataframe by date to ensure chronological order
    df = df.sort_values('date')
    
    # Extract year-month from datetime
    df['year_month'] = df['date'].dt.strftime('%Y-%m')
    
    # Monthly revenue trend - ensure it's sorted chronologically
    monthly_revenue = df.groupby('year_month')['revenue'].sum()
    
    # Ensure the monthly_revenue index is sorted chronologically
    monthly_revenue = monthly_revenue.sort_index()
    
    # Calculate monthly growth percentage
    monthly_growth = {}
    monthly_rev_list = list(monthly_revenue.items())
    for i in range(1, len(monthly_rev_list)):
        current_month = monthly_rev_list[i][0]
        current_rev = monthly_rev_list[i][1]
        prev_rev = monthly_rev_list[i-1][1]
        growth_pct = ((current_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0
        monthly_growth[current_month] = round(growth_pct, 2)
    
    # Revenue per product (for pie chart) - use normalized product names
    product_revenue = df.groupby('product_normalized')['revenue'].sum().to_dict()
    
    return {
        'total_revenue': float(total_revenue),
        'avg_order_value': float(avg_order_value),
        'top_product': top_product,
        'monthly_revenue': monthly_revenue.to_dict(),
        'monthly_growth': monthly_growth,
        'product_revenue': product_revenue
    }

def generate_revenue_chart(monthly_revenue, save_path):
    """Generate a bar chart of monthly revenue trends"""
    # Ensure data is ordered chronologically
    if not monthly_revenue:
        # Handle empty data case
        plt.figure(figsize=(10, 6))
        plt.title('Monthly Revenue Trend (No Data)')
        plt.xlabel('Month')
        plt.ylabel('Revenue')
        plt.savefig(save_path)
        plt.close()
        return
    
    # Sort months chronologically
    sorted_months = sorted(monthly_revenue.keys())
    sorted_values = [monthly_revenue[month] for month in sorted_months]
    
    # Format month labels to be more readable
    formatted_labels = []
    for month in sorted_months:
        try:
            date = datetime.strptime(month, '%Y-%m')
            formatted_labels.append(date.strftime('%b %Y'))  # e.g., "Jan 2023"
        except ValueError:
            # Fallback if the format is unexpected
            formatted_labels.append(month)
    
    plt.figure(figsize=(10, 6))
    plt.bar(formatted_labels, sorted_values)
    plt.title('Monthly Revenue Trend')
    plt.xlabel('Month')
    plt.ylabel('Revenue ($)')
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    # Add value labels on top of each bar
    for i, v in enumerate(sorted_values):
        plt.text(i, v + (max(sorted_values) * 0.02), 
                 f'${v:,.0f}', 
                 ha='center', fontsize=9)
    
    plt.savefig(save_path)
    plt.close()

def generate_product_pie_chart(product_revenue, save_path):
    """Generate a pie chart of revenue by product"""
    if not product_revenue:
        # Handle empty data case
        plt.figure(figsize=(8, 8))
        plt.title('Revenue by Product (No Data)')
        plt.savefig(save_path)
        plt.close()
        return
    
    # Sort products by revenue (highest first) for better visualization
    sorted_items = sorted(product_revenue.items(), key=lambda x: x[1], reverse=True)
    labels = [item[0] for item in sorted_items]
    values = [item[1] for item in sorted_items]
    
    plt.figure(figsize=(8, 8))
    plt.pie(values, labels=labels, autopct='%1.1f%%', startangle=90)
    plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
    plt.title('Revenue by Product')
    
    # Add a legend if there are many products
    if len(labels) > 5:
        plt.legend(labels, loc="best", bbox_to_anchor=(1, 0.5))
        
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def generate_pdf_report(data, chart_path, pie_chart_path, output_path):
    """Generate a PDF report with metrics and charts"""
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
    
    # Add monthly revenue chart
    pdf.ln(5)
    pdf.cell(0, 10, 'Monthly Revenue Trend', ln=True)
    pdf.image(chart_path, x=10, y=pdf.get_y(), w=190)
    
    # Add product revenue pie chart
    pdf.ln(100)  # Move down to leave space for the first chart
    pdf.cell(0, 10, 'Revenue by Product', ln=True)
    pdf.image(pie_chart_path, x=50, y=pdf.get_y(), w=100)
    
    pdf.output(output_path)

def generate_csv_export(data):
    """Generate CSV export of processed data"""
    output = StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow(['Metric', 'Value'])
    
    # Write basic metrics
    writer.writerow(['Total Revenue', f"${data['total_revenue']:,.2f}"])
    writer.writerow(['Average Order Value', f"${data['avg_order_value']:,.2f}"])
    writer.writerow(['Top Selling Product', data['top_product']])
    
    # Add a blank row as separator
    writer.writerow([])
    
    # Write monthly revenue
    writer.writerow(['Month', 'Revenue', 'Growth %'])
    
    # Ensure months are sorted chronologically
    sorted_months = sorted(data['monthly_revenue'].keys())
    for month in sorted_months:
        revenue = data['monthly_revenue'][month]
        growth = data['monthly_growth'].get(month, '')
        writer.writerow([month, f"${revenue:,.2f}", f"{growth}%" if growth else ""])
    
    # Add a blank row as separator
    writer.writerow([])
    
    # Write product revenue
    writer.writerow(['Product', 'Revenue'])
    
    # Sort products by revenue (highest first)
    sorted_products = sorted(data['product_revenue'].items(), key=lambda x: x[1], reverse=True)
    for product, revenue in sorted_products:
        writer.writerow([product, f"${revenue:,.2f}"])
    
    return output.getvalue()

def calculate_product_growth(df):
    """
    Calculate growth rates for each product between first and last month
    Returns a dictionary of product growth rates
    """
    # Ensure we have normalized product names
    if 'product_normalized' not in df.columns:
        df['product_normalized'] = df['product'].str.strip().str.title()
    
    # Get first and last month for each product
    df['year_month'] = df['date'].dt.strftime('%Y-%m')
    first_month = df['year_month'].min()
    last_month = df['year_month'].max()
    
    # Calculate revenue for first and last month for each product
    first_month_revenue = df[df['year_month'] == first_month].groupby('product_normalized')['revenue'].sum()
    last_month_revenue = df[df['year_month'] == last_month].groupby('product_normalized')['revenue'].sum()
    
    # Calculate growth rates
    growth_rates = {}
    for product in set(first_month_revenue.index) | set(last_month_revenue.index):
        first_rev = first_month_revenue.get(product, 0)
        last_rev = last_month_revenue.get(product, 0)
        
        if first_rev > 0:
            growth_rate = ((last_rev - first_rev) / first_rev) * 100
        else:
            growth_rate = float('inf') if last_rev > 0 else 0
            
        growth_rates[product] = round(growth_rate, 2)
    
    return growth_rates

def get_smart_tip(monthly_growth, product_growth):
    """
    Generate a smart tip based on growth trends
    """
    tips = []
    
    # Analyze overall growth trend
    recent_growth = list(monthly_growth.values())[-3:]  # Last 3 months
    avg_recent_growth = sum(recent_growth) / len(recent_growth) if recent_growth else 0
    
    if avg_recent_growth > 10:
        tips.append("Strong recent growth! Consider increasing inventory to meet demand.")
    elif avg_recent_growth < -5:
        tips.append("Recent decline in sales. Consider promotional activities or price adjustments.")
    
    # Analyze product growth
    growing_products = [p for p, g in product_growth.items() if g > 20]
    declining_products = [p for p, g in product_growth.items() if g < -20]
    
    if growing_products:
        tips.append(f"Products showing strong growth: {', '.join(growing_products[:2])}. Consider increasing their stock.")
    if declining_products:
        tips.append(f"Products showing significant decline: {', '.join(declining_products[:2])}. Review pricing or marketing strategy.")
    
    # If no specific trends, provide a general tip
    if not tips:
        tips.append("Sales are stable. Consider exploring new product categories or markets.")
    
    return " ".join(tips)

def generate_advanced_insights(df):
    """
    Generate advanced insights from cleaned sales data
    """
    # Ensure data is sorted by date
    df = df.sort_values('date')
    
    # Calculate monthly revenue trend
    df['year_month'] = df['date'].dt.strftime('%Y-%m')
    monthly_revenue = df.groupby('year_month')['revenue'].sum().sort_index()
    
    # Calculate overall growth
    first_month_rev = monthly_revenue.iloc[0]
    last_month_rev = monthly_revenue.iloc[-1]
    total_growth = ((last_month_rev - first_month_rev) / first_month_rev * 100) if first_month_rev > 0 else 0
    
    # Calculate product growth rates
    product_growth = calculate_product_growth(df)
    
    # Get top growing and declining products
    sorted_products = sorted(product_growth.items(), key=lambda x: x[1], reverse=True)
    top_growing = sorted_products[:5]
    top_declining = sorted_products[-5:][::-1]  # Reverse to get most declining first
    
    # Find biggest sales day
    daily_revenue = df.groupby('date')['revenue'].sum()
    biggest_day = daily_revenue.idxmax()
    biggest_day_revenue = daily_revenue.max()
    
    # Calculate monthly growth for smart tips
    monthly_growth = {}
    monthly_rev_list = list(monthly_revenue.items())
    for i in range(1, len(monthly_rev_list)):
        current_month = monthly_rev_list[i][0]
        current_rev = monthly_rev_list[i][1]
        prev_rev = monthly_rev_list[i-1][1]
        growth_pct = ((current_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0
        monthly_growth[current_month] = round(growth_pct, 2)
    
    # Generate smart tip
    smart_tip = get_smart_tip(monthly_growth, product_growth)
    
    return {
        'revenue_trend': [
            {'month': month, 'revenue': float(revenue)}
            for month, revenue in monthly_revenue.items()
        ],
        'total_growth': round(total_growth, 2),
        'top_growing_products': [
            {'product': product, 'growth': growth}
            for product, growth in top_growing
        ],
        'top_declining_products': [
            {'product': product, 'growth': growth}
            for product, growth in top_declining
        ],
        'biggest_sales_day': {
            'date': biggest_day.strftime('%Y-%m-%d'),
            'revenue': float(biggest_day_revenue)
        },
        'smart_tip': smart_tip
    }

# Import at the end to avoid circular imports
from .clean_data import load_and_clean_dataframe 