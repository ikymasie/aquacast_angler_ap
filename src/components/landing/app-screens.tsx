
import Image from 'next/image';

export function AppScreens() {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative flex justify-center items-center h-full min-h-[400px] md:min-h-[600px]">
          <div className="absolute w-[240px] md:w-[300px] transform -translate-x-1/2 -rotate-12">
            <Image
              src="https://placehold.co/400x800.png"
              width={400}
              height={800}
              alt="AquaCast app screen showing species selection"
              className="rounded-2xl shadow-card"
              data-ai-hint="app screenshot species"
            />
          </div>
          <div className="relative z-10 w-[280px] md:w-[340px]">
             <Image
              src="https://placehold.co/400x800.png"
              width={400}
              height={800}
              alt="AquaCast app screen showing the main forecast"
              className="rounded-2xl shadow-floating"
               data-ai-hint="app screenshot forecast"
            />
          </div>
          <div className="absolute w-[240px] md:w-[300px] transform translate-x-1/2 rotate-12">
             <Image
              src="https://placehold.co/400x800.png"
              width={400}
              height={800}
              alt="AquaCast app screen showing map details"
              className="rounded-2xl shadow-card"
               data-ai-hint="app screenshot map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
