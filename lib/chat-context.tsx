'use client'

import { type ChatUIMessage } from '@/components/chat/types'
import { type ReactNode, createContext, useContext, useMemo, useRef, useState } from 'react'
import { Chat } from '@ai-sdk/react'
import { DataPart } from '@/ai/messages/data-parts'
import { DataUIPart } from 'ai'
import { useDataStateMapper } from '@/app/state'
import { mutate } from 'swr'
import { toast } from 'sonner'

interface ChatContextValue {
  chat: Chat<ChatUIMessage>
  config: {
    temp: number
    setTemp: (v: number) => void
    words: number
    setWords: (v: number) => void
  }
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const mapDataToState = useDataStateMapper()
  const mapDataToStateRef = useRef(mapDataToState)
  mapDataToStateRef.current = mapDataToState

  const [temp, setTemp] = useState(0.7)
  const [words, setWords] = useState(40)

  const chat = useMemo(
    () =>
      new Chat<ChatUIMessage>({
        // Pasamos los datos en la URL para evitar errores de tipos
        api: `/api/chat?temp=${temp}&words=${words}`,
        onToolCall: () => mutate('/api/auth/info'),
        onData: (data: DataUIPart<DataPart>) => mapDataToStateRef.current(data),
        onError: (error) => {
          toast.error(`Error: ${error.message}`)
        },
      }),
    [temp, words]
  )

  return (
    <ChatContext.Provider value={{ chat, config: { temp, setTemp, words, setWords } }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useSharedChatContext() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('ChatProvider faltante')
  return context
}
