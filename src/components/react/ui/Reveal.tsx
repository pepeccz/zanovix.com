/**
 * Reveal.tsx — React island con IntersectionObserver puro (0KB de lib motion)
 *
 * Al cruzar el viewport threshold, añade la clase CSS 'is-revealed' al wrapper.
 * La transición real está definida en motion.css (.reveal → .reveal.is-revealed).
 *
 * Props:
 *   as          — tag del wrapper (default: 'div')
 *   delay       — delay adicional en ms antes de revelar (default: 0)
 *   threshold   — IO threshold (default: 0.15)
 *   rootMargin  — IO rootMargin (default: '0px 0px -40px 0px')
 *   className   — clases adicionales para el wrapper
 *   style       — estilos inline adicionales
 *
 * Reduced-motion: si data-motion="reduced" está en <html>, el contenido
 * se muestra directamente en estado final sin transición.
 *
 * REQ-MS-6: IntersectionObserver puro, 0KB de lib motion.
 * ADR-008: React island justificado por extensibilidad de props.
 * ADR-010: Sin animation-timeline (soporte parcial en Firefox).
 */

import { useEffect, useRef } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  as?: ElementType
  delay?: number
  threshold?: number
  rootMargin?: string
  className?: string
  style?: CSSProperties
}

export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced-motion: estado final directo, sin observer
    const reduced =
      document.documentElement.dataset.motion === 'reduced' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      el.classList.add('is-revealed')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => el.classList.add('is-revealed'), delay)
          } else {
            el.classList.add('is-revealed')
          }
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [delay, threshold, rootMargin])

  return (
    // @ts-expect-error — Tag dinámico como ElementType válido
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  )
}
