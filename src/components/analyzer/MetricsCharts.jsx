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
    { name: 'Density (%)', val: metrics.vesselDensity, color: 'var(--teal-accent)' },
    { name: 'Branches', val: metrics.branchPoints, color: 'var(--pink-accent)' },
    { name: 'Segments', val: metrics.vesselSegments, color: 'var(--cyan-accent)' },
    { name: 'Endpoints', val: metrics.endpoints, color: 'var(--gold-accent)' },
    { name: 'Connect (%)', val: metrics.connectivity, color: 'var(--success-green)' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
      {/* Radar Chart */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '14px' }}>
          MICROVASCULAR NETWORK RADAR PROFILE
        </h4>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="var(--input-border)" />
              <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--input-border)" />
              <Radar name="Network Profile" dataKey="value" stroke="var(--teal-accent)" fill="var(--teal-accent)" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan-accent)', marginBottom: '14px' }}>
          QUANTITATIVE METRIC DISTRIBUTION
        </h4>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--teal-accent)', borderRadius: '8px', color: 'var(--text-primary)' }}
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
