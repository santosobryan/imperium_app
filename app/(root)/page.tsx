import TotalBalanceBox from '@/components/TotalBalanceBox'
import HeaderBox from '@/components/HeaderBox'
import React from 'react'
import RightSidebar from '@/components/RightSidebar'
import { getLoggedInUser } from '@/lib/actions/user.actions'

const Home = async () => {
  const loggedIn = await getLoggedInUser();
  return (
    <section className="home">
      <div className="home-content">
        <header className='home-header'>  
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.name || 'Guest'}
            subtext = 'Access your transacation and manage your account efficiently' 
          /> 

          <TotalBalanceBox
          accounts = {[]}
          totalBanks = {1}
          totalCurrentBalance={1500.21}
          />
        </header>
        RECENT TRANSACTIONS
      </div>
      <RightSidebar
        user = {loggedIn}
        transactions = {[]}
        banks = {[{currentBalance: 100},{currentBalance: 200}]} 
        />
    </section>
  )
}

export default Home