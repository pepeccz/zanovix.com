/**
 * reveal.ts — mecanismo global de reveals fade-up (IntersectionObserver)
 *
 * Consolidado desde el <script> inline de index.astro para que TODAS las
 * páginas compartan el mismo motor sin duplicar lógica. El CSS asociado vive
 * en motion.css (selectores html.js-reveal [data-reveal]).
 *
 * Garantía contenido-visible-por-defecto: el CSS sólo oculta [data-reveal]
 * bajo html.js-reveal, y esa clase se añade SOLO cuando el observer va a
 * correr. Sin JS o con reduced-motion, el contenido queda en su sitio.
 *
 * Uso en markup:
 *   <div data-reveal>...</div>                 — fade-up al entrar viewport
 *   <li data-reveal data-reveal-i="0">...</li> — stagger (60ms * i)
 */

function initReveals() {
  const items = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-init])')
  )
  if (items.length === 0) return

  const reduced =
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced || !('IntersectionObserver' in window)) {
    // Estado final directo, sin ocultar nada.
    items.forEach((el) => el.setAttribute('data-reveal-init', 'true'))
    return
  }

  // Activamos el modo oculto sólo ahora que vamos a animar.
  document.documentElement.classList.add('js-reveal')

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          const i = el.dataset.revealI
          if (i != null) el.style.setProperty('--reveal-i', i)
          el.classList.add('is-revealed')
          obs.unobserve(el)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )

  items.forEach((el) => {
    el.setAttribute('data-reveal-init', 'true')
    io.observe(el)
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveals)
} else {
  initReveals()
}
// Defensivo para cuando se introduzca ClientRouter (v1 hace full reload).
document.addEventListener('astro:page-load', initReveals)
