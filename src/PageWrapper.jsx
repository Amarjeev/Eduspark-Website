import { motion } from "framer-motion";

// Animation settings
const pageVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

const pageTransition = {
  duration: 0.6,
  ease: "easeInOut",
};

export default function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="" // ✅ no padding or margin added here
    >
      {children}
    </motion.div>
  );
}
