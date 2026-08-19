import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import type { QuickAction as QuickActionType } from '../../types/hutRi';

interface QuickActionProps {
  action: QuickActionType;
}

const QuickAction: React.FC<QuickActionProps> = ({ action }) => {
  const navigate = useNavigate();

  const colorStyles: Record<string, string> = {
    red: 'from-red-500 to-red-600',
    navy: 'from-navy-700 to-navy-800',
    gold: 'from-yellow-500 to-amber-600',
    green: 'from-green-500 to-emerald-600',
  };

  return (
    <Card onClick={() => navigate(action.path)} className="text-center hover:transform hover:scale-105 transition-all duration-300">
      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${colorStyles[action.color] || colorStyles.red} flex items-center justify-center text-3xl text-white shadow-lg mb-4`}>
        {action.icon}
      </div>
      <h3 className="font-semibold text-navy-900 text-lg">{action.label}</h3>
    </Card>
  );
};

export default QuickAction;