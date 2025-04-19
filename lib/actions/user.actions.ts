'use server';

import { ID, Query } from "node-appwrite";
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

// Helper function to validate the collection exists
const validateCollection = async (collectionId: string) => {
  try {
    const { database } = await createAdminClient();
    // Try to get the collection details
    const collection = await database.getCollection(DATABASE_ID!, collectionId);
    console.log(`Collection is valid: ${collection.name} (${collection.$id})`);
    return true;
  } catch (error) {
    console.error(`Failed to validate collection ${collectionId}:`, error);
    return false;
  }
};

export const getUserInfo = async ({ userId, email }: { userId?: string; email?: string }) => {
    try {
        const { database } = await createAdminClient();
        let query = [];
        
        // Query by userId or email, depending on what's provided
        if (userId) {
            // First try to query by $id which is Appwrite's internal ID
            query = [Query.equal('$id', [userId])];
        } else if (email) {
            // If userId not provided, query by email
            query = [Query.equal('email', [email])];
        } else {
            throw new Error('Either userId or email must be provided');
        }
        
        const user = await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            query
        );
        
        // Check if any documents were found
        if (user.documents.length === 0) {
            console.log("No user found with provided criteria");
            return null;
        }
        
        return parseStringify(user.documents[0]);
    } catch (error) {
        console.error("Error getting user info:", error);
        return null;
    }
};

export const signIn = async ({ email, password }: signInProps) => {
  try {
    console.log('Sign-in attempt for email:', email);
    
    const { account } = await createAdminClient();

    console.log('Creating session...');
    const session = await account.createEmailPasswordSession(email, password);
    console.log('Session created successfully:', session.$id);
    
    // Set the session cookie for persistent authentication
    // Make sure the cookie is properly set for client-side access
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax", // Changed from "strict" to "lax" to allow redirects
      secure: process.env.NODE_ENV === "production", // Only secure in production
    });
    console.log('Cookie set successfully');

    return parseStringify(session);
  } catch (error) {
    console.error('Error in signIn:', error);
    return null;
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
  
      // Use the Appwrite user ID as the document ID for easy lookup
      const userId = newUserAccount.$id;
      
      const newUser = await database.createDocument(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        userId, // Use the Appwrite user ID as the document ID
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
      console.error('Error during sign up:', error);
      return parseStringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during sign up' 
      });
    }
  }


export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const authUser = await account.get();
    
    console.log("Auth user retrieved:", authUser.$id);
    
    // Since we're using document ID directly in signUp, we should try to get the document directly
    try {
      const { database } = await createAdminClient();
      
      // First try to find by email (most reliable in your schema)
      const userDocs = await database.listDocuments(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        [Query.equal('email', [authUser.email])]
      );
      
      // If user profile is found, return it
      if (userDocs.documents.length > 0) {
        console.log("User profile found by email");
        return parseStringify(userDocs.documents[0]);
      }
      
      console.log("No user profile found by email, returning auth user");
      // Otherwise return just the auth user
      return parseStringify(authUser);
    } catch (dbError) {
      console.error("Error fetching user profile:", dbError);
      // Fallback to returning just the auth user
      return parseStringify(authUser);
    }
  } catch (error) {
    console.log("Session error:", error);
    return null;
  }
}

// export async function getUserInfo(email: string) {
//     try {
//       const { database } = await createAdminClient();
      
//       // Query the USER_COLLECTION to get the full user profile by email
//       const userInfo = await database.listDocuments(
//         DATABASE_ID!,
//         USER_COLLECTION_ID!,
//         [
//           // Find the document where email field equals the provided email
//           `email=${email}`
//         ]
//       );
      
//       if (userInfo.documents.length === 0) {
//         return null;
//       }
      
//       // Log user document to check field names
//       console.log("User document fields:", Object.keys(userInfo.documents[0]));
      
//       return parseStringify(userInfo.documents[0]);
//     } catch (error) {
//       console.error('Error getting user info:', error);
//       return null;
//     }
// }

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
    shareableId,
}: createBankAccountProps) => {
    try {
        console.log("Starting createBankAccount with params:", {
            userId,
            bankId,
            accountId,
            fundingSourceUrl,
            shareableId
        });
        
        const {database} = await createAdminClient();
        console.log("Admin client created successfully");
        
        console.log("Creating bank document with DATABASE_ID:", DATABASE_ID, "BANK_COLLECTION_ID:", BANK_COLLECTION_ID);
        
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
                shareableId,
            }
        );
        
        console.log("Raw bank account document:", bankAccount);
        console.log("Bank account document created with ID:", bankAccount.$id);
        
        // Return the raw document first, then stringify it
        return bankAccount;
    } catch (error) {
        console.error("Error creating bank account:", error);
        throw error; // Re-throw to handle in the calling function
    }
}   

export const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        console.log("Starting exchangePublicToken process with user:", user.$id);
        
        // Validate collections first
        console.log("Validating collections...");
        const isDatabaseValid = await validateCollection(BANK_COLLECTION_ID!);
        
        if (!isDatabaseValid) {
            throw new Error(`Bank collection invalid or inaccessible: ${BANK_COLLECTION_ID}`);
        }
        
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });
        console.log("Public token exchanged successfully");
        
        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
        console.log("Received access token and item ID:", { itemId });
        
        // To get information regarding the client account from plaid using the access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });
        console.log("Retrieved account information from Plaid");
        
        const accountData = accountsResponse.data.accounts[0];
        console.log("Account data:", { 
            account_id: accountData.account_id,
            name: accountData.name,
            type: accountData.type 
        });
        
        // Creating a processor token for Dwolla, the processing payment system, using the access token and accountID
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };
        console.log("Creating processor token with request:", {
            account_id: request.account_id,
            processor: request.processor
        });
        
        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;
        console.log("Processor token created successfully");
        
        //Funding source URL for the account that is using the Dwolla customer ID, the processor token, and the respective bank name
        console.log("Adding funding source with dwollaCustomerID:", user.dwollaCustomerID);
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerID: user.dwollaCustomerID,
            processorToken,
            bankName: accountData.name,
        });
        console.log("Funding source URL created:", fundingSourceUrl);
        
        // Save guard if the funding source URL is not created, we can throw an error
        if(!fundingSourceUrl){
            throw new Error("Failed to create funding source URL");
        }
        
        console.log("Creating bank account document with userId:", user.$id);
        console.log("DATABASE_ID:", DATABASE_ID);
        console.log("BANK_COLLECTION_ID:", BANK_COLLECTION_ID);
        
        try {
            const bankAccount = await createBankAccount({
                userId: user.$id,
                bankId: itemId,
                accountId: accountData.account_id,
                accessToken,
                fundingSourceUrl,
                shareableId: encryptId(accountData.account_id),
            });
            
            if (!bankAccount || !bankAccount.$id) {
                throw new Error("Bank account creation failed or returned invalid data");
            }
            
            console.log("Bank account created successfully with ID:", bankAccount.$id);
            
            revalidatePath("/");
            
            return parseStringify({publicTokenExchange: "complete", bankAccountId: bankAccount.$id});
        } catch (createError) {
            console.error("Error creating bank account in Appwrite:", createError);
            
            // Try a direct creation as a fallback
            console.log("Attempting direct document creation as fallback");
            const { database } = await createAdminClient();
            
            const directBankAccount = await database.createDocument(
                DATABASE_ID!,
                BANK_COLLECTION_ID!,
                ID.unique(),
                {
                    userId: user.$id,
                    bankId: itemId,
                    accountId: accountData.account_id,
                    accessToken,
                    fundingSourceUrl,
                    shareableId: encryptId(accountData.account_id),
                }
            );
            
            if (!directBankAccount || !directBankAccount.$id) {
                throw new Error("Direct bank account creation failed or returned invalid data");
            }
            
            console.log("Direct bank account creation successful with ID:", directBankAccount.$id);
            
            revalidatePath("/");
            
            return parseStringify({publicTokenExchange: "complete", bankAccountId: directBankAccount.$id});
        }
    } catch (error) {
        console.error("Error in exchangePublicToken:", error);
        return null;
    }
}

export const getBanks = async ({userId}: getBanksProps) => {
    try {
        const {database} = await createAdminClient();
        const banks = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        )
        return parseStringify(banks.documents);
    } catch (error) {
        console.log(error);
    }
}

export const getBank = async ({documentId}: getBankProps) => {
    try {
        const {database} = await createAdminClient();
        const bank = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('$id', [documentId])]
        )
        return parseStringify(bank.documents[0]);
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


  