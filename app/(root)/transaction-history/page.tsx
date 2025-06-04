import HeaderBox from '@/components/HeaderBox'
import { Pagination } from '@/components/Pagination';
import TransactionsTable from '@/components/TransactionsTable';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { formatAmount } from '@/lib/utils';
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankTabItem } from '@/components/BankTabItem';

const TransactionHistory = async ({searchParams: {id, page}}: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({
    userId: loggedIn.userId || loggedIn.$id
  });

  if(!accounts) return;
  const accountsData = accounts?.data;
  
  const appwriteItemId = (id as string) || (accountsData[0]?.appwriteItemId || '');

  // Get all accounts with their transactions
  const accountsWithTransactions = await Promise.all(
    accountsData.map(async (account) => {
      const accountDetails = await getAccount({ appwriteItemId: account.appwriteItemId });
      return {
        ...account,
        data: accountDetails?.data,
        transactions: accountDetails?.transactions || []
      };
    })
  );

  const rowsPerPage = 10;

  return (
    <div className='transactions'>
      <div className='transactions-header'>
        <HeaderBox
          title='Transaction History'
          subtext='See your bank details and transactions.'
        />
      </div>

      <section className='recent-transactions'>
        <Tabs defaultValue={appwriteItemId} className="w-full">
          <TabsList className="recent-transactions-tablist">
            {accountsData.map((account: Account) => (
              <TabsTrigger key={account.id} value={account.appwriteItemId}>
                <BankTabItem
                  key={account.id}
                  account={account}
                  appwriteItemId={appwriteItemId}
                />
              </TabsTrigger>
            ))}
          </TabsList>
          
          {accountsWithTransactions.map((account) => {
            const totalPages = Math.ceil(account.transactions.length / rowsPerPage);
            const indexOfLastTransactions = currentPage * rowsPerPage;
            const indexOfFirstTransaction = indexOfLastTransactions - rowsPerPage;
            const currentTransactions = account.transactions.slice(indexOfFirstTransaction, indexOfLastTransactions);

            return (
              <TabsContent
                value={account.appwriteItemId}
                key={account.id}
                className='space-y-4'
              >
                <div className='space-y-6'>
                  <div className='transactions-account'>
                    <div className='flex flex-col gap-2'>
                      <h2 className='text-18 font-bold text-white'>{account?.data?.name}</h2>
                      <p className='text-14 text-blue-25'>
                        {account?.data?.officialName}
                      </p>
                      <p className='text-14 font-semibold tracking-[1.1px] text-white'>
                          ●●●● ●●●● ●●●● <span className='text-16'>
                          {account?.data?.mask}</span>
                        </p>
                    </div>
                    <div className='transactions-account-balance'>
                      <p className='text-14'>Current balance</p>
                      <p className='text-24 text-center font-bold'>
                        {formatAmount(account?.data?.currentBalance)}
                      </p>
                    </div>
                  </div>
                  
                  <section className='flex w-full flex-col gap-6'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-20 font-semibold text-gray-900'>
                        All Transactions
                      </h3>
                      <p className='text-14 text-gray-600'>
                        Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransactions, account.transactions.length)} of {account.transactions.length} transactions
                      </p>
                    </div>
                    
                    <TransactionsTable
                      transactions={currentTransactions}
                    />
                    {totalPages > 1 && (
                      <div className='my-4 w-full'>
                        <Pagination totalPages={totalPages} page={currentPage}/>
                      </div>
                    )}
                  </section>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </section>
    </div>
  )
}

export default TransactionHistory