
import React from 'react';
import { cn } from '@/lib/utils';
import { transactionCategoryStyles } from '@/constants';

const CategoryBadge = ({category}: CategoryBadgeProps) => {
  const {
    borderColor,
    backgroundColor,
    textColor,
    chipBackgroundColor
  } = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default;

  return (
    <div className={cn('category-badge', borderColor, chipBackgroundColor)}>
      <div className={cn('size-2 rounded-full', backgroundColor)}/>
      <p className={cn('text-[12px] font-medium', textColor)}>{category}</p>
    </div>
  );
};

export default CategoryBadge;