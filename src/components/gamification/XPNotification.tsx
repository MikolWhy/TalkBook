"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

interface XPNotificationProps {
  xp: number;
  show: boolean;
  onComplete: () => void;
  leveledUp?: boolean;
  oldLevel?: number;
  newLevel?: number;
}

const encouragingMessages = [
  "Incredible progress!",
  "Keep crushing it!",
  "You're unstoppable!",
  "Amazing dedication!",
  "Phenomenal growth!",
  "Outstanding achievement!",
  "You're leveling up in life!",
  "Brilliant work!",
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
      }, leveledUp ? 15000 : 3000); // 15 seconds for level up, 3 seconds for regular XP

      return () => clearTimeout(timer);
    }
  }, [show, leveledUp, onComplete]);

  return (
    <AnimatePresence>
      {show && leveledUp && newLevel ? (
        // LEVEL UP CELEBRATION - Clean & Professional
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Card */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Subtle gradient accent at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              
              {/* Floating particles background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 100, x: Math.random() * 100 - 50, opacity: 0.6 }}
                    animate={{
                      y: -100,
                      x: Math.random() * 50 - 25,
                      opacity: [0.6, 0.3, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 0.5,
                      ease: "easeOut",
                      repeat: Infinity,
                    }}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      bottom: '-20px',
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400/50" />
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 p-8 sm:p-12">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-xl opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Level Up Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Level Up!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {randomMessage}
                  </p>
                </motion.div>

                {/* Level Progression Timeline */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-center gap-4">
                    {/* Previous Level */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                          {oldLevel || (newLevel ? newLevel - 1 : 1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Previous</span>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.div>

                    {/* New Level */}
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-2 shadow-lg">
                        <span className="text-2xl font-bold text-white">
                          {newLevel}
                        </span>
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Current</span>
                    </motion.div>
                  </div>

                  {/* Progress Bar */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-6 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    ></motion.div>
                  </motion.div>
                </motion.div>

                {/* XP Earned Badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-full px-6 py-3">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      +{xp} XP Earned
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Dismiss hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="px-8 pb-6 text-center"
              >
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Click anywhere to continue
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : show ? (
        // REGULAR XP NOTIFICATION - Clean Toast Style
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-20 right-4 md:right-8 z-[9999] pointer-events-none"
        >
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex-shrink-0"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            <div>
              <p className="font-semibold text-base">+{xp} XP</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Keep it up!</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
