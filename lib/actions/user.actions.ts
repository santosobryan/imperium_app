'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

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
    
export const signUp = async(userData: SignUpParams) =>{
    const {email, password, firstName, lastName} = userData;

    try {
        const { account } = await createAdminClient();
        const newUserAccount = await account.create(ID.unique(), 
            email!, 
            password!, 
            `${firstName} ${lastName}`);

        const session = await account.createEmailPasswordSession(email!, password!);
        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUserAccount);
    } catch (error) {
        console.error('error', error);
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

export const logoutAccount = async() => {
    try {
        const {account} = await createSessionClient();
        cookies().delete("appwrite-session");

        await account.deleteSession("current");
    } catch (error) {
        return null;
    }
}


  