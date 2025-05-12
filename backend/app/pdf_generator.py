from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from datetime import datetime
import io
import matplotlib.pyplot as plt
import seaborn as sns

def create_forecast_chart(historical_data, forecast_data):
    """Create a matplotlib chart for the PDF report."""
    plt.figure(figsize=(8, 4))
    sns.set_style("whitegrid")
    
    # Plot historical data
    months = list(historical_data.keys())
    values = list(historical_data.values())
    plt.plot(months, values, 'b-', label='Historical', linewidth=2)
    
    # Plot forecast data
    forecast_months = [f['month'] for f in forecast_data['forecast']]
    forecast_values = [f['forecast'] for f in forecast_data['forecast']]
    lower_bounds = [f['lower_bound'] for f in forecast_data['forecast']]
    upper_bounds = [f['upper_bound'] for f in forecast_data['forecast']]
    
    plt.plot(forecast_months, forecast_values, 'r--', label='Forecast', linewidth=2)
    plt.fill_between(forecast_months, lower_bounds, upper_bounds, color='red', alpha=0.1)
    
    plt.title('Revenue Forecast')
    plt.xlabel('Month')
    plt.ylabel('Revenue ($)')
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    # Save plot to bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=300, bbox_inches='tight')
    plt.close()
    buf.seek(0)
    return buf

def generate_summary_report(insights, forecast_data, historical_data, output_path):
    """
    Generate a PDF summary report containing insights and forecast data.
    
    Args:
        insights (dict): Dictionary containing business insights
        forecast_data (dict): Dictionary containing forecast data
        historical_data (dict): Dictionary containing historical revenue data
        output_path (str): Path where the PDF should be saved
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Create custom styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30
    ))
    styles.add(ParagraphStyle(
        name='CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12
    ))
    
    # Build the document content
    story = []
    
    # Title
    story.append(Paragraph("Revenue Forecast Report", styles['CustomTitle']))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Executive Summary
    story.append(Paragraph("Executive Summary", styles['CustomHeading']))
    story.append(Paragraph(insights.get('summary', 'No summary available.'), styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Key Metrics
    story.append(Paragraph("Key Metrics", styles['CustomHeading']))
    metrics_data = [
        ["Metric", "Value"],
        ["Current Revenue", f"${insights.get('current_revenue', 0):,.2f}"],
        ["Growth Rate", f"{insights.get('growth_rate', 0):.1f}%"],
        ["Forecast Period", f"{len(forecast_data.get('forecast', []))} months"]
    ]
    
    metrics_table = Table(metrics_data, colWidths=[3*inch, 2*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 20))
    
    # Forecast Chart
    story.append(Paragraph("Forecast Visualization", styles['CustomHeading']))
    chart_buffer = create_forecast_chart(historical_data, forecast_data)
    img = Image(chart_buffer, width=6*inch, height=3*inch)
    story.append(img)
    story.append(Spacer(1, 20))
    
    # Detailed Forecast
    story.append(Paragraph("Detailed Forecast", styles['CustomHeading']))
    forecast_data_table = [["Month", "Forecast", "Lower Bound", "Upper Bound"]]
    for forecast in forecast_data.get('forecast', []):
        forecast_data_table.append([
            forecast['month'],
            f"${forecast['forecast']:,.2f}",
            f"${forecast['lower_bound']:,.2f}",
            f"${forecast['upper_bound']:,.2f}"
        ])
    
    forecast_table = Table(forecast_data_table, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    forecast_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(forecast_table)
    story.append(Spacer(1, 20))
    
    # Additional Insights
    if insights.get('additional_insights'):
        story.append(Paragraph("Additional Insights", styles['CustomHeading']))
        for insight in insights['additional_insights']:
            story.append(Paragraph(f"• {insight}", styles['Normal']))
            story.append(Spacer(1, 6))
    
    # Build the PDF
    doc.build(story)
    return output_path 