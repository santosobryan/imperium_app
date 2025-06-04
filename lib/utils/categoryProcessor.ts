import { CATEGORY_MAPPINGS} from '../../constants/index';

/**
 * Maps Plaid's personal_finance_category to user-friendly category names
 */
export const mapTransactionCategory = (personalFinanceCategory?: {
  primary?: string;
  detailed?: string;
  confidence_level?: string;
}): string => {
  if (!personalFinanceCategory?.primary) {
    return '';
  }

  const { primary } = personalFinanceCategory;

  // Check if we have a mapping for this primary category
  if (CATEGORY_MAPPINGS[primary]) {
    return CATEGORY_MAPPINGS[primary];
  }

  // If no mapping found, return the primary category in title case
  return toTitleCase(primary.replace(/_/g, ' '));
};

/**
 * Converts snake_case to Title Case
 */
function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}