'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IconChevronLeft, IconChevronRight, Icon360, IconCatalogue, IconPin } from './icons'

export type HeroSlide = {
  image: string
  subtitle: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const total = slides.length

  const go = useCallback((next: number) => {
    setIndex(((next % total) + total) % total)
  }, [total])

  // Tự động chuyển slide mỗi 6 giây, dừng khi chỉ có 1 slide
  useEffect(() => {
    if (total <= 1) return
    const t = setInterval(() => go(index + 1), 6000)
    return () => clearInterval(t)
  }, [index, total, go])

  const slide = slides[index]
  const titleWords = slide.title.split(' ')

  return (
    <section className="hero">
      {slides.map((s, i) => (
        <Image
          key={s.image + i}
          className="hero-bg"
          src={s.image}
          alt={s.title}
          fill
          priority={i === 0}
          sizes="100vw"
          quality={85}
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}

      <div className="container">
        <span className="eyebrow">{slide.subtitle}</span>
        <h1>
          {titleWords.map((word, i) => (
            <span key={i}>
              {word}
              {i < titleWords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
        <p>{slide.description}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn primary" href={slide.ctaHref}>
            {slide.ctaLabel} →
          </Link>
          <Link className="btn" href="/about">
            VỀ CHÚNG TÔI →
          </Link>
        </div>
      </div>

      {total > 1 && (
        <>
          <button aria-label="Slide trước" className="hero-arrow left" onClick={() => go(index - 1)}>
            <IconChevronLeft />
          </button>
          <button aria-label="Slide tiếp theo" className="hero-arrow right" onClick={() => go(index + 1)}>
            <IconChevronRight />
          </button>
          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Đến slide ${i + 1}`}
                className={`hero-dot${i === index ? ' active' : ''}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}

      <div className="hero-badges">
        <Link href="/factory" className="hero-badge">
          <Icon360 />
          <span>TRẢI NGHIỆM 360°</span>
        </Link>
        <Link href="/products" className="hero-badge">
          <IconCatalogue />
          <span>CATALOGUE</span>
        </Link>
        <Link href="/contact" className="hero-badge">
          <IconPin />
          <span>TÌM ĐẠI LÝ</span>
        </Link>
      </div>
    </section>
  )
}
