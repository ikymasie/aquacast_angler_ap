
'use client';

import { useState, useTransition } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { getMaskedPhoneForUserAction, recoverAccountAction } from '@/app/actions';

type RecoveryStep = 'email' | 'phone';

export default function RecoverAccountPage() {
    const { signInUser } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [step, setStep] = useState<RecoveryStep>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [maskedPhone, setMaskedPhone] = useState('');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const { data, error } = await getMaskedPhoneForUserAction(email);
            if (error || !data) {
                toast({
                    variant: 'destructive',
                    title: 'Account Not Found',
                    description: error || 'Could not find an account with that email.',
                });
            } else {
                setMaskedPhone(data.maskedPhone);
                setStep('phone');
            }
        });
    };
    
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const { success, error } = await recoverAccountAction(email, phone);
            if (!success) {
                 toast({
                    variant: 'destructive',
                    title: 'Verification Failed',
                    description: error,
                });
                return;
            }

            try {
                await signInUser(email);
                toast({
                    variant: 'success',
                    title: 'Welcome Back!',
                    description: "You've been successfully signed in.",
                });
                router.push('/');
            } catch (signInError: any) {
                toast({
                    variant: 'destructive',
                    title: 'Sign-In Failed',
                    description: signInError.message || 'An unexpected error occurred during sign-in.',
                });
            }
        });
    }

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
                {step === 'email' ? (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="font-headline text-2xl font-bold">Recover Your Account</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Enter your email to get started.
                            </p>
                        </div>
                        <form onSubmit={handleEmailSubmit} className="w-full max-w-sm mx-auto space-y-4">
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
                            <Button type="submit" size="xl" className="w-full mt-4" disabled={isPending || !email}>
                                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </Button>
                        </form>
                    </>
                ) : (
                     <>
                        <div className="text-center mb-10">
                            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4"/>
                            <h1 className="font-headline text-2xl font-bold">Verify Your Identity</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                To protect your account, please enter the full phone number ending in <span className="font-bold text-foreground">{maskedPhone}</span>.
                            </p>
                        </div>
                        <form onSubmit={handlePhoneSubmit} className="w-full max-w-sm mx-auto space-y-4">
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
                            <Button type="submit" size="xl" className="w-full mt-4" disabled={isPending || !phone}>
                                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify & Sign In
                            </Button>
                        </form>
                    </>
                )}
            </div>
             <div className="text-center text-sm text-muted-foreground pb-4">
                <p>
                    Remember your details?{' '}
                    <Link href="/auth/create" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

    