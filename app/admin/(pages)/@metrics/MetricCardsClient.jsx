'use client';

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, MousePointerClick } from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer
} from 'recharts';

const iconMap = {
  dollar: DollarSign,
  cart: ShoppingCart,
  users: Users,
  click: MousePointerClick,
};

export default function MetricCardsClient({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-md">
      {cards.map((card) => {
        const Icon = iconMap[card.iconKey] || DollarSign;
        return (
          <div key={card.title} className="bg-white p-3 md:p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-md">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">{card.title}</p>
                <h5 className="font-headline-lg text-headline-lg text-on-surface mt-xs">{card.value}</h5>
                <p className="text-body-sm text-on-surface-variant mt-xs">{card.subtitle}</p>
              </div>
              <div className={`p-sm rounded-lg ${card.bgColor} ${card.textColor}`}>
                <Icon size={20} />
              </div>
            </div>
            <div className="flex items-center gap-xs">
              {card.positive ? <TrendingUp size={16} className="text-primary" /> : <TrendingDown size={16} className="text-error" />}
              <span className={`font-label-md ${card.positive ? 'text-primary' : 'text-error'}`}>
                {card.change >= 0 ? '+' : ''}{card.change}%
              </span>
              <span className="text-on-surface-variant text-body-sm ml-xs">vs last 30 days</span>
            </div>
            <div className="mt-lg h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.sparkData.length > 0 ? card.sparkData.slice(-8) : []}>
                  <defs>
                    <linearGradient id={`grad-${card.title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={card.positive ? '#006c50' : '#ba1a1a'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={card.positive ? '#006c50' : '#ba1a1a'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone" dataKey="sales"
                    stroke={card.positive ? '#006c50' : '#ba1a1a'}
                    fill={`url(#grad-${card.title.replace(/\s/g, '')})`}
                    strokeWidth={2} dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
