
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
  const { user, updateUser } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!displayName.trim()) {
        toast({ variant: 'destructive', title: 'Please enter a display name.' });
        return;
    }
    
    startTransition(async () => {
      try {
        await updateUser(displayName);
        toast({ variant: 'success', title: 'Profile Created!', description: 'Welcome to AquaCast!' });
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to update profile", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save your profile. Please try again.' });
      }
    });
  };

  // Prevent closing the dialog by clicking outside or pressing Escape
  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={handleInteractOutside} hideCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Welcome to AquaCast!</DialogTitle>
          <DialogDescription>
            Let's set up your profile. Your phone number is used as your unique ID.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={user?.phone || ''} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder="e.g., John A."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !displayName} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// A small modification to the base DialogContent to allow hiding the close button
const OriginalDialogContent = require('@/components/ui/dialog').DialogContent;

OriginalDialogContent.defaultProps = {
    ...OriginalDialogContent.defaultProps,
    hideCloseButton: false
};

const PatchedDialogContent = ({ hideCloseButton, children, ...props }: any) => {
    return (
        <OriginalDialogContent {...props}>
            {children}
            {!hideCloseButton && OriginalDialogContent.defaultProps.children}
        </OriginalDialogContent>
    );
};

module.exports = {
    ...require('@/components/ui/dialog'),
    DialogContent: PatchedDialogContent
};
