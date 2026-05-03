import { motion } from "framer-motion";

function PageTransition({ children, direction = "right" }) {
  const startX = direction === "left" ? -24 : 24;

  return (
    <motion.div
      initial={{ opacity: 0, x: startX }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;