import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="card"
    >
      <div className="flex flex-between flex-center">
        <div>
          <p className="text-muted" style={{ fontSize: '12px', marginBottom: '8px' }}>{title}</p>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: `var(--${color})` }}>{value}</h2>
        </div>
        {icon && <div style={{ fontSize: '32px' }}>{icon}</div>}
      </div>
    </motion.div>
  );
};

export default StatsCard;


