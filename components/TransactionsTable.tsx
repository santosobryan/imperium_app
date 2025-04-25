import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { cn, formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from '@/lib/utils'
import CategoryBadge from './CategoryBadge';


const TransactionsTable = ({transactions}: TransactionTableProps) => {
  return (
    <div className='w-50% overflow-hidden'>
      <Table className="w-full">
        <TableHeader className='bg-[#f9fafb]'>
            <TableRow>
              <TableHead className="px-2">Transactions</TableHead>
              <TableHead className="px-2">Amount</TableHead>
              <TableHead className="px-2">Status</TableHead>
              <TableHead className="px-2">Date</TableHead>
              <TableHead className="px-2 max-md:hidden">Channel</TableHead>
              <TableHead className="px-2 max-md:hidden">Category</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {transactions.map((t: Transaction) => {
              const status = getTransactionStatus(new Date(t.date))
              const amount = formatAmount(t.amount)

              const isDebit = t.type === 'debit';
              const isCredit = t.type === 'credit';
              return (
                <TableRow
                  key = {t.id} className={`${isDebit || amount[0] ==='-' ? 'bg-[#FFFBFA]': 'bg-[#F6FEF9]' } !OVER:bg-none!border-b-DEFAULT`}>
                    <TableCell className="max-w-[150px] pl-2 pr-4 truncate">
                      <div className='flex items-center gap-3'>
                        <h1 className='text-14 truncate font-semibold text-[#344054]'>
                          {removeSpecialCharacters(t.name)}
                        </h1>
                      </div>
                    </TableCell>
                    <TableCell className={`${isDebit || amount[0] === '-' ? 'text-[#f04438]' : 'text-[#039855]'} min-w-[100px] text-left whitespace-nowrap px-2`}>
                      {isDebit ? `-${amount}` : amount}
                    </TableCell>
                    <TableCell className={`pl-2 pr-10 font-semibold ${isDebit || amount[0] ==='-' ? 'text-[#f04438]' : 'text-[#039855]'}`}>
                      <CategoryBadge category={status}></CategoryBadge>
                    </TableCell>
                    <TableCell className='min-w-32 pl-2 pr-10'>
                      {formatDateTime(new Date(t.date)).dateTime}
                    </TableCell>
                    <TableCell className='pl-2 pr-10 capitalize min-w-24'>
                      {t.paymentChannel}
                    </TableCell>
                    <TableCell className='pl-2 pr-10 max-md:hidden'>
                    <CategoryBadge category={t.category}></CategoryBadge>
                    </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
    </Table>

    </div>
  )
}

export default TransactionsTable