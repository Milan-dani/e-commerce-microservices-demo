"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../apiClient';

interface Metric {
  name: string;
  value: number;
  updated: string;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/analytics/metrics')
      .then(data => {
        setMetrics(data);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ padding: 32 }}>
      <h1>Analytics Dashboard</h1>
      {loading ? (
        <p>Loading metrics...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Metric</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Value</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.name}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{metric.name}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{metric.value}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(metric.updated).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default Dashboard;
