import type { ImageMetadata } from "astro";
const images = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/hardware/*.webp",
  { eager: true },
);
export const hardwareImages = Object.fromEntries(
  Object.entries(images).map(([path, module]) => [
    path.split("/").pop()!.replace(".webp", ""),
    module.default,
  ]),
);
