import { useState } from 'react'

/**
 * Product gallery: one large frame, a strip of thumbnails under it.
 *
 * Deliberately not a lightbox or a carousel. The buyer's question here is
 * "is this the thing I think it is?", which is answered by seeing the frames
 * side by side, not by a modal that hides the price and the buy button.
 *
 * Falls back to a plain image when the item carries only one photo, so a
 * single-image product never renders an empty thumbnail rail.
 */
export default function Gallery({ images = [], main, alt, badge }) {
  const frames = [...new Set([main, ...images].filter(Boolean))]
  const [active, setActive] = useState(0)
  const current = frames[active] || main

  return (
    <div>
      <div className="relative rounded-card overflow-hidden bg-paper-200 border border-paper-300 aspect-square">
        {current ? (
          <img
            src={current}
            alt={alt}
            className="w-full h-full object-cover"
            // The first frame is the page's largest paint; the rest can wait.
            loading={active === 0 ? 'eager' : 'lazy'}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center spec">KHÔNG CÓ ẢNH</span>
        )}
        {badge}
      </div>

      {frames.length > 1 && (
        <div
          className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0"
          role="group"
          aria-label="Ảnh sản phẩm"
        >
          {frames.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ảnh ${i + 1} trong ${frames.length}`}
              aria-current={i === active}
              className={`shrink-0 w-[62px] h-[62px] rounded-[9px] overflow-hidden border-2 transition-colors duration-200 ${
                i === active ? 'border-ink' : 'border-paper-300 hover:border-slate-200'
              }`}
            >
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
