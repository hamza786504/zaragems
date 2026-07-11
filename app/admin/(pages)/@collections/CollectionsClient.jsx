'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function CollectionsClient({ categoryData }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant p-3 md:p-lg shadow-sm">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h6 className="font-headline-md text-headline-md text-on-surface">Products by Collection</h6>
          <p className="text-body-sm text-on-surface-variant">Inventory share distribution</p>
        </div>
      </div>
      <div className="h-64 flex flex-col justify-between">
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#bdbdbd'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
