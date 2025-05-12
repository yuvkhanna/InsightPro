import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ data }) => {
  // Get months and revenue data, ensuring they're sorted chronologically
  const sortMonths = (monthsObj) => {
    return Object.keys(monthsObj).sort().map(month => ({
      month,
      revenue: monthsObj[month],
      growth: data.monthly_growth?.[month] || null
    }));
  };
  
  const sortedData = sortMonths(data.monthly_revenue);
  
  // Format month labels to be more readable (e.g., "Jan 2023" instead of "2023-01")
  const formatMonthLabel = (monthStr) => {
    try {
      const [year, month] = monthStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    } catch (e) {
      return monthStr;
    }
  };
  
  const months = sortedData.map(d => formatMonthLabel(d.month));
  const revenueValues = sortedData.map(d => d.revenue);
  const growthValues = sortedData.map(d => d.growth);
  
  const chartData = {
    labels: months,
    datasets: [
      {
        type: 'bar',
        label: 'Monthly Revenue',
        data: revenueValues,
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
            return `Revenue: $${value.toLocaleString()}`;
          },
          afterLabel: function(context) {
            const index = context.dataIndex;
            const growth = growthValues[index];
            return growth !== null ? `Growth: ${growth.toFixed(1)}%` : '';
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

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
      
      {/* Growth percentage labels */}
      <div className="mt-4 flex justify-around">
        {growthValues.map((growth, i) => (
          growth !== null ? (
            <div 
              key={i} 
              className={`text-xs font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {growth.toFixed(1)}%
            </div>
          ) : <div key={i} className="text-xs opacity-0">-</div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart; 