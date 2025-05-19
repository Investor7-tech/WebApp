// Currency conversion rates (as of 2025)
const conversionRates: Record<string, Record<string, number>> = {
  'GHS': {
    'USD': 0.083,
    'EUR': 0.076,
    'GBP': 0.065,
    'GHS': 1
  },
  'USD': {
    'GHS': 12.05,
    'EUR': 0.92,
    'GBP': 0.79,
    'USD': 1
  },
  'EUR': {
    'GHS': 13.16,
    'USD': 1.09,
    'GBP': 0.86,
    'EUR': 1
  },
  'GBP': {
    'GHS': 15.38,
    'USD': 1.27,
    'EUR': 1.17,
    'GBP': 1
  }
};

const currencySymbols: Record<string, string> = {
  'GHS': '₵',
  'USD': '$',
  'EUR': '€',
  'GBP': '£'
};

export const formatCurrency = (amount: number, targetCurrency: string = 'GHS', sourceCurrency: string = 'GHS'): string => {
  // Convert amount to target currency
  const rate = conversionRates[sourceCurrency][targetCurrency] || 1;
  const convertedAmount = amount * rate;

  // Format with the appropriate currency symbol
  const symbol = currencySymbols[targetCurrency] || targetCurrency;
  
  return `${symbol}${convertedAmount.toFixed(2)}`;
};