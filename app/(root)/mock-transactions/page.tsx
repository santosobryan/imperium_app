import React from 'react';
import MockTransactionsViewer from '@/components/MockTransactionsViewer';
import HeaderBox from '@/components/HeaderBox';

export const metadata = {
  title: 'Mock Transactions - Bank System',
  description: 'Test transactions while waiting for Plaid API approval',
};

const MockTransactionsPage = () => {
  return (
    <section className="page-container">
      <header className='page-header mb-6'>  
        <HeaderBox 
          type="page"
          title="Mock Transactions Tester"
          subtext="Use this page to test transactions functionality while waiting for Plaid API approval" 
        /> 
      </header>
      
      <MockTransactionsViewer />
    </section>
  );
};

export default MockTransactionsPage; 