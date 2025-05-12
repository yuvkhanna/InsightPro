import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiShoppingBag, 
  FiDownload,
  FiBarChart2,
  FiPieChart,
  FiInfo,
  FiTrendingDown,
  FiCalendar,
  FiAlertCircle
} from 'react-icons/fi';
import MetricCard from './MetricCard';
import RevenueChart from './RevenueChart';
import ProductChart from './ProductChart';
import ForecastChart from './ForecastChart';
import axios from 'axios';

const Dashboard = ({ data = {} }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    avg_order_value: 0,
    top_product: 'None',
    monthly_revenue: {},
    monthly_growth: {},
    product_revenue: {}
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch metrics
        const metricsResponse = await axios.get('/api/data/metrics');
        if (metricsResponse.data) {
          setMetrics(metricsResponse.data);
        }

        // Fetch insights
        const insightsResponse = await axios.get('/api/insights');
        if (insightsResponse.data.status === 'success') {
          setInsights(insightsResponse.data.insights);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadPDF = () => {
    window.location.href = '/api/download-pdf';
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export-csv';
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      
      // Fetch all necessary data
      const [forecastResponse, metricsResponse] = await Promise.all([
        axios.get('/api/forecast'),
        axios.get('/api/data/metrics')
      ]);

      if (forecastResponse.data.status !== 'success' || !metricsResponse.data) {
        throw new Error('Failed to fetch data for report generation');
      }

      // Prepare the data for the report
      const reportData = {
        insights: {
          summary: 'Revenue forecast analysis based on historical data and current trends',
          current_revenue: metricsResponse.data.current_revenue || 0,
          growth_rate: metricsResponse.data.growth_rate || 0,
          additional_insights: metricsResponse.data.insights || []
        },
        forecast_data: forecastResponse.data,
        historical_data: metricsResponse.data.monthly_revenue || {}
      };

      // Generate the report
      const response = await axios.post('/api/generate-report', reportData, {
        responseType: 'blob' // Important for file download
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenue_forecast_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating report:', error);
      // You might want to show an error message to the user here
    } finally {
      setGeneratingReport(false);
    }
  };

  // Calculate the average monthly growth percentage
  const growthValues = Object.values(metrics.monthly_growth || {});
  const avgGrowth = growthValues.length 
    ? growthValues.reduce((sum, val) => sum + val, 0) / growthValues.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Revenue"
          value={`$${metrics.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<FiDollarSign />}
          color="bg-blue-500"
        />
        
        <MetricCard 
          title="Average Order Value"
          value={`$${metrics.avg_order_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<FiShoppingBag />}
          color="bg-purple-500"
        />
        
        <MetricCard 
          title="Top Product"
          value={metrics.top_product}
          icon={<FiShoppingBag />}
          color="bg-green-500"
        />
        
        <MetricCard 
          title="Avg. Monthly Growth"
          value={`${avgGrowth.toFixed(2)}%`}
          icon={<FiTrendingUp />}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <FiBarChart2 className="text-primary-500 mr-2" />
                <h3 className="font-bold text-lg">Monthly Revenue Trend</h3>
              </div>
              <div className="tooltip-container relative group">
                <FiInfo className="text-gray-400 cursor-help" />
                <div className="tooltip-content invisible group-hover:visible absolute right-0 top-full mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg w-48 z-10">
                  Monthly revenue with growth percentage compared to previous month
                </div>
              </div>
            </div>
            <RevenueChart data={metrics} />
          </div>

          {/* Add Forecast Chart */}
          <div className="card p-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <FiTrendingUp className="text-primary-500 mr-2" />
                <h3 className="font-bold text-lg">Revenue Forecast</h3>
              </div>
              <div className="tooltip-container relative group">
                <FiInfo className="text-gray-400 cursor-help" />
                <div className="tooltip-content invisible group-hover:visible absolute right-0 top-full mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg w-48 z-10">
                  Revenue forecast with 95% confidence interval for the next 2 months
                </div>
              </div>
            </div>
            <ForecastChart />
          </div>
        </div>
        
        <div>
          <div className="card p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <FiPieChart className="text-primary-500 mr-2" />
                <h3 className="font-bold text-lg">Revenue by Product</h3>
              </div>
            </div>
            <ProductChart data={metrics.product_revenue} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <FiTrendingUp className="text-green-500 text-xl mr-2" />
            <h3 className="text-lg font-bold">📈 Growth Insights</h3>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading insights...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : insights ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Growth</span>
                <span className={`text-lg font-semibold ${insights.total_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {insights.total_growth.toFixed(1)}%
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Top Growing Products</h4>
                <div className="space-y-2">
                  {insights.top_growing_products?.map((product, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{product.product}</span>
                      <span className="text-green-500 font-medium">+{product.growth.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No insights available</div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <FiDollarSign className="text-blue-500 text-xl mr-2" />
            <h3 className="text-lg font-bold">📊 Sales Summary</h3>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading insights...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : insights ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Biggest Sales Day</span>
                <div className="text-right">
                  <div className="font-medium">{insights.biggest_sales_day?.date || 'N/A'}</div>
                  <div className="text-blue-500">
                    ${insights.biggest_sales_day?.revenue?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Recent Revenue Trend</h4>
                <div className="space-y-2">
                  {insights.revenue_trend?.slice(-3).map((trend, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{trend.month}</span>
                      <span className="font-medium">${trend.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No sales summary available</div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <FiAlertCircle className="text-yellow-500 text-xl mr-2" />
            <h3 className="text-lg font-bold">🧠 Smart Tips</h3>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading insights...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : insights?.smart_tip ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">{insights.smart_tip}</p>
            </div>
          ) : (
            <div className="text-gray-500">No smart tips available</div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <FiTrendingDown className="text-red-500 text-xl mr-2" />
            <h3 className="text-lg font-bold">📉 Declining Products</h3>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading insights...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : insights?.top_declining_products?.length > 0 ? (
            <div className="space-y-2">
              {insights.top_declining_products.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{product.product}</span>
                  <span className="text-red-500 font-medium">{product.growth.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No declining products found</div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleGenerateReport}
          disabled={generatingReport}
          className="btn btn-primary flex-1 flex items-center justify-center"
        >
          {generatingReport ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Report...
            </span>
          ) : (
            <>
              <FiDownload className="mr-2" />
              Generate Full Report
            </>
          )}
        </button>
        
        <button
          onClick={handleExportCSV}
          className="btn btn-secondary flex-1 flex items-center justify-center"
        >
          <FiDownload className="mr-2" />
          Export Data as CSV
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 