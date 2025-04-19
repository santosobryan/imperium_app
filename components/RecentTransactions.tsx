import Link from 'next/link'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankTabItem } from './BankTabItem';
import BankInfo from './BankInfo';
import TransactionsTable from './TransactionsTable';
import { Pagination } from './Pagination';
// Don't import Account from node-appwrite as it has a different structure
// than what you're using in your application
// import { Account } from 'node-appwrite'

const RecentTransactions = ({accounts, transactions = [], appwriteItemId, page = 1}: RecentTransactionsProps) => {
  // Make sure we have valid data to work with
  if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
    return (
      <section className='recent-transactions'>
        <header className='flex items-center justify-between'>
          <h2 className='recent-transactions-label'>Recent transactions</h2>
        </header>
        <div className="p-4 text-center text-gray-500">No accounts available</div>
      </section>
    );
  }
  
  // Ensure we have a valid default value
  const defaultTabValue = appwriteItemId || (accounts[0]?.appwriteItemId || accounts[0]?.id || 'default');

  // Calculate pagination values
  const rowsPerPage = 10;
  const totalPages = Math.ceil((transactions?.length || 0) / rowsPerPage);
  const currentPage = Number(page) || 1;
  const indexOfLastTransaction = currentPage * rowsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
  const currentTransactions = transactions?.slice(
    indexOfFirstTransaction, indexOfLastTransaction
  ) || [];
  
  return (
    <section className='recent-transactions'>
        <header className='flex items-center justify-between'>
            <h2 className='recent-transactions-label'>
                Recent transactions
            </h2>
            <Link
            href={`/transaction-history/?id=${appwriteItemId || ''}`}
            className='view-all-btn'>
                View All
            </Link>
        </header>
        <Tabs defaultValue={defaultTabValue} className="w-full">
            <TabsList className="recent-transactions-tablist">
                {accounts.map((account) => (
                  <TabsTrigger key={account.id} value={account.appwriteItemId}>
                    <BankTabItem
                      key={account.id}
                      account={account}
                      appwriteItemId={appwriteItemId}
                    />
                  </TabsTrigger>
                ))}
            </TabsList>
            
            {accounts.map((account) => (
                <TabsContent
                    value={account.appwriteItemId}
                    key={account.id}
                    className='space-y-4'
                >
                    <BankInfo
                        account={account}
                        appwriteItemId={appwriteItemId}
                        type='full'
                    />
                    <TransactionsTable 
                        transactions={currentTransactions}
                    />
                    
                    {totalPages > 1 && (
                      <div className="my-4 w-full">
                        <Pagination totalPages={totalPages} page={currentPage} />
                      </div>
                    )}
                </TabsContent>
            ))}
        </Tabs>
    </section>
  )
}

export default RecentTransactions