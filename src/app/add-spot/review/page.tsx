
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Check, ArrowLeft, Video, VideoOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ReviewSpotPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const spotId = searchParams.get('id');
    const [spot, setSpot] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [photoData, setPhotoData] = useState<string | null>(null);

    useEffect(() => {
        if (!spotId) {
            router.replace('/add-spot');
            return;
        }

        try {
            const allSpots = JSON.parse(localStorage.getItem('user-spots') || '[]');
            const currentSpot = allSpots.find((s: any) => s.id === spotId);
            if (currentSpot) {
                setSpot(currentSpot);
            } else {
                toast({ variant: 'destructive', title: 'Spot not found' });
                router.replace('/');
            }
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Could not load spot data' });
        } finally {
            setIsLoading(false);
        }
    }, [spotId, router, toast]);
    
    useEffect(() => {
        const getCameraPermission = async () => {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setHasCameraPermission(false);
                return;
          }
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
          }
        };
    
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    const takePicture = () => {
        if (!videoRef.current || !photoRef.current) return;
        const video = videoRef.current;
        const photo = photoRef.current;
        
        const width = video.videoWidth;
        const height = video.videoHeight;
        
        photo.width = width;
        photo.height = height;

        const context = photo.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, width, height);
            const dataUrl = photo.toDataURL('image/jpeg');
            setPhotoData(dataUrl);
        }
    };

    const handleFinish = () => {
        // Only update local storage if a new photo was actually taken.
        // The spot with a placeholder image is already saved from the previous step.
        if (photoData && spot) {
            try {
                 const allSpots = JSON.parse(localStorage.getItem('user-spots') || '[]');
                 const spotIndex = allSpots.findIndex((s: any) => s.id === spot.id);
                 if (spotIndex > -1) {
                    allSpots[spotIndex].image_url = photoData;
                    localStorage.setItem('user-spots', JSON.stringify(allSpots));
                    toast({
                        title: "Photo Saved!",
                        description: "Your spot's image has been updated.",
                        variant: 'success'
                    });
                 }
            } catch (e) {
                console.error("Could not update spot with photo", e);
                 toast({
                    title: "Error Saving Photo",
                    description: "Could not save the new image.",
                    variant: 'destructive'
                });
            }
        } else {
             toast({
                title: "Spot Saved!",
                description: "Your new spot is ready to use.",
                variant: 'success'
            });
        }
        router.push('/');
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Skeleton className="w-full max-w-md h-96" /></div>
    }

    if (!spot) {
        return null;
    }

    const displayImage = photoData || spot.image_url;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 md:p-6 space-y-4 pb-24">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-h2">Review Your New Spot</CardTitle>
                        <CardDescription>Optionally, take a picture to remember this location.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-lg">{spot.name}</h4>
                            <p className="text-muted-foreground">{spot.notes}</p>
                        </div>
                        
                        <div className="relative aspect-video w-full bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                            {hasCameraPermission && !photoData ? (
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={displayImage} alt="Spot capture" className="w-full h-full object-cover" />
                            )}
                            
                            {hasCameraPermission === false && !photoData && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center p-4">
                                    <VideoOff className="w-10 h-10 mb-2"/>
                                    <p className="font-semibold">Camera Not Available</p>
                                    <p className="text-sm">Permissions denied or no camera found.</p>
                                </div>
                            )}
                        </div>
                        
                        <canvas ref={photoRef} style={{ display: 'none' }} />

                        {hasCameraPermission === false && (
                           <Alert variant="destructive">
                                <AlertTitle>Camera Access Denied</AlertTitle>
                                <AlertDescription>
                                You can still save your spot. To add a photo later, enable camera permissions in your browser settings.
                                </AlertDescription>
                            </Alert>
                        )}
                       
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        {photoData ? (
                             <Button variant="outline" onClick={() => setPhotoData(null)}>Retake Photo</Button>
                        ) : (
                             <Button onClick={takePicture} disabled={!hasCameraPermission}>
                                <Camera className="w-4 h-4 mr-2" />
                                Take Picture
                            </Button>
                        )}
                       
                        <Button onClick={handleFinish}>
                            <Check className="w-4 h-4 mr-2" />
                            Finish
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <BottomNav />
        </div>
    );
}
