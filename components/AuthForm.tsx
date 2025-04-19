'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react';
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomInput from './CustomInput';
import { authformSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import SignUp from '@/app/(auth)/sign-up/page';
import { useRouter } from 'next/navigation';
import { signUp, signIn,} from '../lib/actions/user.actions';
import PlaidLink from './PlaidLink';


const AuthForm = ({type}: {type:string}) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const formSchema = authformSchema(type)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password: ""
        },
      })
     
      // 2. Define a submit handler.
      const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsLoading(true)
        try {
            if(type === 'sign-up'){
                console.log("Submitting user data for sign-up");
                
                // Only prepare the full user data for sign-up
                const userData = {
                    firstName: data.firstName!,
                    lastName: data.lastName!,
                    email: data.email,
                    password: data.password,
                    address1: data.address!,
                    city: data.city!,
                    state: data.state!,
                    postalCode: data.postalCode!,
                    dateOfBirth: data.DOB!,
                    ssn: data.SSN!.padStart(9, '0')
                };
                
                console.log("Submitting user data:", JSON.stringify(userData, null, 2));
                const newUser = await signUp(userData);
                
                if (!newUser) {
                    console.error("Failed to create user - returned null");
                } else {
                    console.log("User created successfully:", newUser);
                    setUser(newUser);
                }
            } 
            else if(type === 'sign-in'){
                console.log('Attempting sign in with:', data.email);
                try {
                    // For sign-in, only pass email and password
                    const response = await signIn({
                        email: data.email,
                        password: data.password
                    });

                    console.log('Sign-in response:', response);
                    
                    if(response) {
                        console.log('Sign-in successful, redirecting to dashboard...');
                        // Add a timestamp to force a clean reload and avoid any caching issues
                        const timestamp = new Date().getTime();
                        window.location.href = `/?t=${timestamp}`;
                    } else {
                        console.error('Sign-in failed - no response returned');
                        // Handle sign-in failure
                        alert('Sign-in failed. Please check your credentials and try again.');
                    }
                } catch (error) {
                    console.error('Sign-in error caught:', error);
                    alert('An error occurred during sign-in. Please try again.');
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false)
        }
      }

  return (
    <section className='auth-form'>
        <header className='flex flex-col gap-5 md:gap-8'>
        <Link href='/' className='cursor-pointer items-center gap-1 flex'>
            <Image src="/icons/logo.svg" alt='logo' width={34} height={34}/>
            <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>Horizon</h1>
        </Link>
        <div className='flex flex-col gap-1 md:gap-3'>
            <h1 className='text-24 lg:text-30 font-semibold text-gray-900'>{user
                ? "Link Account"
                : type === 'sign-in'
                ? 'Sign in'
                : 'Sign Up'
                }</h1>

            <p className='text-16 font-normal text-gray-600'>
                {user
                ? 'Link your account to get started'
                : 'Please enter your details'
                }
            </p>
        </div>
        </header>
        {user ? (
            <div className='flex flex-col gap-4'>
                <h2 className="text-lg font-medium text-center">Your account has been created successfully!</h2>
                <p className="text-sm text-gray-500 text-center mb-4">Now let's connect your bank account</p>
                <PlaidLink user={user} variant="primary"/>
            </div>
        ) : (
            <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    {type === 'sign-up' && (
                        <>
                        <div className="col-span-1">
                            <CustomInput
                            control={form.control}
                            name='firstName'
                            label='First Name'
                            placeholder='Enter your first name'
                            type='text'
                            />
                        </div>
                        <div className="col-span-1">
                            <CustomInput
                            control={form.control}
                            name='lastName'
                            label='Last Name'
                            placeholder='Enter your last name'
                            type='text'
                            />
                        </div>
                        <div className="col-span-2">
                            <CustomInput
                            control={form.control}
                            name='address'
                            label='address'
                            placeholder='Enter your address'
                            type='text'
                            />

                            <CustomInput
                            control={form.control}
                            name='city'
                            label='City'
                            placeholder='Example = "LA"'
                            type='text'
                            />
                        </div>
                        <div className="col-span-1">
                            <CustomInput
                            control={form.control}
                            name='state'
                            label='State'
                            placeholder='Example: CA'
                            type='text'
                            />
                        </div>
                        <div className="col-span-1">
                            <CustomInput
                            control={form.control}
                            name='postalCode'
                            label='Postal Code'
                            placeholder='15810'
                            type='text'
                            />
                        </div>
                        <div className="col-span-1">
                            <CustomInput
                            control={form.control}
                            name='DOB'
                            label='Date of Birth'
                            placeholder='YYYY-MM-DD'
                            type='text'
                            />
                        </div>
                        <div className="col-span-1">
                            <CustomInput
                            control={form.control}
                            name='SSN'
                            label='SSN Number'
                            placeholder='Enter 9-digit SSN'
                            type='text'
                            />
                        </div>
                        </>
                    )}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                    <CustomInput
                        control={form.control}
                        name='email'
                        label='Email address'
                        placeholder='Enter your Email address'
                        type='email'
                    />
                    <CustomInput
                        control={form.control}
                        name='password'
                        label='Password'
                        placeholder='Enter your password'
                        type='password'
                    />
                    </div>
                    <div className='flex flex-col gap-4'>
                        <Button type="submit" className='form-btn'>
                            {
                                isLoading?(
                                    <>
                                    <Loader2 size={20}
                                    className='animate-spin'/> Loading... &nbsp;
                                    </>
                                ) : type === 'sign-in' ? 'Sign-in': 'Sign-Up'
                            }
                        </Button>
                    </div>
                    
                </form>
            </Form>
            <footer className='flex justifty-center gap-1'>
                <p className='text-14 font-normal text-gray-600'>
                    {
                        type === 'sign-in'
                        ? "Don't have an account?"
                        : "Already have an account?"
                    }
                </p>
                <Link href={type === 'sign-in' ? 'sign-up' : '/sign-in'} className='form-link'>
                {type === 'sign-in' ? 'Sign up' : 'Sign in'}
                </Link>
            </footer>
            </>
        )}
    </section>
  )
}

export default AuthForm