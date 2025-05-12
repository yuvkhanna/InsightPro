"""
Forecasting module for sales data analysis.
This module will contain functions for time series forecasting and trend analysis.
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import io
import base64

def generate_forecast(data, forecast_periods=12):
    """
    Generate sales forecasts for future periods.
    
    Args:
        data (dict): Dictionary containing processed sales data
        forecast_periods (int): Number of periods to forecast
        
    Returns:
        dict: Dictionary containing forecast data
    """
    # TODO: Implement forecasting logic
    # This could use libraries like statsmodels, prophet, or scikit-learn
    # for time series forecasting
    
    return {
        'forecast': {},
        'confidence_intervals': {},
        'model_metrics': {}
    }

def analyze_trends(data):
    """
    Analyze sales trends and patterns in the data.
    
    Args:
        data (dict): Dictionary containing processed sales data
        
    Returns:
        dict: Dictionary containing trend analysis results
    """
    # TODO: Implement trend analysis
    # This could include:
    # - Seasonality detection
    # - Trend direction and strength
    # - Anomaly detection
    # - Correlation analysis
    
    return {
        'trend_direction': None,
        'seasonality': None,
        'anomalies': [],
        'correlations': {}
    }

def generate_revenue_forecast(monthly_revenue, forecast_periods=2):
    """
    Generate revenue forecast using Linear Regression
    
    Args:
        monthly_revenue (dict): Dictionary of monthly revenue data (e.g., {'2023-01': 1000, '2023-02': 1200})
        forecast_periods (int): Number of months to forecast (default: 2)
    
    Returns:
        list: List of dictionaries containing forecasted months and values
        [
            {'month': '2024-01', 'forecast': 1500.0, 'lower_bound': 1400.0, 'upper_bound': 1600.0},
            {'month': '2024-02', 'forecast': 1550.0, 'lower_bound': 1450.0, 'upper_bound': 1650.0}
        ]
    """
    if not monthly_revenue or len(monthly_revenue) < 3:
        raise ValueError("Need at least 3 months of data for forecasting")
    
    # Sort months chronologically
    sorted_months = sorted(monthly_revenue.keys())
    sorted_values = [monthly_revenue[month] for month in sorted_months]
    
    # Convert months to numeric features (e.g., months since start)
    X = np.array(range(len(sorted_months))).reshape(-1, 1)
    y = np.array(sorted_values)
    
    # Fit linear regression model
    model = LinearRegression()
    model.fit(X, y)
    
    # Calculate prediction intervals (using standard error of regression)
    y_pred = model.predict(X)
    mse = np.mean((y - y_pred) ** 2)
    std_error = np.sqrt(mse)
    
    # Generate future months
    last_month = datetime.strptime(sorted_months[-1], '%Y-%m')
    future_months = []
    for i in range(1, forecast_periods + 1):
        next_month = last_month + timedelta(days=32)  # Add 32 days to ensure we move to next month
        next_month = next_month.replace(day=1)  # Set to first day of month
        future_months.append(next_month.strftime('%Y-%m'))
        last_month = next_month
    
    # Generate forecasts
    future_X = np.array(range(len(sorted_months), len(sorted_months) + forecast_periods)).reshape(-1, 1)
    forecasts = model.predict(future_X)
    
    # Calculate prediction intervals (95% confidence)
    z_score = 1.96  # 95% confidence interval
    margin = z_score * std_error
    
    # Format results
    forecast_results = []
    for month, forecast in zip(future_months, forecasts):
        forecast_results.append({
            'month': month,
            'forecast': round(float(forecast), 2),
            'lower_bound': round(float(forecast - margin), 2),
            'upper_bound': round(float(forecast + margin), 2)
        })
    
    return forecast_results

def generate_forecast_chart(monthly_revenue, forecast_data):
    """
    Generate a visualization of the revenue forecast with confidence intervals.
    
    Args:
        monthly_revenue (dict): Historical monthly revenue data
        forecast_data (list): List of forecast data points with confidence intervals
    
    Returns:
        str: Base64 encoded PNG image of the forecast chart
    """
    plt.figure(figsize=(12, 6))
    
    # Plot historical data
    months = list(monthly_revenue.keys())
    revenues = list(monthly_revenue.values())
    plt.plot(months, revenues, 'b-', label='Historical Revenue', marker='o')
    
    # Plot forecast
    forecast_months = [f['month'] for f in forecast_data]
    forecast_values = [f['forecast'] for f in forecast_data]
    lower_bounds = [f['lower_bound'] for f in forecast_data]
    upper_bounds = [f['upper_bound'] for f in forecast_data]
    
    # Plot forecast line
    plt.plot(forecast_months, forecast_values, 'r--', label='Forecast', marker='o')
    
    # Plot confidence intervals
    plt.fill_between(forecast_months, lower_bounds, upper_bounds, 
                    color='r', alpha=0.2, label='95% Confidence Interval')
    
    # Customize the chart
    plt.title('Revenue Forecast with Confidence Intervals')
    plt.xlabel('Month')
    plt.ylabel('Revenue')
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend()
    
    # Rotate x-axis labels for better readability
    plt.xticks(rotation=45)
    
    # Adjust layout to prevent label cutoff
    plt.tight_layout()
    
    # Save the plot to a bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=300, bbox_inches='tight')
    buf.seek(0)
    plt.close()
    
    # Convert to base64
    img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
    return img_str 