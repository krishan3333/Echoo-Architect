import type { LiveList } from "@liveblocks/client"
import type { AiChatMessage } from "./types/tasks"

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null
      thinking: boolean
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      chatMessages: LiveList<AiChatMessage>
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        cursorColor: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    // NOTE: Liveblocks requires RoomEvent to be a plain object type (not a union of objects)
    RoomEvent: {
      type: "ai:status" | "ai:thinking" | "ai:cursor" | "ai:canvas-op"
      // ai:status
      message?: string
      status?: "start" | "processing" | "complete" | "error"
      // ai:thinking
      thinking?: boolean
      // ai:cursor
      position?: { x: number; y: number } | null
      // ai:canvas-op
      triggeredBy?: string
      op?: { [key: string]: string | number | boolean | null }
    };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {};

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: {};
  }
}

export {};
