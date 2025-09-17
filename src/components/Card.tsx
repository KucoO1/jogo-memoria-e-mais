"use client";

import { motion } from "framer-motion";
import React from "react";

interface CardProps {
  value: string;
  flipped: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function Card({ value, flipped, onClick, disabled }: CardProps) {
  const containerVariants = {
    idle: { scale: 1, rotateY: 0 },
    flipped: { scale: 1, rotateY: 180 },
    matched: { scale: 1.05, rotateY: 180 },
  };

  const faceStyleBase =
    "absolute inset-0 flex items-center justify-center rounded-lg sm:rounded-xl text-xl sm:text-3xl font-bold backface-hidden shadow-md";

  return (
    <motion.div
      onClick={() => !disabled && onClick()}
      role="button"
      tabIndex={0}
      initial="idle"
      animate={flipped ? "flipped" : "idle"}
      whileTap={{ scale: 0.97 }}
      variants={containerVariants}
      transition={{ duration: 0.4, ease: "backOut" }}
      className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 perspective"
      style={{ cursor: disabled ? "default" : "pointer", transformStyle: "preserve-3d" }}
    >
      {/* Frente (emoji) */}
      <motion.div
        className={faceStyleBase + " bg-white text-black"}
        style={{ transform: "rotateY(180deg)" }}
      >
        {value}
      </motion.div>

      {/* Verso (interrogação) */}
      <motion.div
        className={faceStyleBase + " bg-gray-700 text-white"}
        style={{ transform: "rotateY(0deg)" }}
      >
        ❓
      </motion.div>
    </motion.div>
  );
}