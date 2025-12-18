"use client";

/**
 * Charts Section Component
 * 
 * Comprehensive data visualization suite for the stats page.
 * Displays journal activity, mood trends, and writing patterns.
 * 
 * Features:
 * - Journal & Habit Activity (area chart)
 * - Mood Timeline (line chart with emoji Y-axis)
 * - Mood Distribution (pie chart)
 * - Writing Time Distribution (bar chart with time-of-day icons)
 * - Responsive design with consistent styling
 * - Dynamic chart scaling based on time range
 * 
 * @module src/components/features/stats/ChartsSection.tsx
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart as BarChartIcon, Smile, Clock, Sunrise, Sun, Sunset, Moon, TrendingUp } from "lucide-react";

interface ChartsSectionProps {
  activityOverTime: Array<{ date: string; entries: number; habits: number }>;
  moodPatternData: Array<{ mood: string; moodEmoji: string; count: number; fullMood: string }>;
  moodTimelineData: Array<{ entryIndex: number; date: string; timestamp: number; moodScore: number; moodLabel: string; fullDate: string }>;
  timeDistribution: Array<{ period: string; count: number }>;
  timeRange: number;
  MOOD_COLORS: Record<string, string>;
  COLORS: string[];
}

export default function ChartsSection({
  activityOverTime,
  moodPatternData,
  moodTimelineData,
  timeDistribution,
  timeRange,
  MOOD_COLORS,
  COLORS,
}: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Journal Activity */}
      {activityOverTime.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-xl border-2 border-blue-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500 p-3 rounded-xl">
              <BarChartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Journal & Habit Activity</h2>
              <p className="text-sm text-gray-600">Track your daily entries and habit completions</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityOverTime}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: timeRange > 30 ? "10px" : "12px", fontWeight: "500" }}
                angle={timeRange > 30 ? -45 : 0}
                textAnchor={timeRange > 30 ? "end" : "middle"}
                height={timeRange > 30 ? 60 : 30}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px", fontWeight: "500" }}
                allowDecimals={false}
                domain={[0, 'dataMax']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #3B82F6",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
                formatter={(value: any) => [value, ""]}
              />
              <Legend verticalAlign="top" height={40} />
              <Area type="monotone" dataKey="entries" stroke="#3B82F6" strokeWidth={3} fill="url(#colorEntries)" name="Journal Entries" />
              <Area type="monotone" dataKey="habits" stroke="#10B981" strokeWidth={3} fill="url(#colorHabits)" name="Habit Completions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mood Timeline */}
      {moodTimelineData.length > 0 && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 shadow-xl border-2 border-rose-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-500 p-3 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mood Trends Over Time</h2>
              <p className="text-sm text-gray-600">See how your emotional state changes day by day</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart 
              data={moodTimelineData}
              margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
            >
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="entryIndex"
                type="number"
                domain={['dataMin', 'dataMax']}
                stroke="#6b7280"
                style={{ fontSize: timeRange > 30 ? "9px" : timeRange > 7 ? "10px" : "11px", fontWeight: "500" }}
                angle={moodTimelineData.length > 15 ? -45 : 0}
                textAnchor={moodTimelineData.length > 15 ? "end" : "middle"}
                height={moodTimelineData.length > 15 ? 80 : 50}
                tickFormatter={(value, index) => {
                  // Find the corresponding entry for this index
                  const entry = moodTimelineData.find(e => e.entryIndex === value);
                  if (!entry) return String(value);
                  
                  const date = new Date(entry.timestamp);
                  if (timeRange <= 7) {
                    return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
                  } else if (timeRange <= 30) {
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric" });
                  } else {
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }
                }}
                interval={moodTimelineData.length > 20 ? Math.ceil(moodTimelineData.length / 10) : 0}
                label={{ value: 'Entry Order', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6b7280' } }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px", fontWeight: "500" }}
                domain={[0, 8]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8]}
                interval={0}
                tickFormatter={(value) => {
                  const labels: Record<number, string> = {
                    0: "😭", // Very Sad
                    1: "😢", // Sad
                    2: "😠", // Angry
                    3: "😰", // Anxious
                    4: "😐", // Neutral
                    5: "😌", // Calm
                    6: "😊", // Happy
                    7: "😄", // Very Happy
                    8: "🤩" // Excited
                  };
                  return labels[Math.round(value)] || "";
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #F43F5E",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
                formatter={(value: any, name: string, props: any) => {
                  return [props.payload.moodLabel, "Mood"];
                }}
                labelFormatter={(value) => {
                  if (!value) return '';
                  // Find the entry by entryIndex
                  const entry = moodTimelineData.find(e => e.entryIndex === value);
                  if (!entry) return `Entry ${value}`;
                  const date = new Date(entry.timestamp);
                  return date.toLocaleString("en-US", { 
                    weekday: "long",
                    year: "numeric",
                    month: "long", 
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  });
                }}
              />
              <Legend verticalAlign="top" height={40} />
              <Line
                type="linear"
                dataKey="moodScore"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={{ fill: "#F43F5E", r: moodTimelineData.length > 50 ? 4 : 5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: "#fff" }}
                name="Mood"
                connectNulls={false}
                isAnimationActive={moodTimelineData.length < 100}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mood Pattern (Pie Chart) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-xl border-2 border-amber-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-500 p-3 rounded-xl">
            <Smile className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mood Distribution</h2>
            <p className="text-sm text-gray-600">Your emotional landscape</p>
          </div>
        </div>
        {moodPatternData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={moodPatternData}
                dataKey="count"
                nameKey="moodEmoji"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry: any) => `${entry.moodEmoji} ${entry.count}`}
                labelLine={false}
                strokeWidth={3}
                stroke="#fff"
              >
                {moodPatternData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.fullMood] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #F59E0B",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
                formatter={(value: any, name: string, props: any) => {
                  return [`${value} entries`, `${props.payload.moodEmoji} ${props.payload.fullMood}`];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            <p className="text-center">No mood data yet. Start writing entries to see your mood pattern!</p>
          </div>
        )}
      </div>

      {/* Writing Time Distribution */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-xl border-2 border-cyan-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-500 p-3 rounded-xl">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">When You Write</h2>
            <p className="text-sm text-gray-600">Your journaling schedule</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="period"
              stroke="#6b7280"
              style={{ fontSize: "12px", fontWeight: "500" }}
              height={50}
              tick={(props: any) => {
                const { x, y, payload } = props;
                const IconComponent =
                  payload.value === "Morning" ? Sunrise :
                    payload.value === "Afternoon" ? Sun :
                      payload.value === "Evening" ? Sunset :
                        payload.value === "Night" ? Moon : null;

                return (
                  <g transform={`translate(${x},${y})`}>
                    {IconComponent && (
                      <foreignObject x={-10} y={-6} width={20} height={20} className="overflow-visible">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                          <IconComponent size={16} style={{ color: '#6b7280' }} />
                        </div>
                      </foreignObject>
                    )}
                    <text x={0} y={0} dy={28} textAnchor="middle" fill="#6b7280" style={{ fontSize: "12px", fontWeight: "500" }}>
                      {payload.value}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px", fontWeight: "500" }}
              allowDecimals={false}
              domain={[0, 'dataMax']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "2px solid #06B6D4",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}
              formatter={(value: any) => [`${value} entries`, ""]}
            />
            <Bar dataKey="count" fill="#06B6D4" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

