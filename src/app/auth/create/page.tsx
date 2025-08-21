
'use client';

import { useState, useTransition } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateAccountPage() {
    const { createAndSignInUser } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await createAndSignInUser({ displayName: name, email, phone });
                toast({
                    variant: 'success',
                    title: 'Account Created!',
                    description: "Welcome to AquaCast.",
                });
                router.push('/');
            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Registration Failed',
                    description: error.message || 'An unexpected error occurred.',
                });
            }
        });
    };
    

    return (
        <div className="flex flex-col min-h-screen bg-background p-6">
            <div className="absolute top-6 left-4">
                 <Button variant="ghost" size="icon" asChild>
                    <Link href="/welcome">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
            </div>
           
            <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-10">
                    <h1 className="font-headline text-2xl font-bold">Create your account</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Let's get started with your fishing journey.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                            type="text" 
                            id="name" 
                            placeholder="John Angler" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            type="email" 
                            id="email" 
                            placeholder="you@example.com"
                             value={email}
                            onChange={(e) => setEmail(e.target.value)}
                             required
                        />
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                            type="tel" 
                            id="phone" 
                            placeholder="+1 555-123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                         />
                    </div>
                    <Button type="submit" size="xl" className="w-full mt-4" disabled={isPending}>
                         {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign Up
                    </Button>
                </form>
            </div>
             <div className="text-center text-sm text-muted-foreground pb-4">
                <p>
                    Already have an account?{' '}
                    <Link href="#" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
