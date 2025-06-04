"use server";

import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";
import { getBanks, getBank } from "./user.actions";

import {getTransactionsByBankId} from './transactions.actions'

import { CATEGORY_MAPPINGS } from "@/constants";

/**
 * Get multiple bank accounts for a user
 */

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // Get banks from database
    const banks = await getBanks({ userId });

    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        // Get each account info from Plaid
        const accountsResponse = await plaidClient.accountsGet({
          access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts[0];

        // Get institution info from Plaid
        const institution = await getInstitution({
          institutionId: accountsResponse.data.item.institution_id!,
        });

        const account = {
          id: accountData.account_id,
          availableBalance: accountData.balances.available!,
          currentBalance: accountData.balances.current!,
          institutionId: institution.institution_id,
          name: accountData.name,
          officialName: accountData.official_name,
          mask: accountData.mask!,
          type: accountData.type as string,
          subtype: accountData.subtype! as string,
          appwriteItemId: bank.$id,
          shareableId: bank.shareableId,
        };

        return account;
      })
    );

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    return null;
  }
};

/**
 * Get one bank account by its ID
 */
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // Get bank from database
    const bank = await getBank({ documentId: appwriteItemId });

    // Get account info from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];

    // Get transfer transactions from appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions = transferTransactionsData.documents.map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? 'debit' : 'credit',
      }),
    );

    // Get institution info from Plaid
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    // Get transactions from Plaid
    const transactions = await getTransactions({
      accessToken: bank?.accessToken,
    });

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      appwriteItemId: bank.$id,
      shareableId: bank.shareableId,
    };

    // Sort transactions by date with most recent first
    const allTransactions = [...transactions, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("Error fetching account details:", error);
    return null;
  }
};

/**
 * Get institution information
 */
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const institution = institutionResponse.data.institution;

    return parseStringify(institution);
  } catch (error) {
    console.error("Error fetching institution details:", error);
    return null;
  }
};

/**
 * Get transactions for an account
 */
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
      });

      const data = response.data;
      transactions = response.data.added.map((transaction) => {
        console.log(transaction.personal_finance_category?.primary);
        
        // Safe category mapping with fallback
        const primaryCategory = transaction.personal_finance_category?.primary;
        const category = primaryCategory && CATEGORY_MAPPINGS[primaryCategory] 
          ? CATEGORY_MAPPINGS[primaryCategory] 
          : "Other";

        return {
          id: transaction.transaction_id,
          name: transaction.name,
          paymentChannel: transaction.payment_channel,
          type: transaction.payment_channel,
          accountId: transaction.account_id,
          amount: transaction.amount,
          pending: transaction.pending,
          category,
          date: transaction.date,
          image: transaction.logo_url,
        };
      });

      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return null;
  }
};

