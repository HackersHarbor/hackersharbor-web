'use client'

import { useId } from 'react'

import {
  CHANNEL_SEARCH_PLACEHOLDER,
  COLORS,
} from '../constants'

type ChannelSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ChannelSearch({
  value,
  onChange,
}: ChannelSearchProps) {
  const inputId = useId()

  return (
    <div
      style={{
        padding: '14px 14px 13px',
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        boxSizing: 'border-box',
      }}
    >
      <label
        htmlFor={inputId}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Search channels
      </label>

      <div
        style={{
          position: 'relative',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '11px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.textDim,
            fontSize: '13px',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          ⌕
        </span>

        <input
          id={inputId}
          type="search"
          value={value}
          onChange={event =>
            onChange(event.target.value)
          }
          placeholder={CHANNEL_SEARCH_PLACEHOLDER}
          autoComplete="off"
          spellCheck={false}
          style={{
            width: '100%',
            height: '34px',
            boxSizing: 'border-box',
            padding: '0 10px 0 30px',
            borderRadius: '7px',
            border: `1px solid ${COLORS.border}`,
            outline: 'none',
            background: COLORS.background,
            color: COLORS.text,
            fontFamily: 'inherit',
            fontSize: '11px',
            lineHeight: '16px',
          }}
        />
      </div>
    </div>
  )
}