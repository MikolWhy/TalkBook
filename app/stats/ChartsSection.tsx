"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart as BarChartIcon, Smile, Clock, Sunrise, Sun, Sunset, Moon } from "lucide-react";

interface ChartsSectionProps {
  activityOverTime: Array<{ date: string; entries: number; habits: number }>;
  moodPatternData: Array<{ mood: string; moodEmoji: string; count: number; fullMood: string }>;
  timeDistribution: Array<{ period: string; count: number }>;
  timeRange: number;
  MOOD_COLORS: Record<string, string>;
  COLORS: string[];
}

export default function ChartsSection({
  activityOverTime,
  moodPatternData,
  timeDistribution,
  timeRange,
  MOOD_COLORS,
  COLORS,
}: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Combined Activity */}
      {activityOverTime.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-blue-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500 p-3 rounded-xl">
              <BarChartIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Your Activity</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityOverTime}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
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
              <YAxis stroke="#6b7280" style={{ fontSize: "12px", fontWeight: "500" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#fff", 
                  border: "2px solid #3B82F6", 
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
                formatter={(value: any) => [value, ""]}
              />
              <Area type="monotone" dataKey="entries" stroke="#3B82F6" strokeWidth={3} fill="url(#colorEntries)" name="Journal Entries" />
              <Area type="monotone" dataKey="habits" stroke="#10B981" strokeWidth={3} fill="url(#colorHabits)" name="Habit Completions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mood Pattern (Pie Chart) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-amber-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-500 p-3 rounded-xl">
            <Smile className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Mood Pattern</h2>
        </div>
        {moodPatternData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
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
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-cyan-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-500 p-3 rounded-xl">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">When You Write</h2>
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

