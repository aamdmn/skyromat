import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ExerciseResultProps {
  isCorrect: boolean | null;
  explanation?: string;
}

export function ExerciseResult({
  isCorrect,
  explanation,
}: ExerciseResultProps) {
  if (isCorrect === null) return null;

  if (isCorrect) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            damping: 15,
            stiffness: 300,
            duration: 0.6,
          },
        }}
        className="rounded-xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-green-50 p-6 text-center backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            transition: {
              type: 'spring',
              damping: 10,
              stiffness: 400,
              delay: 0.3,
            },
          }}
          className="mb-3"
        >
          <CheckCircle className="mx-auto h-6 w-6 text-emerald-500" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.4, duration: 0.4 },
          }}
          className="mb-1 font-semibold text-emerald-900 text-lg"
        >
          Správne!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 0.5, duration: 0.4 },
          }}
          className="text-emerald-700 text-sm"
        >
          Grafy sa zhodujú 🎉
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          type: 'spring',
          damping: 20,
          stiffness: 300,
        },
      }}
      className="rounded-xl border border-rose-200/50 bg-gradient-to-r from-rose-50 to-red-50 p-4 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
            transition: {
              type: 'spring',
              damping: 15,
              stiffness: 300,
              delay: 0.1,
            },
          }}
        >
          <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 0.2, duration: 0.3 },
            }}
            className="mb-2 font-medium text-rose-900 text-sm"
          >
            Skúste znova
          </motion.p>
          {explanation && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.3, duration: 0.4 },
              }}
              className="text-rose-700 text-xs leading-relaxed"
            >
              {explanation}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
