"use client";

import { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "../components/ui/EmblaCarousel";
import Image from "next/image";
import GptPng from "../../assets/gpt-end-year.png";

import "./css/base.css";
import "./css/embla.css";

const videos = [
  {
    id: 1,
    url: "https://www.youtube.com/watch?v=_Enc4_VI9AA",
    title: "Believe",
    description:
      "Project with the company Audensiel, as intern in an Agile team, developing the front part of an mobile application in React Native for allowing artist to easily read differents data from different stream application.",
  },
  {
    id: 2,
    url: "https://www.youtube.com/watch?v=baB8PiPo8G4",
    title: "Babylon JS",
    description:
      "Project of a 3D game using Babylon JS  during my Master degree in Université Côte d'Azur.",
  },
  {
    id: 3,
    url: "https://www.youtube.com/watch?v=_MpY6IzxEKg",
    title: "AnneFlix",
    description:
      "Project of a video streaming platform based on Netflix, during my engineering degree at ESTIA.",
  },
];

const OPTIONS: EmblaOptionsType = { loop: true };

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-4xl font-bold mb-6">About Me</h1>

      <p className="text-gray-300 max-w-3xl text-justify mb-4">
        My name is Paul-Kenji Bochaton. I am a full-stack developer with
        professional experience in building modern, scalable applications. I
        primarily work with TypeScript and Java, and I have strong expertise in
        front-end technologies such as React and React Native, as well as
        back-end development and system architecture.
      </p>

      <p className="text-gray-300 max-w-3xl text-justify mb-4">
        I am originally from France and have had the opportunity to work
        internationally, including professional experiences in Japan and Canada.
        These environments have allowed me to adapt to different work cultures
        and strengthen my ability to collaborate on complex, real-world
        projects.
      </p>

      <p className="text-gray-300 max-w-3xl text-justify mb-10">
        I hold a Bachelor's degree in Computer Science from the University of
        Bordeaux, a Master's degree from Université Côte d’Azur (MBDS / MIAGE),
        as well as an Engineering degree from ESTIA. My academic background,
        combined with my professional experience, has given me a solid
        foundation in software engineering, application development, and
        problem-solving.
      </p>

      <p className="text-gray-400 max-w-3xl text-justify mb-6">
        The videos below present a selection of academic and professional
        projects I have had the opportunity to work on, showcasing both
        technical and practical aspects of my work.
      </p>

      <div className="flex flex-col text-white mb-6">
        <EmblaCarousel slides={videos} options={OPTIONS} />
      </div>

      <h1 className="text-xl font-bold mb-6">The Full-Stack Firefighter</h1>

      <p className="text-gray-300 max-w-3xl text-justify mb-10">
        Recruiters often ask how others would describe you. Well, in a playful
        retrospective, ChatGPT decided to describe me as follows:
      </p>

      <Image
        className="rounded-xl"
        src={GptPng}
        width={360}
        height={320}
        alt="GPT Card"
      />
    </div>
  );
}
