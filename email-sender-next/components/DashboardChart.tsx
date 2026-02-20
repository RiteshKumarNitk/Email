
"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';

export default function DashboardChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        api("/analytics/chart").then(setData).catch(console.error);
    }, []);

    // Helper to format date "2024-02-20" -> "Feb 20"
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (data.length === 0) {
        return <div className="h-[300px] w-full flex items-center justify-center text-gray-400">Loading chart data...</div>;
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(label) => formatDate(label)}
                    />
                    <Area
                        type="monotone"
                        dataKey="opens"
                        stackId="1"
                        stroke="#4F46E5"
                        fill="#4F46E5"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        name="Opens"
                    />
                    <Area
                        type="monotone"
                        dataKey="clicks"
                        stackId="1"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        name="Clicks"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
