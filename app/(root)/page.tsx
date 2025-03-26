import TotalBalanceBox from '@/components/TotalBalanceBox'
import HeaderBox from '@/components/HeaderBox'
import React from 'react'
import RightSidebar from '@/components/RightSidebar'

const Home = () => {
  const loggedIn = {firstName: 'Bryan Lee', lastName: 'Santoso', email: 'bryanleesantoso@gmail.com'}
  return (
    <section className="home">
      <div className="home-content">
        <header className='home-header'>
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
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