import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', intensity = 'medium', onClick, hover = true }: GlassCardProps) {
  const intensityClass = intensity === 'strong' ? 'glass-card-strong' : 'glass-card';

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`${intensityClass} rounded-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
