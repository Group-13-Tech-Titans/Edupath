import React from 'react';
import { motion } from 'framer-motion';

const PageShell = ({ children, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      {title && <h1 className="mb-md">{title}</h1>}
      {children}
    </motion.div>
  );
};

export default PageShell;


