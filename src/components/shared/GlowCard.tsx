import { useState, useRef, useCallback, type ReactNode, type MouseEvent, type CSSProperties } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  innerGradient?: string;
  enableTilt?: boolean;
  tiltIntensity?: number;
  onClick?: () => void;
}

export default function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(106, 18, 205, 0.5)',
  innerGradient = 'linear-gradient(145deg, rgba(106,18,205,0.06) 0%, rgba(155,89,214,0.04) 50%, rgba(192,132,252,0.02) 100%)',
  enableTilt = true,
  tiltIntensity = 10,
  onClick,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setGlowPos({ x: x * 100, y: y * 100 });

    if (enableTilt) {
      setTilt({
        x: (y - 0.5) * -tiltIntensity,
        y: (x - 0.5) * tiltIntensity,
      });
    }
  }, [enableTilt, tiltIntensity]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const cardStyle: CSSProperties = {
    transform: enableTilt
      ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`
      : `scale(${isHovered ? 1.02 : 1})`,
    transition: isHovered
      ? 'transform 0.1s ease, box-shadow 0.3s ease'
      : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
    transformStyle: 'preserve-3d' as const,
    boxShadow: isHovered
      ? `0 8px 32px ${glowColor.replace(/[\d.]+\)$/, '0.15)')}, 0 0 0 1px rgba(106,18,205,0.1)`
      : '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${className}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ background: innerGradient }}
      />

      {/* Glow follow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(350px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
        }}
      />

      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${glowPos.x}% ${glowPos.y}%, rgba(106,18,205,0.15), transparent 60%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      {/* Specular highlight */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(180px circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.08), transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
