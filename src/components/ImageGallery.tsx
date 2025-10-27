"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openGallery = (index: number) => {
    setSelectedIndex(index);
  };

  const closeGallery = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-2 h-[500px]">
        <div
          className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden rounded-l-lg"
          onClick={() => openGallery(0)}
        >
          <Image
            src={images[0]}
            alt={`${title} - Main image`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className={`relative cursor-pointer overflow-hidden ${
              index === 1 ? "rounded-tr-lg" : ""
            } ${index === 3 ? "rounded-br-lg" : ""}`}
            onClick={() => openGallery(index + 1)}
          >
            <Image
              src={image}
              alt={`${title} - Image ${index + 2}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                +{images.length - 5} more
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={closeGallery}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {selectedIndex !== null && (
              <>
                <Image
                  src={images[selectedIndex]}
                  alt={`${title} - Image ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white"
                  onClick={closeGallery}
                >
                  <X className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                  {selectedIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
