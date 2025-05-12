import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProductChart = ({ data }) => {
  // Normalize and consolidate product data to prevent duplicates
  const normalizeProductData = (productData) => {
    const normalizedData = {};
    
    // Combine revenue for products with similar names (case insensitive)
    Object.entries(productData).forEach(([product, revenue]) => {
      // Normalize product name: trim, convert to title case
      const normalizedName = product.trim().replace(/\s+/g, ' ');
      
      if (normalizedName in normalizedData) {
        normalizedData[normalizedName] += revenue;
      } else {
        normalizedData[normalizedName] = revenue;
      }
    });
    
    return normalizedData;
  };
  
  // Normalize the data to prevent duplicates
  const normalizedData = normalizeProductData(data);
  
  // Sort products by revenue (highest first) for better visualization
  const sortedItems = Object.entries(normalizedData).sort((a, b) => b[1] - a[1]);
  const labels = sortedItems.map(item => item[0]);
  const values = sortedItems.map(item => item[1]);
  
  // Generate colors for each product
  const generateColors = (count) => {
    const baseColors = [
      'rgba(14, 165, 233, 0.7)', // blue
      'rgba(124, 58, 237, 0.7)', // purple
      'rgba(34, 197, 94, 0.7)',  // green
      'rgba(234, 179, 8, 0.7)',  // yellow
      'rgba(239, 68, 68, 0.7)',  // red
      'rgba(249, 115, 22, 0.7)', // orange
    ];
    
    const colors = [];
    const borderColors = [];
    
    for (let i = 0; i < count; i++) {
      const baseColor = baseColors[i % baseColors.length];
      colors.push(baseColor);
      borderColors.push(baseColor.replace('0.7', '1'));
    }
    
    return { colors, borderColors };
  };
  
  const { colors, borderColors } = generateColors(labels.length);
  
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          // Limit number of items in legend if there are many products
          filter: (legendItem, data) => {
            // Only show top 10 products in legend if there are more than 10
            if (data.labels.length > 10) {
              return legendItem.index < 10;
            }
            return true;
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const label = context.label || '';
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
  };

  return (
    <div className="h-60">
      {labels.length > 0 ? (
        <Doughnut data={chartData} options={options} />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          No product data available
        </div>
      )}
    </div>
  );
};

export default ProductChart; 