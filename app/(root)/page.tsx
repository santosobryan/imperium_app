import TotalBalanceBox from '@/components/TotalBalanceBox'
import HeaderBox from '@/components/HeaderBox'
import React from 'react'
import RightSidebar from '@/components/RightSidebar'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import { getAccount, getAccounts } from '@/lib/actions/bank.actions'
import { redirect } from 'next/navigation';
import RecentTransactions from '@/components/RecentTransactions'

const Home = async ({searchParams: {id, page}}: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();
  
  // Check if user is logged in
  if (!loggedIn) {
    // Redirect to sign-in page if user is not logged in
    redirect('/sign-in');
    return null;
  }
  
  // Get accounts using userId field from your database structure
  const accounts = await getAccounts({
    userId: loggedIn.userId || loggedIn.$id
  });

  if(!accounts) {
    // Handle case where getAccounts returns null
    return (
      <section className="home">
        <div className="home-content">
          <header className='home-header'>  
            <HeaderBox 
              type="greeting"
              title="Welcome"
              user={loggedIn.firstName || 'Guest'}
              subtext='No bank accounts found. Please connect a bank account.' 
            /> 
          </header>
        </div>
      </section>
    );
  }

  const accountsData = accounts?.data;
  
  const appwriteItemId = (id as string) || (accountsData[0]?.appwriteItemId || '');

  // Only try to get account details if we have a valid appwriteItemId
  const account = appwriteItemId ? await getAccount({appwriteItemId}) : null;

  console.log({
    accountsData,
    account
  });

  return (
    <section className="home">
      <div className="home-content">
        <header className='home-header'>  
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn.firstName || 'Guest'}
            subtext='Access your transactions and manage your account efficiently' 
          /> 

          <TotalBalanceBox
            accounts={accountsData || []}
            totalBanks={accounts?.totalBanks || 0}
            totalCurrentBalance={accounts?.totalCurrentBalance || 0}
          />
        </header>
        <RecentTransactions
          accounts = {accounts.data}
          transactions = {accounts?.transactions}
          appwriteItemId = {appwriteItemId}
          page = {currentPage}
        />
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={account?.transactions || []}
        banks={accountsData?.slice(0,2) || []} 
      />
    </section>
  )
}

export default Home