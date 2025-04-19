import { useEffect, useState } from 'react';
import { 
  MockTransaction, 
  defaultMockTransactions, 
  generateMockTransactions,
  createMockTransaction
} from '@/utils/mockTransactions';

export type TransactionType = 'all' | 'credit' | 'debit';

interface UseMockTransactionsProps {
  accountId?: string;
  initialTransactions?: MockTransaction[];
  transactionType?: TransactionType;
}

// Convert MockTransaction to the format expected by the application
const convertToAppTransaction = (transaction: MockTransaction): any => {
  return {
    id: transaction.id,
    name: transaction.name,
    paymentChannel: transaction.payment_channel,
    type: transaction.amount > 0 ? 'credit' : 'debit',
    accountId: transaction.account_id,
    amount: Math.abs(transaction.amount), // Make amount positive, use type to determine debit/credit
    pending: transaction.pending,
    category: transaction.category ? transaction.category[0] : "",
    date: transaction.date,
    image: null, // Mock transactions don't have images
  };
};

export const useMockTransactions = ({
  accountId = 'default_checking',
  initialTransactions = [], 
  transactionType = 'all'
}: UseMockTransactionsProps = {}) => {
  // State to store the transactions
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize transactions
  useEffect(() => {
    const initTransactions = async () => {
      try {
        setIsLoading(true);
        
        // Start with default transactions
        let mockTransactions = [...defaultMockTransactions];
        
        // Add any initial transactions passed in
        if (initialTransactions.length > 0) {
          mockTransactions = [...mockTransactions, ...initialTransactions];
        }
        
        // If we don't have enough transactions, generate more random ones
        if (mockTransactions.length < 10) {
          const generatedTransactions = generateMockTransactions(accountId, 15);
          mockTransactions = [...mockTransactions, ...generatedTransactions];
        }
        
        // Filter by accountId if provided
        if (accountId) {
          mockTransactions = mockTransactions.filter(
            transaction => transaction.account_id === accountId
          );
        }
        
        // Sort by date (newest first)
        mockTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setTransactions(mockTransactions);
      } catch (err) {
        setError('Error loading mock transactions');
        console.error('Error in useMockTransactions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initTransactions();
  }, [accountId, initialTransactions]);
  
  // Filter transactions based on transaction type
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionType === 'all') return true;
    if (transactionType === 'credit') return transaction.amount > 0;
    if (transactionType === 'debit') return transaction.amount < 0;
    return true;
  });
  
  // Add a new transaction
  const addTransaction = (
    amount: number, 
    name: string,
    category?: string[]
  ) => {
    const newTransaction = createMockTransaction(accountId, amount, name, category);
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };
  
  // Get transactions in the format expected by the app components
  const getAppTransactions = () => {
    return filteredTransactions.map(convertToAppTransaction);
  };
  
  return {
    transactions: filteredTransactions,
    appTransactions: getAppTransactions(),
    isLoading,
    error,
    addTransaction
  };
}; 