"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number; phase: number };

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = context;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: -1000, y: -1000 };
    let particles: Particle[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let animation = 0;

    const seed = (count: number) => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.6 + 0.45,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      seed(Math.min(100, Math.round((width * height) / 11500)));
      draw(true);
    };

    const draw = (still = false) => {
      ctx.clearRect(0, 0, width, height);
      const time = frame * 0.012;

      // A few slow, luminous color fields give the dark sky some depth.
      const glow = (x: number, y: number, radius: number, color: string) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      };
      glow(width * (0.72 + Math.sin(time * 0.32) * 0.09), height * (0.34 + Math.cos(time * 0.27) * 0.1), Math.max(width, height) * 0.43, "rgba(34,145,197,0.13)");
      glow(width * (0.84 + Math.cos(time * 0.21) * 0.08), height * 0.78, Math.max(width, height) * 0.3, "rgba(111,68,185,0.11)");

      const linkDistance = width < 700 ? 90 : 122;
      particles.forEach((p, i) => {
        if (!still && !reduced.matches) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += 0.015;
          if (p.x < -5) p.x = width + 5;
          if (p.x > width + 5) p.x = -5;
          if (p.y < -5) p.y = height + 5;
          if (p.y > height + 5) p.y = -5;
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 105 && distance > 0) {
            const force = (105 - distance) / 105 * 0.018;
            p.x += dx * force;
            p.y += dy * force;
          }
        }
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const distance = Math.hypot(p.x - q.x, p.y - q.y);
          if (distance < linkDistance) {
            ctx.strokeStyle = `rgba(122,209,221,${(1 - distance / linkDistance) * 0.21})`;
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        const pulse = 0.58 + Math.sin(p.phase + time) * 0.23;
        ctx.fillStyle = `rgba(184,235,205,${pulse})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!still && !reduced.matches) {
        frame++;
        animation = window.requestAnimationFrame(() => draw());
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onPointerLeave = () => { pointer.x = -1000; pointer.y = -1000; };
    const onMotionChange = () => {
      window.cancelAnimationFrame(animation);
      if (reduced.matches) draw(true);
      else draw();
    };

    resize();
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    reduced.addEventListener("change", onMotionChange);
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(animation);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      reduced.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}
