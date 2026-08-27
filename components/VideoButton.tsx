'use client'
import { useState } from 'react'
import { IconPlay } from './icons'

export default function VideoButton({ videoUrl, label }: { videoUrl: string; label: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="play-btn" onClick={() => setOpen(true)}>
        <span className="play-btn-icon">
          <IconPlay size={22} />
        </span>
        <span>{label}</span>
      </button>

      {open && (
        <div className="video-modal" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="video-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" aria-label="Đóng video" onClick={() => setOpen(false)}>
              ✕
            </button>
            <div className="video-modal-frame">
              <iframe
                src={videoUrl}
                title={label}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
