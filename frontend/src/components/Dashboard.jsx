import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import RevenueChart from './RevenueChart';

const Dashboard = ({ data }) => {
  const handleDownloadPDF = () => {
    window.location.href = '/api/download-pdf';
  };

  return (
    <div className="dashboard">
      <Row className="mb-4">
        <Col md={4}>
          <Card className="metric-card">
            <Card.Body>
              <Card.Title>Total Revenue</Card.Title>
              <Card.Text className="metric-value">
                ${data.total_revenue.toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="metric-card">
            <Card.Body>
              <Card.Title>Average Order Value</Card.Title>
              <Card.Text className="metric-value">
                ${data.avg_order_value.toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="metric-card">
            <Card.Body>
              <Card.Title>Top Selling Product</Card.Title>
              <Card.Text className="metric-value">
                {data.top_product}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="chart-card">
            <Card.Body>
              <Card.Title>Monthly Revenue Trend</Card.Title>
              <RevenueChart data={data.monthly_revenue} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="action-card">
            <Card.Body>
              <Card.Title>Actions</Card.Title>
              <Button
                variant="primary"
                className="w-100 mb-2"
                onClick={handleDownloadPDF}
              >
                Download Report
              </Button>
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={() => window.location.reload()}
              >
                Upload New Data
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 