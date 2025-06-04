import  Link  from 'next/link'
import Image from 'next/image'
import React from 'react'
import BankCard from './BankCard'
import { countTransactionCategories } from '@/lib/utils'
import Category from './Category'
// import PlaidLink from './PlaidLink'
// import { Button } from '@/components/ui/button'


const RightSidebar = ({user, transactions, banks}:RightSidebarProps)  => {
const fullName = `${user.firstName} ${user.lastName}`;
const categories: CategoryCount[] = countTransactionCategories(transactions);
  return (
    <aside className='right-sidebar'>
        <section className='flex flex-col pb-8'>
            <div className='profile-banner'/>
                <div className='profile'>
                    <div className='profile-img'>
                        <span className='text-5xl font-bold text-blue-500'>
                            {user.firstName[0]}
                        </span>
                    </div>
                    <div className='profile-details'>
                        <h1 className='profile-name'>
                            {user.firstName}
                        </h1>
                        <p className='profile-email'>
                            {user.email}
                        </p>
                    </div>
            </div>
        </section>
        <section className='banks'>
            <div className='flex w-full justify-between'>
                <h2 className='header-2'>My Banks</h2>
                <div className='flex items-center'>
                    {/* <Button onClick={() => {
                        const plaidButton = document.querySelector('.plaidlink-ghost') as HTMLButtonElement;
                        if (plaidButton) plaidButton.click();
                    }} className='flex gap-2 cursor-pointer'> */}
                        {/* <Image
                        src='/icons/plus.svg'
                        width={20}
                        height={20}
                        alt='plus'
                        />
                        <h2 className='text-14 font-semibold text-gray-600'>
                            Add Bank
                        </h2> */}
                    {/* </Button> */}
                    {/* <div className="hidden">
                        <PlaidLink user={user} variant="ghost" />
                    </div> */}
                </div>
            </div>
            {banks?.length > 0 && (
                <div className='relative flex flex-1 flex-col items-center justifty-center gap-5'>
                    <div className='relative z-10'>
                        <BankCard
                            key ={banks[0].$id}
                            account = {banks[0]}
                            userName = {fullName}
                            showBalance = {false}
                        />
                    </div>
                {banks[1]&&(
                    <div className='absolute right-0 top-8 z-0 w-[90%]'>
                        <BankCard
                            key ={banks[1].$id}
                            account = {banks[1]}
                            userName = {fullName}
                            showBalance = {false}
                            />
                        </div>
                    )}
                </div>
            )}
            <div className='mt-10 flex flex-1 flex-col gap-6'>
                <h2 className='header-2'>Top Categories</h2>
                <div className='space-y-5'>
                    {categories.slice(0,4).map((category, index) => (
                        <Category key = {category.name} category = {category}/>
                    ))}
                </div>
            </div> 
        </section>
    </aside>
  )
}

export default RightSidebar
