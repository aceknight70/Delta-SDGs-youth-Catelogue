import React from 'react';
import { cn } from '../lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollableTextBox({ children, className }: Props) {
  return (
    <div className={cn(
      "max-h-[150px] overflow-y-auto p-4 rounded-lg bg-[#f8f6f0] border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner",
      className
    )}>
      {children}
    </div>
  );
}
