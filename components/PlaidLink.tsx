import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import {PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink} from 'react-plaid-link'
import { useRouter } from 'next/navigation';
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions';

const PlaidLink = ({user, variant}: PlaidLinkProps) => {
    const [token, setToken] = useState('');
    const router = useRouter();

    useEffect(() =>{
        const getLinkToken = async () =>{
            // Only proceed if we have a valid user object
            if (!user) return;
            
            const data = await createLinkToken(user);
            setToken(data?.linkToken)
        }
        getLinkToken();
    }, [user]);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) =>{
        console.log("PlaidLink onSuccess called with token");
        
        // Validate the user object has required properties
        if (!user || !user.$id || !user.dwollaCustomerID) {
            console.error("User object is missing required properties:", user);
            alert("Error: User profile is incomplete. Please try again or contact support.");
            return;
        }
        
        console.log("Exchanging public token with user:", {
            userId: user.$id,
            dwollaCustomerID: user.dwollaCustomerID
        });
        
        const result = await exchangePublicToken({
            publicToken: public_token,
            user,
        });
        
        console.log("Exchange result:", result);

        router.push('/')
    },[user, router]);

    const config: PlaidLinkOptions ={
        token,
        onSuccess
    }

    const {open, ready} = usePlaidLink(config);
    return (
    <>
        {variant === 'primary' ?(
            <Button
            onClick = {() => open()}
            disabled = {!ready}
            className='plaidlink-primary'
            >
            Connect bank
            </Button>
        ): variant === 'ghost' ? (
            <Button>
                Connect Bank
            </Button>
        ) : (
            <Button>
                Connect Bank
            </Button>
        )
        }
    </>
  )
}

export default PlaidLink