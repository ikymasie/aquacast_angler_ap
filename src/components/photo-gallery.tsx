
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Image from 'next/image';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { UploadCloud, Trash2, Microscope, Loader2 } from 'lucide-react';
import { analyzePhotoAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from './ui/skeleton';

interface PhotoGalleryProps {
    spotName: string;
}

interface Photo {
    id: string;
    dataUrl: string;
}

export function PhotoGallery({ spotName }: PhotoGalleryProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, startAnalyzing] = useTransition();
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const getStorageKey = () => `gallery-photos-${spotName}`;

    useEffect(() => {
        setIsLoading(true);
        try {
            const storedPhotos = localStorage.getItem(getStorageKey());
            if (storedPhotos) {
                setPhotos(JSON.parse(storedPhotos));
            }
        } catch (e) {
            console.error("Failed to load photos from local storage", e);
        } finally {
            setIsLoading(false);
        }
    }, [spotName]);

    const savePhotos = (newPhotos: Photo[]) => {
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify(newPhotos));
            setPhotos(newPhotos);
        } catch (e) {
            console.error("Failed to save photos to local storage", e);
            toast({
                variant: 'destructive',
                title: 'Storage Error',
                description: 'Could not save photos to your device. Storage might be full.',
            });
        }
    };

    const handleAddPhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const newPhoto: Photo = { id: `photo_${Date.now()}`, dataUrl };
                savePhotos([...photos, newPhoto]);
                toast({ variant: 'success', title: 'Photo Added!' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = (photoId: string) => {
        const updatedPhotos = photos.filter(p => p.id !== photoId);
        savePhotos(updatedPhotos);
        toast({ variant: 'default', title: 'Photo Removed' });
    };

    const handleAnalyzePhoto = (dataUrl: string) => {
        startAnalyzing(async () => {
            setAnalysisResult(null);
            setIsAnalysisDialogOpen(true);
            const result = await analyzePhotoAction({ photoDataUri: dataUrl });
            if (result.error) {
                setAnalysisResult(`Error: ${result.error}`);
            } else {
                setAnalysisResult(result.data?.analysis || 'No analysis available.');
            }
        });
    };
    
    return (
        <Card className="p-4 rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline text-lg">My Catches</h3>
                <Button onClick={handleAddPhotoClick} size="sm">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Add Photo
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No catches logged for this spot yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="relative group aspect-square">
                            <Image src={photo.dataUrl} alt="User catch" layout="fill" objectFit="cover" className="rounded-lg" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                <Button size="icon" variant="secondary" onClick={() => handleAnalyzePhoto(photo.dataUrl)} disabled={isAnalyzing}>
                                    <Microscope className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="destructive" onClick={() => handleRemovePhoto(photo.id)}>
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <AlertDialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Photo Analysis</AlertDialogTitle>
                        <AlertDialogDescription>
                            AI-powered analysis of your catch.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div>
                        {isAnalyzing && !analysisResult ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <p>Analyzing photo...</p>
                            </div>
                        ) : (
                            <p className="text-sm">{analysisResult}</p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </Card>
    );
}
