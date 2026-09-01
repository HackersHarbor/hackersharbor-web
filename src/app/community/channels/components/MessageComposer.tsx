'use client'

import {
  FormEvent,
  KeyboardEvent,
  useId,
  useState,
  useRef,
  ChangeEvent,
} from 'react'

import {
  COLORS,
  MESSAGE_MAX_LENGTH,
  MESSAGE_PLACEHOLDER,
} from '../constants'

import type { MessageAttachment } from '../types'

type MessageComposerProps = {
  value: string

  onChange: (
    value: string,
  ) => void

  onSend: (
    attachments?: MessageAttachment[],
  ) => void

  disabled?: boolean
}

const LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'sql',
  'html',
  'css',
  'json',
  'bash',
  'plaintext',
]

const LANGUAGE_LABELS: Record<
  string,
  string
> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  bash: 'Bash',
  plaintext: 'Plain text',
}

const MAX_FILE_SIZE =
  10 * 1024 * 1024

const ACCEPTED_FILE_TYPES =
  'image/*,.txt,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json,.zip,.rar,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.php,.sql,.html,.css,.md'

export function MessageComposer({
  value,
  onChange,
  onSend,
  disabled = false,
}: MessageComposerProps) {
  const inputId = useId()

  const codeId = useId()

  const fileInputId = useId()

  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  const [
    codeOpen,
    setCodeOpen,
  ] = useState(false)

  const [
    codeLanguage,
    setCodeLanguage,
  ] = useState('python')

  const [
    codeValue,
    setCodeValue,
  ] = useState('')

  const [
    codeError,
    setCodeError,
  ] = useState('')

  const [
    attachments,
    setAttachments,
  ] = useState<MessageAttachment[]>([])

  const [
    attachmentError,
    setAttachmentError,
  ] = useState('')

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      disabled ||
      (!value.trim() &&
        attachments.length === 0)
    ) {
      return
    }

    onSend(
      attachments.length
        ? attachments
        : undefined,
    )

    setAttachments([])

    setAttachmentError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()

      if (
        !disabled &&
        (value.trim() ||
          attachments.length > 0)
      ) {
        onSend(
          attachments.length
            ? attachments
            : undefined,
        )

        setAttachments([])

        setAttachmentError('')

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const openCodeEditor = () => {
    if (disabled) return

    setCodeError('')

    setCodeOpen(true)
  }

  const closeCodeEditor = () => {
    setCodeOpen(false)

    setCodeError('')
  }

  const insertCode = () => {
    const trimmedCode =
      codeValue.trim()

    if (!trimmedCode) {
      setCodeError(
        'Write some code before inserting it.',
      )

      return
    }

    const formattedCode =
      `\`\`\`${codeLanguage}\n${trimmedCode}\n\`\`\``

    const nextValue =
      value.trim()
        ? `${value.trim()}\n\n${formattedCode}`
        : formattedCode

    onChange(
      nextValue.slice(
        0,
        MESSAGE_MAX_LENGTH,
      ),
    )

    setCodeOpen(false)

    setCodeValue('')

    setCodeError('')
  }

  const openFilePicker = () => {
    if (disabled) return

    setAttachmentError('')

    fileInputRef.current?.click()
  }

  const handleFiles = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      event.target.files ?? [],
    )

    if (!files.length) return

    const nextAttachments: MessageAttachment[] =
      []

    for (const file of files) {
      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setAttachmentError(
          `${file.name} is larger than 10 MB.`,
        )

        continue
      }

      const attachment: MessageAttachment =
        {
          id:
            typeof crypto !==
            'undefined' &&
            typeof crypto.randomUUID ===
              'function'
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,

          name: file.name,

          url: URL.createObjectURL(
            file,
          ),

          type:
            file.type ||
            'application/octet-stream',

          size: file.size,

          isImage:
            file.type.startsWith(
              'image/',
            ),
        }

      nextAttachments.push(
        attachment,
      )
    }

    if (nextAttachments.length) {
      setAttachments(
        current => [
          ...current,
          ...nextAttachments,
        ],
      )
    }

    event.target.value = ''
  }

  const removeAttachment = (
    attachmentId: string,
  ) => {
    setAttachments(
      current => {
        const attachment =
          current.find(
            item =>
              item.id ===
              attachmentId,
          )

        if (attachment) {
          URL.revokeObjectURL(
            attachment.url,
          )
        }

        return current.filter(
          item =>
            item.id !==
            attachmentId,
        )
      },
    )
  }

  const formatFileSize = (
    size: number,
  ) => {
    if (size < 1024) {
      return `${size} B`
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }

  const remaining =
    MESSAGE_MAX_LENGTH -
    value.length

  const canSend =
    !disabled &&
    Boolean(
      value.trim() ||
        attachments.length > 0,
    )

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: 'relative',
        padding:
          '12px 24px 15px',
        borderTop:
          `1px solid ${COLORS.border}`,
        background:
          COLORS.surface,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {codeOpen && (
        <div
          style={{
            position: 'absolute',
            left: '24px',
            right: '24px',
            bottom: '100%',
            marginBottom: '8px',
            padding: '14px',
            border:
              `1px solid ${COLORS.border}`,
            borderRadius: '9px',
            background:
              COLORS.surface,
            boxShadow:
              '0 10px 30px rgba(31,45,67,0.14)',
            zIndex: 100,
            boxSizing:
              'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'space-between',
              marginBottom:
                '10px',
            }}
          >
            <div>
              <div
                style={{
                  color:
                    COLORS.text,
                  fontSize: '11px',
                  lineHeight:
                    '15px',
                  fontWeight: 700,
                }}
              >
                Insert code
              </div>

              <div
                style={{
                  marginTop:
                    '2px',
                  color:
                    COLORS.textMuted,
                  fontSize: '8px',
                  lineHeight:
                    '12px',
                }}
              >
                Add a formatted
                code block to
                your message.
              </div>
            </div>

            <button
              type="button"
              onClick={
                closeCodeEditor
              }
              aria-label="Close code editor"
              style={{
                width: '27px',
                height: '27px',
                border:
                  `1px solid ${COLORS.border}`,
                borderRadius:
                  '6px',
                background:
                  COLORS.surfaceSoft,
                color:
                  COLORS.textMuted,
                cursor:
                  'pointer',
                fontFamily:
                  'inherit',
                fontSize: '14px',
                lineHeight:
                  '25px',
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: '8px',
              marginBottom:
                '8px',
            }}
          >
            <label
              htmlFor={codeId}
              style={{
                color:
                  COLORS.textMuted,
                fontSize: '8px',
                lineHeight:
                  '12px',
                fontWeight: 600,
              }}
            >
              Language
            </label>

            <select
              id={codeId}
              value={codeLanguage}
              onChange={event =>
                setCodeLanguage(
                  event.target
                    .value,
                )
              }
              style={{
                minWidth:
                  '125px',
                height: '29px',
                padding:
                  '0 8px',
                border:
                  `1px solid ${COLORS.border}`,
                borderRadius:
                  '6px',
                outline: 'none',
                background:
                  COLORS.surfaceSoft,
                color:
                  COLORS.text,
                cursor:
                  'pointer',
                fontFamily:
                  'inherit',
                fontSize: '9px',
              }}
            >
              {LANGUAGES.map(
                language => (
                  <option
                    key={language}
                    value={
                      language
                    }
                  >
                    {
                      LANGUAGE_LABELS[
                        language
                      ]
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <textarea
            value={codeValue}
            onChange={event =>
              setCodeValue(
                event.target
                  .value,
              )
            }
            placeholder={`Write your ${LANGUAGE_LABELS[codeLanguage]} code here...`}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            rows={9}
            style={{
              width: '100%',
              minHeight:
                '170px',
              maxHeight:
                '320px',
              resize:
                'vertical',
              padding:
                '11px 12px',
              border:
                `1px solid ${COLORS.border}`,
              borderRadius:
                '7px',
              outline: 'none',
              background:
                '#101828',
              color:
                '#E4E7EC',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
              fontSize: '10px',
              lineHeight:
                '16px',
              tabSize: 4,
              boxSizing:
                'border-box',
            }}
            onKeyDown={event => {
              if (
                event.key ===
                'Tab'
              ) {
                event.preventDefault()

                const target =
                  event.currentTarget

                const start =
                  target.selectionStart

                const end =
                  target.selectionEnd

                const nextValue =
                  codeValue.slice(
                    0,
                    start,
                  ) +
                  '    ' +
                  codeValue.slice(
                    end,
                  )

                setCodeValue(
                  nextValue,
                )

                requestAnimationFrame(
                  () => {
                    target.selectionStart =
                      start + 4

                    target.selectionEnd =
                      start + 4
                  },
                )
              }
            }}
          />

          {codeError && (
            <div
              role="alert"
              style={{
                marginTop:
                  '6px',
                color:
                  COLORS.textMuted,
                fontSize: '8px',
                lineHeight:
                  '12px',
              }}
            >
              {codeError}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'space-between',
              marginTop:
                '9px',
            }}
          >
            <span
              style={{
                color:
                  COLORS.textDim,
                fontSize: '8px',
                lineHeight:
                  '12px',
              }}
            >
              {codeValue.length}{' '}
              characters
            </span>

            <div
              style={{
                display: 'flex',
                gap: '6px',
              }}
            >
              <button
                type="button"
                onClick={
                  closeCodeEditor
                }
                style={{
                  padding:
                    '6px 10px',
                  border:
                    `1px solid ${COLORS.border}`,
                  borderRadius:
                    '6px',
                  background:
                    COLORS.surfaceSoft,
                  color:
                    COLORS.textMuted,
                  cursor:
                    'pointer',
                  fontFamily:
                    'inherit',
                  fontSize: '8px',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  insertCode
                }
                style={{
                  padding:
                    '6px 11px',
                  border:
                    `1px solid ${COLORS.blue}`,
                  borderRadius:
                    '6px',
                  background:
                    COLORS.blue,
                  color:
                    COLORS.white,
                  cursor:
                    'pointer',
                  fontFamily:
                    'inherit',
                  fontSize: '8px',
                  fontWeight: 700,
                }}
              >
                Insert code
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        multiple
        accept={
          ACCEPTED_FILE_TYPES
        }
        onChange={
          handleFiles
        }
        style={{
          display: 'none',
        }}
      />

      {attachments.length >
        0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '7px',
            marginBottom:
              '8px',
          }}
        >
          {attachments.map(
            attachment => (
              <div
                key={
                  attachment.id
                }
                style={{
                  position:
                    'relative',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: '8px',
                  padding:
                    '6px 8px',
                  border:
                    `1px solid ${COLORS.border}`,
                  borderRadius:
                    '7px',
                  background:
                    COLORS.surfaceSoft,
                  boxSizing:
                    'border-box',
                }}
              >
                {attachment.isImage ? (
                  <img
                    src={
                      attachment.url
                    }
                    alt={
                      attachment.name
                    }
                    style={{
                      width:
                        '42px',
                      height:
                        '42px',
                      objectFit:
                        'cover',
                      borderRadius:
                        '5px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width:
                        '42px',
                      height:
                        '42px',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      borderRadius:
                        '5px',
                      background:
                        COLORS.blueSoft,
                      color:
                        COLORS.blue,
                      fontSize:
                        '8px',
                      fontWeight: 700,
                      textTransform:
                        'uppercase',
                    }}
                  >
                    File
                  </div>
                )}

                <div
                  style={{
                    minWidth:
                      0,
                    maxWidth:
                      '180px',
                  }}
                >
                  <div
                    style={{
                      overflow:
                        'hidden',
                      textOverflow:
                        'ellipsis',
                      whiteSpace:
                        'nowrap',
                      color:
                        COLORS.text,
                      fontSize:
                        '8px',
                      lineHeight:
                        '12px',
                      fontWeight:
                        600,
                    }}
                  >
                    {
                      attachment.name
                    }
                  </div>

                  <div
                    style={{
                      marginTop:
                        '2px',
                      color:
                        COLORS.textDim,
                      fontSize:
                        '7px',
                      lineHeight:
                        '10px',
                    }}
                  >
                    {formatFileSize(
                      attachment.size,
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeAttachment(
                      attachment.id,
                    )
                  }
                  aria-label={`Remove ${attachment.name}`}
                  style={{
                    width:
                      '20px',
                    height:
                      '20px',
                    padding: 0,
                    border:
                      'none',
                    borderRadius:
                      '4px',
                    background:
                      'transparent',
                    color:
                      COLORS.textMuted,
                    cursor:
                      'pointer',
                    fontSize:
                      '13px',
                    lineHeight:
                      '20px',
                  }}
                >
                  ×
                </button>
              </div>
            ),
          )}
        </div>
      )}

      {attachmentError && (
        <div
          role="alert"
          style={{
            marginBottom:
              '6px',
            color:
              COLORS.textMuted,
            fontSize: '8px',
            lineHeight:
              '12px',
          }}
        >
          {attachmentError}
        </div>
      )}

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
        Write a message
      </label>

      <div
        style={{
          position:
            'relative',
        }}
      >
        <textarea
          id={inputId}
          value={value}
          onChange={event =>
            onChange(
              event.target.value.slice(
                0,
                MESSAGE_MAX_LENGTH,
              ),
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            MESSAGE_PLACEHOLDER
          }
          disabled={disabled}
          rows={2}
          spellCheck
          style={{
            width: '100%',
            minHeight:
              '58px',
            maxHeight:
              '180px',
            boxSizing:
              'border-box',
            resize:
              'vertical',
            padding:
              '10px 180px 10px 11px',
            border:
              `1px solid ${COLORS.border}`,
            borderRadius:
              '8px',
            outline: 'none',
            background:
              COLORS.surfaceSoft,
            color:
              COLORS.text,
            fontFamily:
              'inherit',
            fontSize: '10px',
            lineHeight: 1.5,
            opacity:
              disabled
                ? 0.6
                : 1,
          }}
        />

        <div
          style={{
            position:
              'absolute',
            right: '8px',
            bottom: '8px',
            display:
              'flex',
            alignItems:
              'center',
            gap: '5px',
          }}
        >
          <button
            type="button"
            disabled={
              disabled
            }
            onClick={
              openFilePicker
            }
            style={{
              padding:
                '6px 9px',
              border:
                `1px solid ${COLORS.border}`,
              borderRadius:
                '6px',
              background:
                COLORS.surface,
              color:
                COLORS.textMuted,
              cursor:
                disabled
                  ? 'not-allowed'
                  : 'pointer',
              fontSize:
                '8px',
              fontWeight:
                700,
              fontFamily:
                'inherit',
              opacity:
                disabled
                  ? 0.6
                  : 1,
            }}
            onMouseEnter={event => {
              if (disabled)
                return

              event.currentTarget.style.borderColor =
                COLORS.blue

              event.currentTarget.style.background =
                COLORS.blueSoft

              event.currentTarget.style.color =
                COLORS.blueDark
            }}
            onMouseLeave={event => {
              event.currentTarget.style.borderColor =
                COLORS.border

              event.currentTarget.style.background =
                COLORS.surface

              event.currentTarget.style.color =
                COLORS.textMuted
            }}
          >
            Upload
          </button>

          <button
            type="button"
            disabled={
              disabled
            }
            onClick={
              openCodeEditor
            }
            style={{
              padding:
                '6px 9px',
              border:
                `1px solid ${COLORS.border}`,
              borderRadius:
                '6px',
              background:
                COLORS.surface,
              color:
                COLORS.textMuted,
              cursor:
                disabled
                  ? 'not-allowed'
                  : 'pointer',
              fontSize:
                '8px',
              fontWeight:
                700,
              fontFamily:
                'inherit',
              opacity:
                disabled
                  ? 0.6
                  : 1,
            }}
            onMouseEnter={event => {
              if (disabled)
                return

              event.currentTarget.style.borderColor =
                COLORS.blue

              event.currentTarget.style.background =
                COLORS.blueSoft

              event.currentTarget.style.color =
                COLORS.blueDark
            }}
            onMouseLeave={event => {
              event.currentTarget.style.borderColor =
                COLORS.border

              event.currentTarget.style.background =
                COLORS.surface

              event.currentTarget.style.color =
                COLORS.textMuted
            }}
          >
            Code
          </button>

          <button
            type="submit"
            disabled={
              !canSend
            }
            style={{
              padding:
                '6px 11px',
              border:
                `1px solid ${
                  canSend
                    ? COLORS.blue
                    : COLORS.border
                }`,
              borderRadius:
                '6px',
              background:
                canSend
                  ? COLORS.blue
                  : COLORS.surfaceActive,
              color:
                canSend
                  ? COLORS.white
                  : COLORS.textDim,
              cursor:
                canSend
                  ? 'pointer'
                  : 'not-allowed',
              fontSize:
                '9px',
              fontWeight:
                700,
              fontFamily:
                'inherit',
            }}
          >
            {disabled
              ? 'Sending'
              : 'Send'}
          </button>
        </div>
      </div>

      <div
        style={{
          display:
            'flex',
          justifyContent:
            'space-between',
          marginTop:
            '5px',
          color:
            COLORS.textDim,
          fontSize:
            '8px',
          lineHeight:
            '12px',
        }}
      >
        <span>
          Enter to send ·
          Shift + Enter for
          a new line
        </span>

        <span
          style={{
            color:
              remaining <
              100
                ? COLORS.blue
                : COLORS.textDim,
          }}
        >
          {remaining}
        </span>
      </div>
    </form>
  )
}