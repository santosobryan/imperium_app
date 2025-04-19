// Mock transactions for testing purposes
// This file provides mock data and utilities for simulating transactions
// without relying on the Plaid API

export interface MockTransaction {
  id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  category: string[];
  pending: boolean;
  payment_channel: string;
  merchant_name?: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
}

// Generate a random transaction ID
const generateTransactionId = () => {
  return 'tx_' + Math.random().toString(36).substring(2, 15);
};

// Get a random date within the last 30 days
const getRandomRecentDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

// Sample categories for mock transactions
const transactionCategories = [
  ['Food and Drink', 'Restaurants'],
  ['Shops', 'Grocery'],
  ['Transportation', 'Uber'],
  ['Recreation', 'Movies'],
  ['Service', 'Subscription'],
  ['Payment', 'Credit Card'],
  ['Transfer', 'Deposit'],
  ['Transfer', 'Withdrawal']
];

// Sample merchant names
const merchantNames = [
  'Amazon',
  'Walmart',
  'Target',
  'Starbucks',
  'Netflix',
  'Uber',
  'Spotify',
  'Kroger',
  'Shell',
  'Apple'
];

// Generate a set of mock transactions for a given account
export const generateMockTransactions = (accountId: string, count: number = 15): MockTransaction[] => {
  const transactions: MockTransaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const isDeposit = Math.random() > 0.7;
    const category = transactionCategories[Math.floor(Math.random() * transactionCategories.length)];
    const merchantName = merchantNames[Math.floor(Math.random() * merchantNames.length)];
    
    transactions.push({
      id: generateTransactionId(),
      account_id: accountId,
      amount: isDeposit ? 
        parseFloat((Math.random() * 500 + 100).toFixed(2)) : 
        parseFloat((-1 * (Math.random() * 200 + 10)).toFixed(2)),
      date: getRandomRecentDate(),
      name: `${isDeposit ? 'Deposit from' : 'Payment to'} ${merchantName}`,
      category,
      pending: Math.random() > 0.9, // 10% chance of being pending
      payment_channel: Math.random() > 0.5 ? 'online' : 'in store',
      merchant_name: merchantName,
      location: {
        city: 'New York',
        region: 'NY',
        country: 'US'
      }
    });
  }
  
  // Sort transactions by date (newest first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Mock function to create a new transaction
export const createMockTransaction = (
  accountId: string, 
  amount: number, 
  name: string, 
  category?: string[]
): MockTransaction => {
  return {
    id: generateTransactionId(),
    account_id: accountId,
    amount,
    date: new Date().toISOString().split('T')[0],
    name,
    category: category || ['Transfer', amount > 0 ? 'Deposit' : 'Payment'],
    pending: true,
    payment_channel: 'online',
    merchant_name: name.includes('to') ? name.split('to ')[1] : undefined
  };
};

// Get transactions for a specific account
export const getMockTransactionsForAccount = (transactions: MockTransaction[], accountId: string) => {
  return transactions.filter(transaction => transaction.account_id === accountId);
};

// Default set of mock transactions to use throughout the app
export const defaultMockTransactions: MockTransaction[] = [
  // These will be merged with generated transactions
  {
    id: 'tx_default_salary',
    account_id: 'default_checking',
    amount: 2500,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'DIRECT DEPOSIT - ACME CORP',
    category: ['Income', 'Salary'],
    pending: false,
    payment_channel: 'online',
    merchant_name: 'ACME CORP'
  },
  {
    id: 'tx_default_rent',
    account_id: 'default_checking',
    amount: -1500,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Payment to APARTMENTS LLC',
    category: ['Housing', 'Rent'],
    pending: false,
    payment_channel: 'online',
    merchant_name: 'APARTMENTS LLC'
  }
]; 