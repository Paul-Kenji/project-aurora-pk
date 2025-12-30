"use client";
import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import { Card } from "./Card";
import { NextButton, PrevButton } from "./EmblaButtons";

type Slide = {
  id: number;
  url: string;
  title: string;
  description?: string;
};

type PropType = {
  slides: Slide[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  // Met à jour l'index sélectionné et l'état des boutons
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // initialisation

    // cleanup
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="embla ">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((video, index) => (
            <div
              key={video.id}
              className="embla__slide transition-opacity duration-300"
              style={{
                opacity: index === selectedIndex ? 1 : 0.4,
              }}
            >
              <Card
                url={video.url}
                title={video.title}
                description={video.description}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        <PrevButton
          onClick={() => emblaApi?.scrollPrev()}
          disabled={prevBtnDisabled}
        />
        <NextButton
          onClick={() => emblaApi?.scrollNext()}
          disabled={nextBtnDisabled}
        />
      </div>
    </section>
  );
};

export default EmblaCarousel;
