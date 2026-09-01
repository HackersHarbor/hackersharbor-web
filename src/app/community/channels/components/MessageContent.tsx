'use client'

import type { Message } from '../types'

type MessageContentProps = {
  message: Message
}

export function MessageContent({
  message,
}: MessageContentProps) {
  return (
    <div
      style={{
        minWidth: 0,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: '13px',
          lineHeight: '20px',
          color: '#344054',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        {message.content}
      </div>

      {message.attachments &&
        message.attachments.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            {message.attachments.map(
              attachment => (
                <div
                  key={attachment.id}
                  style={{
                    maxWidth: '420px',
                  }}
                >
                  {attachment.isImage ? (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        textDecoration: 'none',
                      }}
                    >
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        style={{
                          display: 'block',
                          maxWidth: '100%',
                          maxHeight: '320px',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '10px',
                          border:
                            '1px solid #DDE4EF',
                          objectFit: 'contain',
                          background:
                            '#F7F9FC',
                        }}
                      />

                      <div
                        style={{
                          marginTop: '5px',
                          fontSize: '10px',
                          lineHeight: '14px',
                          color: '#667085',
                          overflow:
                            'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {attachment.name}
                      </div>
                    </a>
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={
                        attachment.name
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding:
                          '10px 12px',
                        border:
                          '1px solid #DDE4EF',
                        borderRadius: '9px',
                        background:
                          '#FFFFFF',
                        color: '#344054',
                        textDecoration:
                          'none',
                        boxSizing:
                          'border-box',
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          borderRadius:
                            '7px',
                          background:
                            '#EEF4FF',
                          color: '#2F6FED',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        FILE
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              '11px',
                            lineHeight:
                              '15px',
                            fontWeight:
                              600,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
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
                            fontSize:
                              '9px',
                            lineHeight:
                              '13px',
                            color:
                              '#98A2B3',
                          }}
                        >
                          {formatFileSize(
                            attachment.size,
                          )}
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              ),
            )}
          </div>
        )}
    </div>
  )
}

function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(
      bytes / 1024,
    )} KB`
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`
}