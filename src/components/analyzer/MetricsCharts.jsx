import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function MetricsCharts({ metrics }) {
  if (!metrics) return null;

  // Normalized values (0-100 scale) for Radar chart
  const radarData = [
    { subject: 'Vessel Density', value: Math.min(100, metrics.vesselDensity * 2) },
    { subject: 'Branching', value: Math.min(100, metrics.branchPoints * 4) },
    { subject: 'Segments', value: Math.min(100, metrics.vesselSegments * 3) },
    { subject: 'Avg Width', value: Math.min(100, metrics.avgWidth * 12) },
    { subject: 'Connectivity', value: Math.min(100, metrics.connectivity) },
    { subject: 'Lacunarity', value: Math.min(100, (metrics.lacunarity - 1) * 20) }
  ];

  // Bar chart data for quantitative stats comparison
  const barData = [
    { name: 'Density (%)', val: metrics.vesselDensity, color: '#00D4AA' },
    { name: 'Branches', val: metrics.branchPoints, color: '#F472B6' },
    { name: 'Segments', val: metrics.vesselSegments, color: '#00B4D8' },
    { name: 'Endpoints', val: metrics.endpoints, color: '#FBBF24' },
    { name: 'Connect (%)', val: metrics.connectivity, color: '#10B981' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
      {/* Radar Chart */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#00D4AA', marginBottom: '14px' }}>
          MICROVASCULAR NETWORK RADAR PROFILE
        </h4>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
              <PolarAngleAxis dataKey="subject" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.2)" />
              <Radar name="Network Profile" dataKey="value" stroke="#00D4AA" fill="#00D4AA" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#00B4D8', marginBottom: '14px' }}>
          QUANTITATIVE METRIC DISTRIBUTION
        </h4>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#00D4AA', borderRadius: '8px', color: '#F8FAFC' }}
              />
              <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
