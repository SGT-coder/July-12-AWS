
"use client";

import * as React from 'react';
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface RoleSelectorProps {
  onSelectView: (view: 'form' | 'approver-login') => void;
}

const images = [
  "https://ahri.gov.et/storage/2021/03/AHRI-New-building.png",
  "https://image.panoramanyheter.no/197342.webp?imageId=197342&width=960&height=642&format=jpg",
  "https://ahri.gov.et/wp-content/uploads/2022/02/EPHI-VISIT-3-600x450.jpg",
  "https://ahri.gov.et/storage/2021/03/SAB-members.png",
  "https://ahri.gov.et/storage/2023/10/2.jpg",
  "https://ahri.gov.et/wp-content/uploads/2022/08/AHRI-UPDATED-LOGO1.jpg",
];

export function RoleSelector({ onSelectView }: RoleSelectorProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <div className="relative w-full h-full min-h-screen">
      <Carousel
        plugins={[plugin.current]}
        className="absolute inset-0 -z-10 w-full h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full h-screen">
                <Image
                  src={src}
                  alt={`AHRI background image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-screen overflow-y-auto p-4 md:p-8">
        <div className="flex flex-col items-center justify-center w-full max-w-3xl">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl drop-shadow-md">
                ወደ አህሪ የስራ ፍሰት እንኳን በደህና መጡ
                </h1>
                <p className="mt-4 text-lg leading-8 text-foreground/80 drop-shadow-sm">
                ለበለጠ ውጤታማነት ስትራቴጂካዊ ዕቅድን በዲጂታል መልክ ማደራጀት።
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-xl">
                <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card/80">
                <CardHeader className="items-center text-center p-6 flex-grow">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <User className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">የሰራተኛ ተጠቃሚ</CardTitle>
                    <CardDescription>
                    የስትራቴጂክ ዕቅድ እና የሥራ እንቅስቃሴ ቅጾችን ይሙሉ እና ያስገቡ።
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center px-6 pb-6">
                    <Button onClick={() => onSelectView("form")} className="w-full">
                    እንደ ተጠቃሚ ይቀጥሉ
                    </Button>
                </CardContent>
                </Card>
                
                <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card/80">
                <CardHeader className="items-center text-center p-6 flex-grow">
                    <div className="p-4 bg-accent/10 rounded-full mb-4">
                    <Briefcase className="h-10 w-10 text-accent" />
                    </div>
                    <CardTitle className="font-headline text-2xl">የባለሙያ መግቢያ</CardTitle>
                    <CardDescription>
                    ገምጋሚዎች እና አስተዳዳሪዎች ለመግባት እዚህ ይጫኑ።
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center px-6 pb-6">
                    <Button onClick={() => onSelectView("approver-login")} className="w-full" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                    ይግቡ
                    </Button>
                </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

    
