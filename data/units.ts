import { Unit } from "@/types/learning";

export const UNITS: Unit[] = [
  {
    id: "es-unit-1",
    languageCode: "es",
    title: "Salam & Dasar",
    description: "Mulai belajar bahasa Spanyol dengan frasa sehari-hari",
    order: 1,
    lessonIds: ["es-lesson-1", "es-lesson-2", "es-lesson-3"],
  },
  {
    id: "fr-unit-1",
    languageCode: "fr",
    title: "Bonjour! Salam",
    description: "Belajar menyapa dan memperkenalkan diri dalam bahasa Prancis",
    order: 1,
    lessonIds: [
      "fr-lesson-1",
      "fr-lesson-2",
      "fr-lesson-3",
      "fr-lesson-4",
      "fr-lesson-5",
    ],
  },
  {
    id: "ja-unit-1",
    languageCode: "ja",
    title: "はじめまして - Langkah Pertama",
    description: "Belajar frasa penting bahasa Jepang saat bertemu orang",
    order: 1,
    lessonIds: [
      "ja-lesson-1",
      "ja-lesson-2",
      "ja-lesson-3",
      "ja-lesson-4",
      "ja-lesson-5",
    ],
  },
  {
    id: "de-unit-1",
    languageCode: "de",
    title: "Hallo! Dasar Bahasa Jerman",
    description: "Kuasai salam dan perkenalan sehari-hari dalam bahasa Jerman",
    order: 1,
    lessonIds: [
      "de-lesson-1",
      "de-lesson-2",
      "de-lesson-3",
      "de-lesson-4",
      "de-lesson-5",
    ],
  },
  {
    id: "en-unit-1",
    languageCode: "en" as Unit["languageCode"],
    title: "Hello! Dasar Bahasa Inggris",
    description:
      "Mulai belajar bahasa Inggris dengan salam dan frasa sederhana",
    order: 1,
    lessonIds: [
      "en-lesson-1",
      "en-lesson-2",
      "en-lesson-3",
      "en-lesson-4",
      "en-lesson-5",
    ],
  },
  {
    id: "ar-unit-1",
    languageCode: "ar" as Unit["languageCode"],
    title: "مرحبا! Dasar Bahasa Arab",
    description: "Belajar salam dan perkenalan sederhana dalam bahasa Arab",
    order: 1,
    lessonIds: [
      "ar-lesson-1",
      "ar-lesson-2",
      "ar-lesson-3",
      "ar-lesson-4",
      "ar-lesson-5",
    ],
  },
];
