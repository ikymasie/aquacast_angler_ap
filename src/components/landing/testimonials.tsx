
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "John D.",
    avatar: "https://placehold.co/40x40.png",
    hint: "man portrait",
    rating: 5,
    quote: "I was skeptical, but the recommendations are scarily accurate. Caught my personal best bass during a 'Good' window AquaCast found."
  },
    {
    name: "Mark F.",
    avatar: "https://placehold.co/40x40.png",
    hint: "angler photo",
    rating: 5,
    quote: "The offline maps are a game-changer for my remote river spots. I can still see everything without a cell signal."
  },
    {
    name: "Sarah P.",
    avatar: "https://placehold.co/40x40.png",
    hint: "woman fishing",
    rating: 5,
    quote: "Finally, an app that understands different species have different needs. The bream forecasts are spot-on."
  },
   {
    name: "David L.",
    avatar: "https://placehold.co/40x40.png",
    hint: "fisherman smiling",
    rating: 5,
    quote: "The pressure trend factor alone is worth it. AquaCast notified me of a drop and the bite was on fire."
  }
];

export function Testimonials() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-ink-900">Trusted by Anglers</h2>
        </div>
        <Carousel opts={{ loop: true, align: "start" }} className="w-full max-w-4xl mx-auto">
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="h-full">
                    <CardContent className="p-6 flex flex-col items-start gap-4">
                       <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <div className="flex">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400"/>
                                ))}
                            </div>
                          </div>
                       </div>
                      <blockquote className="text-ink-700 italic">“{testimonial.quote}”</blockquote>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
