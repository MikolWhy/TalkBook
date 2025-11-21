"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface XPNotificationProps {
  xp: number;
  show: boolean;
  onComplete: () => void;
  leveledUp?: boolean;
  oldLevel?: number;
  newLevel?: number;
}

const encouragingMessages = [
  "You're on fire! 🔥",
  "Incredible progress!",
  "Keep crushing it!",
  "You're unstoppable!",
  "Amazing dedication!",
  "You're a journaling legend!",
  "Phenomenal growth!",
  "Outstanding achievement!",
  "You're leveling up in life!",
  "Brilliant work!",
  "You're writing history!",
  "Absolutely legendary!",
  "Your consistency is inspiring!",
  "You're becoming a master!",
  "Excellence achieved!",
];

export default function XPNotification({ xp, show, onComplete, leveledUp, oldLevel, newLevel }: XPNotificationProps) {
  const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, leveledUp ? 5000 : 3000); // Show longer if leveled up

      return () => clearTimeout(timer);
    }
  }, [show, leveledUp, onComplete]);

  return (
    <AnimatePresence>
      {show && leveledUp && newLevel ? (
        // FULL SCREEN LEVEL UP CELEBRATION
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative max-w-2xl w-full mx-4"
          >
            {/* Confetti Background Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -100, x: Math.random() * 100 - 50, opacity: 1 }}
                  animate={{
                    y: [null, 800],
                    x: [null, Math.random() * 200 - 100],
                    rotate: [0, Math.random() * 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute text-4xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-50px',
                  }}
                >
                  {['🎉', '⭐', '✨', '🏆', '🎊', '💫', '🌟', '👑'][Math.floor(Math.random() * 8)]}
                </motion.div>
              ))}
            </div>

            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-12 rounded-3xl shadow-2xl border-4 border-yellow-300">
              {/* Glowing Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 opacity-50 blur-xl animate-pulse"></div>

              <div className="relative z-10 text-center space-y-6">
                {/* Trophy Animation */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="text-9xl mb-4"
                >
                  🏆
                </motion.div>

                {/* Level Up Text */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-6xl md:text-7xl font-black text-white mb-2 drop-shadow-2xl tracking-tight">
                    LEVEL UP!
                  </h1>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-5xl font-bold text-yellow-100"
                    >
                      {oldLevel || (newLevel ? newLevel - 1 : 1)}
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="text-4xl"
                    >
                      →
                    </motion.div>
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-6xl font-black text-white drop-shadow-lg"
                    >
                      {newLevel}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Encouraging Message */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-3xl font-bold text-yellow-100 mb-4"
                >
                  {randomMessage}
                </motion.p>

                {/* XP Earned */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl py-4 px-8 inline-block border-2 border-yellow-300"
                >
                  <p className="text-2xl font-bold text-yellow-100 drop-shadow-lg">
                    +{xp} XP Earned
                  </p>
                </motion.div>

                {/* Sparkle Effects */}
                <div className="flex justify-center gap-6 mt-6">
                  {['⭐', '✨', '💫'].map((emoji, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="text-5xl"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : show ? (
        // REGULAR XP NOTIFICATION (Top-right corner)
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed top-20 right-4 md:right-8 z-[9999] pointer-events-none"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3, repeat: 1 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-xl border-2 border-blue-300 flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-3xl"
            >
              ⭐
            </motion.div>
            <div>
              <p className="font-bold text-lg">+{xp} XP</p>
              <p className="text-sm opacity-90">Keep writing!</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

