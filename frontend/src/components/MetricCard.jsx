import React from 'react';

const MetricCard = ({ title, value, icon, color }) => {
  return (
    <div className="card card-hover p-4">
      <div className="flex items-center mb-3">
        <div className={`p-3 rounded-full ${color} text-white mr-3`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="metric-value">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard; 