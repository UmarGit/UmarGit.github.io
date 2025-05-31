"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  originRect?: DOMRect | null;
}

export default function ImageLightbox({
  src,
  alt,
  isOpen,
  onClose,
  originRect,
}: ImageLightboxProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  // Calculate initial position and scale based on origin
  const getInitialTransform = () => {
    if (!originRect) return { x: 0, y: 0, scale: 0.8 };

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;

    return {
      x: originCenterX - centerX,
      y: originCenterY - centerY,
      scale: Math.min(originRect.width / 800, originRect.height / 600, 0.3),
    };
  };

  const initialTransform = getInitialTransform();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{
            opacity: 1,
            backdropFilter: "blur(12px)",
            transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
          }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)",
            transition: { duration: 0.4, ease: [0.55, 0.06, 0.68, 0.19] },
          }}
          className="fixed inset-0 z-50 bg-black/10 flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Image */}
          <motion.img
            ref={imageRef}
            src={src}
            alt={alt}
            className="max-w-[85vw] max-h-[85vh] object-contain cursor-zoom-out select-none"
            onClick={handleClose}
            initial={{
              x: initialTransform.x,
              y: initialTransform.y,
              scale: initialTransform.scale,
              opacity: 0.8,
            }}
            animate={{
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
            }}
            exit={{
              x: initialTransform.x,
              y: initialTransform.y,
              scale: initialTransform.scale,
              opacity: 0.8,
              transition: {
                duration: 0.4,
                ease: [0.55, 0.06, 0.68, 0.19],
              },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
