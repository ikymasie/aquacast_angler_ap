
'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

interface UserAuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserAuthDialog({ isOpen, onOpenChange }: UserAuthDialogProps) {
  const { createAndSignInUser } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const isFormValid = displayName.trim() && email.trim() && phone.trim();

  const handleSubmit = async () => {
    if (!isFormValid) {
        toast({ variant: 'destructive', title: 'Please complete the form.' });
        return;
    }
    
    startTransition(async () => {
      try {
        await createAndSignInUser({ displayName, email, phone });
        toast({ variant: 'success', title: 'Welcome!', description: 'Your account has been created.' });
        onOpenChange(false);
      } catch (error: any) {
        console.error("Failed to create user", error);
        toast({ 
            variant: 'destructive', 
            title: 'Registration Error', 
            description: error.message || 'Could not create your account. Please try again.' 
        });
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to AquaCast</DialogTitle>
          <DialogDescription>
            Create an account to get personalized fishing forecasts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                  type="text" 
                  id="name" 
                  placeholder="John Angler" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
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
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !isFormValid} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
