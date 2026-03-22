'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Element } from '../../engine/types';
import { ELEMENT_COLORS } from '../../engine/elements';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'float' | 'burst' | 'trail' | 'rune';
}

interface ParticleCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  ambient?: boolean;
  element?: Element;
  burst?: { x: number; y: number; element: Element } | null;
}

export default function ParticleCanvas({
  width = 800,
  height = 600,
  className = '',
  ambient = true,
  element,
  burst,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const createAmbientParticle = useCallback((w: number, h: number): Particle => {
    const elements: Element[] = ['Fire', 'Arcane', 'Lightning', 'Shadow', 'Light'];
    const el = element || elements[Math.floor(Math.random() * elements.length)];
    const colors = ELEMENT_COLORS[el];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.5 - 0.2,
      life: Math.random() * 200 + 100,
      maxLife: 300,
      size: Math.random() * 3 + 1,
      color: colors.glow,
      alpha: Math.random() * 0.5 + 0.1,
      type: 'float',
    };
  }, [element]);

  const createBurstParticle = useCallback((x: number, y: number, el: Element): Particle => {
    const colors = ELEMENT_COLORS[el];
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 60,
      maxLife: 60,
      size: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? colors.primary : colors.glow,
      alpha: 1,
      type: 'burst',
    };
  }, []);

  useEffect(() => {
    if (burst) {
      for (let i = 0; i < 30; i++) {
        particlesRef.current.push(createBurstParticle(burst.x, burst.y, burst.element));
      }
    }
  }, [burst, createBurstParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add ambient particles
      if (ambient && particlesRef.current.length < 40) {
        particlesRef.current.push(createAmbientParticle(canvas.width, canvas.height));
      }

      // Update and draw
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.alpha = Math.max(0, (p.life / p.maxLife) * (p.type === 'burst' ? 1 : 0.5));

        if (p.life <= 0) return false;
        if (p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 10) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Glow effect
        if (p.type === 'burst' || p.size > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.2;
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        return true;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [ambient, createAmbientParticle]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
    />
  );
}
