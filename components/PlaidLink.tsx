import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import {PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink} from 'react-plaid-link'
import { useRouter } from 'next/navigation';
import { createLinkToken } from '@/lib/actions/user.actions';

const PlaidLink = ({user, variant}: PlaidLinkProps) => {
    const [token, setToken] = useState('');

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
        const router = useRouter();

        // await exchangePublicToken({
        //     publicToken: public_token,
        //     user,
        // })

        router.push('/')
    },[user]);

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