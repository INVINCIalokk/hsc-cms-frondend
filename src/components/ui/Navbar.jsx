"use client"
import React from 'react'
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from '@/components/ui/button';

export const Navbar = () => {
    return (
        <nav className='sticky justify-center mx-auto wrapper top-0 z-50 flex items-center gap-2 py-4 w-full'>
            <div className='flex flex-row items-center justify-between w-full max-w-7xl rounded-sm p-4 bg-secondary/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-primary/1 mx-4'>
                <a href="/" className='flex flex-row gap-2 items-center'>
                    <img src="https://lh3.googleusercontent.com/ROYkSLBaGDazriE29DKtfh5jLIzOtA7Y4ydy-S8ZYYbalAQDs9wJ0BcLnn5ytrqWXTLxv-mbdUvKYAifcL7i0Xr6SMI=s120" alt="Logo" className='rounded-full' width={50} height={50} />
                    <span className='text-2xl font-bold hidden sm:block '>GyanLab</span>
                </a>
                <div className='flex flex-row gap-4'>
                    <ModeToggle />
                    <Button className=" p-4 sm:p-5 font-bol">Login</Button>
                </div>
            </div>
        </nav>
    )
}



