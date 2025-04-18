'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "@/lib/plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const{
    APPWRITE_DATABASE_ID : DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID : USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;
export const signIn = async({email, password}: signInProps) => {
    if (!email || !password) {
        throw new Error('Email and password must be provided');
    }

    try {
        const { account } = await createAdminClient();
        
        // Create email session directly without checking user status first
        const response = await account.createEmailPasswordSession(email, password);
        
        // MUST set cookies for session persistence
        cookies().set("appwrite-session", response.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        
        return parseStringify(response);
    } catch (error) {
        console.error('Authentication error:', error);
    }
}
    
export const signUp = async ({ password, ...userData }: SignUpParams) => {
    const { email, firstName, lastName } = userData;
    
    let newUserAccount;
  
    try {
      const { account, database } = await createAdminClient();
  
      newUserAccount = await account.create(
        ID.unique(), 
        email, 
        password, 
        `${firstName} ${lastName}`
      );
  
      if(!newUserAccount) throw new Error('Error creating user')
  
      const dwollaCustomerUrl = await createDwollaCustomer({
        ...userData,
        type: 'personal'
      })
  
      if(!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer')
  
      const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
  
      const newUser = await database.createDocument(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        ID.unique(),
        {
          // Only include fields that are in the Appwrite schema
          email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          address1: userData.address1,
          city: userData.city,
          state: userData.state,
          postalCode: userData.postalCode,
          dateOfBirth: userData.dateOfBirth,
          ssn: userData.ssn,
          username: email.split('@')[0],
          dwollaCustomerID: dwollaCustomerId,
          dwollaCustomerURL: dwollaCustomerUrl
        }
      )
  
      const session = await account.createEmailPasswordSession(email, password);
  
      cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
  
      return parseStringify(newUser);
    } catch (error) {
      console.error('Error', error);
    }
  }


export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const user = await account.get();
      return parseStringify(user);
    } catch (error) {
      return null;
    }
}

export async function getUserInfo(email: string) {
    try {
      const { database } = await createAdminClient();
      
      // Query the USER_COLLECTION to get the full user profile by email
      const userInfo = await database.listDocuments(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        [
          // Find the document where email field equals the provided email
          `email=${email}`
        ]
      );
      
      if (userInfo.documents.length === 0) {
        return null;
      }
      
      // Log user document to check field names
      console.log("User document fields:", Object.keys(userInfo.documents[0]));
      
      return parseStringify(userInfo.documents[0]);
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
}

export const logoutAccount = async() => {
    try {
        const {account} = await createSessionClient();
        cookies().delete("appwrite-session");

        await account.deleteSession("current");
    } catch (error) {
        return null;
    }
}

export const createLinkToken = async (user: User) => {
    try {
        // Check for required user properties
        if (!user || !user.$id) {
            console.error("Invalid user object for createLinkToken");
            return null;
        }

        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }

        const response = await plaidClient.linkTokenCreate
        (tokenParams)
        
        return parseStringify({linkToken: response.data.link_token})
    } catch (error) {
        console.log("Error creating link token:", error);
        return null;
    }
}

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId,
}: createBankAccountProps) => {
    try {
        const {database} = await createAdminClient();
        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId,
            }
        );

        return parseStringify(bankAccount);
    } catch (error) {
        
    }
}   

export const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
        });
        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
        // To get information regarding the client account from plaid using the access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0];
        // Creating a processor token for Dwolla, the processing payment system, using the access token and accountID
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwola" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        //Funding source URL for the account that is using the Dwolla customer ID, the processor token, and the respective bank name
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerID: user.dwollaCustomerID,
            processorToken,
            bankName: accountData.name,
        })

        // Save guard if the funding source URL is not created, we can throw an error
        if(!fundingSourceUrl){
            throw(Error);
        }

        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id),
        });


        revalidatePath("/");

        return parseStringify({publicTokenExchange: "complete"})
    } catch (error) {
        console.log(error);
    }
}

// Overall process for public access Token
// 1. Exchange our public token for the access token => allows  us to create a bank account
// 2. Allowing us to access that account's data
// 3. Implememented a payment processor "Dwolla"
// 4. Implemented a funding source using dwolla to fund that account
// 5. This also helps in allowing transfers accross accounts as a feature


  