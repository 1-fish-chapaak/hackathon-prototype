import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface KpiCardProps {
  value: string;
  groupingBy?: string;
  label?: string;
  trendValue?: string;
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function KpiCard({ 
  value, 
  groupingBy,
  label, 
  trendValue = "12%", 
  trendLabel = "vs last month", 
  trendDirection = 'up',
  color = "#26064A"
}: KpiCardProps) {
  const displayLabel = groupingBy || label || "Metric";
  
  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl p-6 relative overflow-hidden">
      {/* Label - Fixed at top */}
      <div className="shrink-0 mb-4">
        <div className="font-normal text-[14px] text-[#26064a]">{displayLabel}</div>
      </div>
      
      {/* Value - Large display */}
      <div className="flex-1 flex items-start min-h-0">
        <span className="leading-none font-bold tracking-tight text-[32px]" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  );
}