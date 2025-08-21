
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { AquaCastLogo } from '@/components/aqua-cast-logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const { signIn } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address to continue.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await signIn(email, '123456'); // Using default password as requested
        toast({
          variant: 'success',
          title: 'Welcome!',
          description: 'You are now signed in.',
        });
        router.push('/');
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: error.message || 'An unknown error occurred. Please try again.',
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <AquaCastLogo className="mx-auto h-12 w-12 text-primary mb-2"/>
          <CardTitle className="font-headline text-2xl">Welcome to AquaCast</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value="123456"
              readOnly
              disabled
            />
             <p className="text-xs text-muted-foreground">Using a default password for this demo.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSignIn} disabled={isPending || !email} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In / Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
