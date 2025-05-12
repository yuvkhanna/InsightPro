import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ForecastChart = () => {
  // All hooks must be at the top level
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState({});

  // Fetch forecast data
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await axios.get('/api/forecast');
        if (response.data.status === 'success') {
          setForecastData(response.data);
        } else {
          setError(response.data.error || 'Failed to fetch forecast data');
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch forecast data');
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get('/api/data/metrics');
        if (response.data) {
          setHistoricalData(response.data.monthly_revenue || {});
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
      }
    };

    fetchHistoricalData();
  }, []);

  // Format month labels to be more readable
  const formatMonthLabel = (monthStr) => {
    try {
      const [year, month] = monthStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    } catch (e) {
      return monthStr;
    }
  };

  // Prepare data for the chart
  const historicalMonths = Object.keys(historicalData).sort();
  const historicalValues = historicalMonths.map(month => historicalData[month]);
  const forecastMonths = forecastData?.forecast?.map(f => f.month) || [];
  const forecastValues = forecastData?.forecast?.map(f => f.forecast) || [];
  const lowerBounds = forecastData?.forecast?.map(f => f.lower_bound) || [];
  const upperBounds = forecastData?.forecast?.map(f => f.upper_bound) || [];

  const chartData = {
    labels: [...historicalMonths, ...forecastMonths].map(formatMonthLabel),
    datasets: [
      {
        label: 'Historical Revenue',
        data: [...historicalValues, ...Array(forecastMonths.length).fill(null)],
        borderColor: 'rgba(14, 165, 233, 1)', // blue
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: false
      },
      {
        label: 'Forecast',
        data: [...Array(historicalMonths.length).fill(null), ...forecastValues],
        borderColor: 'rgba(239, 68, 68, 1)', // red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: false
      },
      {
        label: '95% Confidence Interval',
        data: [...Array(historicalMonths.length).fill(null), ...upperBounds],
        borderColor: 'rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 0,
        pointRadius: 0,
        fill: '+1',
        tension: 0.1
      },
      {
        label: '',
        data: [...Array(historicalMonths.length).fill(null), ...lowerBounds],
        borderColor: 'rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 0,
        pointRadius: 0,
        fill: false,
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            if (value === null) return null;
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [2, 4],
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-gray-500">Loading forecast data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!forecastData?.forecast || !historicalMonths.length) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-gray-500">No forecast data available</div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ForecastChart; 