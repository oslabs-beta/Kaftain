import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

type LagPoint = { timestamp: number; lag: number };
type Series = { groupName: string; topic: string; data: LagPoint[]; peakPercentage?: number };

interface Props {
  series: Series[];
  timeRange: '1h' | '6h' | '24h';
  onTimeRangeChange: (range: '1h' | '6h' | '24h') => void;
}

// Array of colors for different series
const COLORS = [
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#FBBE24', // violet-500
  '#EC4899', // pink-500
  '#F59E0B', // amber-500
];

const formatTooltipTimestamp = (timestamp: number) => {
  return format(new Date(timestamp), 'MMM d, HH:mm:ss');
};

const formatXAxisTimestamp = (timestamp: number) => {
  return format(new Date(timestamp), 'HH:mm');
};

const formatLagValue = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export default function LagTimeline({ series, timeRange, onTimeRangeChange }: Props) {
  if (!series.length) {
    return (
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col items-center justify-center py-12 text-white/70">
          <p className="text-lg mb-2">No lag data available</p>
          <p className="text-sm">Consumer groups will appear here when data is available</p>
        </div>
      </div>
    );
  }

  // Combine all series data for the chart
  const chartData = series[0].data.map((point) => {
    const dataPoint: any = { timestamp: point.timestamp };
    series.forEach((s, index) => {
      const matchingPoint = s.data.find(p => p.timestamp === point.timestamp);
      dataPoint[s.groupName] = matchingPoint?.lag || 0;
    });
    return dataPoint;
  });

  // Calculate vertical line positions for each series' peak
  const verticalLines = series
    .filter(s => s.peakPercentage !== undefined)
    .map(s => {
      const peakIndex = Math.floor(s.data.length * s.peakPercentage!);
      return {
        groupName: s.groupName,
        timestamp: s.data[peakIndex]?.timestamp,
        color: COLORS[series.indexOf(s) % COLORS.length]
      };
    })
    .filter(line => line.timestamp !== undefined);

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Consumer Group Lag</h2>
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
          {(['1h', '6h', '24h'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 rounded-md transition-all ${
                timeRange === range
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxisTimestamp}
              stroke="rgba(255,255,255,0.5)"
            />
            <YAxis
              tickFormatter={formatLagValue}
              stroke="rgba(255,255,255,0.5)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.5rem',
              }}
              labelFormatter={formatTooltipTimestamp}
              formatter={(value: number, name: string) => [
                formatLagValue(value),
                series.find(s => s.groupName === name)?.topic || name
              ]}
            />
            <Legend
              formatter={(value) => {
                const s = series.find(s => s.groupName === value);
                return s ? `${s.groupName} (${s.topic})` : value;
              }}
              wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}
            />
            {series.map((s, index) => (
              <Line
                key={s.groupName}
                type="monotone"
                dataKey={s.groupName}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
            {verticalLines.map((line) => (
              <ReferenceLine
                key={`ref-${line.groupName}`}
                x={line.timestamp}
                stroke={line.color}
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                label={{
                  value: 'Scaling',
                  position: 'insideTopRight',
                  offset: 10,
                  style: { fill: line.color, fontSize: 11, fontWeight: 'bold' }
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}