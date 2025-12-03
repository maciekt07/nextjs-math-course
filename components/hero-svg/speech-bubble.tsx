import { motion } from "framer-motion";
import { heroAnimation } from "./constants";

export default function SpeechBubble() {
  return (
    <motion.g
      id="Speech-Bubble"
      initial={{ opacity: 0, scale: 0, rotate: -20, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: [0, 1.2, 1], rotate: 0, filter: "none" }}
      transition={{
        delay: heroAnimation.speechBubble.delay,
        duration: 0.6,
        times: [0, 0.6, 1],
      }}
    >
      <g id="freepik--speech-bubble--inject-14_2">
        <motion.g
          id="freepik--speech-bubble--inject-14_3"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            id="freepik--speech-bubble--inject-14_4"
            d="M262.639 94.6919L277.789 86.7719C277.789 86.7719 287.399 89.2319 303.459 88.2819C327.209 86.8719 341.069 76.8419 337.539 62.7619C333.919 48.3319 318.039 42.6619 289.729 43.7619C254.319 45.1419 245.729 69.1519 266.869 83.3419L262.639 94.6919Z"
            fill="#4E65FF"
            fillOpacity={0.15}
          />
          <path
            id="\xCE\xA3"
            d="M304.42 74.8864V78H289.682V74.8864H304.42ZM303.818 55.0909V58.2045H289.489V55.0909H303.818ZM299.534 66.4318V66.7159L290.818 78H288.205V75.625L295.489 66.5909L288.205 57.5V55.0909H290.818L299.534 66.4318Z"
            fill="#4E65FF"
          />
          <path
            id="freepik--speech-bubble--inject-14_5"
            opacity={0.7}
            d="M262.639 94.6919L277.789 86.7719C277.789 86.7719 287.399 89.2319 303.459 88.2819C327.209 86.8719 341.069 76.8419 337.539 62.7619C333.919 48.3319 318.039 42.6619 289.729 43.7619C254.319 45.1419 245.729 69.1519 266.869 83.3419L262.639 94.6919Z"
            fill="white"
            fillOpacity={0.1}
          />
        </motion.g>
      </g>
    </motion.g>
  );
}
