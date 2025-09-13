"use client";

import { motion } from "framer-motion";
import React from "react";

interface CardProps {
  value: string;
  flipped: boolean;
  onClick: () => void;
  disabled?: boolean;
   isMobile?: boolean;
}

export default function Card({ value, flipped, onClick, disabled }: CardProps) {
  // animações Framer
  const containerVariants = {
    idle: { scale: 1, rotateY: 0 },
    flipped: { scale: 1, rotateY: 180 },
    matched: { scale: 1.05, rotateY: 180 },
  };

  const faceStyleBase =
    "absolute inset-0 flex items-center justify-center rounded-xl text-2xl sm:text-3xl font-bold backface-hidden shadow-md";

  return (
    <motion.div
      onClick={() => !disabled && onClick()}
      role="button"
      tabIndex={0}
      initial="idle"
      animate={flipped ? "flipped" : "idle"}
      whileTap={{ scale: 0.97 }}
      variants={containerVariants}
      transition={{ duration: 0.45, ease: "backOut" }}
      className="relative w-16 h-16 sm:w-20 sm:h-20 perspective"
      style={{ cursor: disabled ? "default" : "pointer", transformStyle: "preserve-3d" }}
    >
      {/* Frente (quando vira exibe emoji) */}
      <motion.div
        className={faceStyleBase + " bg-white text-black"}
        style={{ transform: "rotateY(180deg)" }}
      >
        {value}
      </motion.div>

      {/* Verso (quando não virada mostra ponto de interrogação) */}
      <motion.div
        className={faceStyleBase + " bg-gray-700 text-white"}
        style={{ transform: "rotateY(0deg)" }}
      >
        ❓
      </motion.div>

    </motion.div>
  );
}
