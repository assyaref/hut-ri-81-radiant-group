import React from 'react';
import Card from '../ui/Card';
import type { Statistic } from '../../types/hutRi';

interface StatCardProps {
  stat: Statistic;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  return (
    <Card className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl text-white shadow-lg">
        {stat.icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
        <p className="text-3xl font-bold text-navy-900">
          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
        </p>
      </div>
    </Card>
  );
};

export default StatCard;