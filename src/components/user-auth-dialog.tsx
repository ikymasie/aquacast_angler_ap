
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

// NOTE: This component is currently not used in the new /welcome onboarding flow,
// but is being kept in case it's needed for other purposes, like editing a user profile.
// The main registration flow is now at /auth/create.

export function UserAuthDialog({ isOpen, onOpenChange }: UserAuthDialogProps) {
  const { createAndSignInUser, user } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
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

  const handleInteractOutside = (e: Event) => {
    // Prevent closing the dialog by clicking outside if it's essential.
    // e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={handleInteractOutside} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Set your display name to personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., John Angler"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !displayName} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
