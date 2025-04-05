import React from 'react'
import { FormControl, FormField, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { z } from 'zod'
import { authformSchema } from '@/lib/utils'
import { Control, FieldPath } from 'react-hook-form'

const formSchema = authformSchema('sign-up')
interface CustomInput{
    control: Control<z.infer<typeof formSchema>>,
    name: FieldPath<z.infer<typeof formSchema>>,
    label: string,
    placeholder: string
    type: string
}

const CustomInput = ({control, name, label, placeholder, type}: CustomInput) => {
  return (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <div className='form-item'>
                <FormLabel className='form-label'>
                    {label}
                </FormLabel>
                <div className='flex w-full flex-col'>
                    <FormControl>
                        <Input placeholder={placeholder} className='input-class' type={type} {...field}/>
                    </FormControl>
                    <FormMessage className='form-message mt-2'></FormMessage>
                </div>
            </div>
        )}
    />

  )
}

export default CustomInput