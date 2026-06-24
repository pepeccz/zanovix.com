/**
 * schema.ts — Schema.org JSON-LD helpers for zanovix.com
 *
 * Exports:
 *   ORGANIZATION — Organization entity (site-wide, injected in Base.astro)
 *   WEBSITE      — WebSite entity (site-wide, injected in Base.astro)
 *   service()    — Service entity factory (per service page)
 *   faqPage()    — FAQPage entity factory (per page with real visible Q&A)
 */

export const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://zanovix.com/#organization',
  name: 'Zanovix',
  url: 'https://zanovix.com',
  logo: 'https://zanovix.com/apple-touch-icon.png',
  description: 'IA aplicada a la pyme con ingenieria pausada. Desde Malaga.',
  email: 'info@zanovix.com',
  telephone: '+34684765696',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Mijas',
    postalCode: '29650',
    addressRegion: 'Malaga',
    addressCountry: 'ES',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Espana',
  },
  sameAs: ['https://github.com/pepeccz'],
} as const

export const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://zanovix.com/#website',
  url: 'https://zanovix.com',
  name: 'Zanovix',
  inLanguage: 'es-ES',
  publisher: {
    '@id': 'https://zanovix.com/#organization',
  },
} as const

interface ServiceOptions {
  name: string
  description: string
  serviceType: string
  url: string
}

export function service(opts: ServiceOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    provider: {
      '@id': 'https://zanovix.com/#organization',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Espana',
    },
    url: opts.url,
  }
}

interface FaqItem {
  question: string
  answer: string
}

export function faqPage(items: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
