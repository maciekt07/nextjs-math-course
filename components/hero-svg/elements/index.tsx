import CharacterLaptop from "./character-laptop";
import GradCapBooks from "./grad-cap-books";
import GraduationCap from "./graduation-cap";
import LaptopBooks from "./laptop-books";
import Pen from "./pen";
import Pencil from "./pencil";
import SpeechBubble from "./speech-bubble";

export default function HeroElements() {
  return (
    <>
      <GradCapBooks />
      <Pen />
      <LaptopBooks />
      <Pencil />
      <CharacterLaptop />
      <SpeechBubble />
      <GraduationCap />
    </>
  );
}
