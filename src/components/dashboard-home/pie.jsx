"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PieStats = () => {
  const total = 100;
  const data = [
    { name: "New Users", value: 69 },
    { name: "Inactive", value: 31 },
  ];

  return (
    <div className=" rounded-lg p-4  w-[300px] h-[450px] flex flex-col items-center justify-center gap-10">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          {/* Main/Thicker Arc for New Users */}
          <Pie
            data={[data[0]]}
            dataKey="value"
            startAngle={90}
            endAngle={-270 + (360 * data[1].value) / total}
            innerRadius={60}
            outerRadius={85}
            cx={150}
            cy={90}
            stroke="none"
          >
            <Cell fill="#1B4AF0" />
          </Pie>

          {/* Thinner Arc for Inactive Users */}
          <Pie
            data={[data[1]]}
            dataKey="value"
            startAngle={-270 + (360 * data[1].value) / total}
            endAngle={-270}
            innerRadius={70}
            outerRadius={80}
            cx={150}
            cy={90}
            stroke="none"
          >
            <Cell fill="#E0E7FF" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 text-sm mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#1B4AF0]" />
          <span>New Users 69%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#E0E7FF]" />
          <span>Inactive 31%</span>
        </div>
      </div>
    </div>
  );
};

export default PieStats;
