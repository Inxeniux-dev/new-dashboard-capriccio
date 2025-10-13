"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Image, Phone, Video, MoreVertical, ArrowLeft, Bot, User, UserCheck } from "lucide-react";
import type { Message, Conversation } from "@/types/api";
import apiClient from "@/lib/api-client";
import { getMockMessages, simulateApiDelay } from "@/lib/mock-conversations";

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      console.log("Loading messages for:", {
        platform: conversation.platform,
        contact_id: conversation.contact_id
      });

      let messagesData: Message[] = [];

      // Strategy 1: Try the conversation endpoint
      try {
        const response = await apiClient.conversations.getByPlatformAndContact(
          conversation.platform,
          conversation.contact_id
        );

        console.log("Conversation endpoint response:", response);

        // Check different possible response structures
        if (response.data?.messages && Array.isArray(response.data.messages)) {
          messagesData = response.data.messages;
        } else if (response.messages && Array.isArray(response.messages)) {
          messagesData = response.messages;
        } else if (Array.isArray(response.data)) {
          // Sometimes the response might be directly an array of messages
          messagesData = response.data;
        } else if (Array.isArray(response)) {
          messagesData = response;
        }

        console.log(`Found ${messagesData.length} messages from conversation endpoint`);
      } catch (convError) {
        console.log("Conversation endpoint failed, will try messages endpoint:", convError);
      }

      // Strategy 2: If no messages yet, try the messages/all endpoint
      if (messagesData.length === 0) {
        try {
          const messagesResponse = await apiClient.messages.getAll({
            platform: conversation.platform,
            contact_id: conversation.contact_id,
            limit: 100
          });

          console.log("Messages/all endpoint response:", messagesResponse);

          if (Array.isArray(messagesResponse.data)) {
            messagesData = messagesResponse.data;
          } else if (Array.isArray(messagesResponse.messages)) {
            messagesData = messagesResponse.messages;
          } else if (Array.isArray(messagesResponse)) {
            messagesData = messagesResponse;
          }

          console.log(`Found ${messagesData.length} messages from messages endpoint`);
        } catch (msgError) {
          console.log("Messages endpoint also failed:", msgError);
        }
      }

      // Strategy 3: Try with platform-specific endpoint
      if (messagesData.length === 0 && conversation.platform) {
        try {
          // Try a direct fetch to platform-specific endpoint
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-meta-service.vercel.app";
          const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";

          const response = await fetch(
            `${API_BASE_URL}/api/${conversation.platform}/messages/${conversation.contact_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
              }
            }
          );

          if (response.ok) {
            const platformResponse = await response.json();
            console.log(`Platform-specific endpoint response:`, platformResponse);

            if (Array.isArray(platformResponse.data)) {
              messagesData = platformResponse.data;
            } else if (Array.isArray(platformResponse.messages)) {
              messagesData = platformResponse.messages;
            } else if (Array.isArray(platformResponse)) {
              messagesData = platformResponse;
            }

            console.log(`Found ${messagesData.length} messages from platform-specific endpoint`);
          }
        } catch (platError) {
          console.log("Platform-specific endpoint failed:", platError);
        }
      }

      // Filter and validate messages
      messagesData = messagesData.filter(msg =>
        msg &&
        (msg.message_content || msg.text || msg.body || msg.content) &&
        (msg.timestamp || msg.created_at || msg.date)
      );

      // Transform messages to ensure consistent structure
      const transformedMessages = messagesData.map(msg => {
        // Determinar la dirección correcta del mensaje
        let direction = msg.direction;

        // Si no hay dirección, intentar determinarla
        if (!direction) {
          if (msg.from_me !== undefined) {
            direction = msg.from_me ? "outgoing" : "incoming";
          } else if (msg.from === "business" || msg.from === "agent" || msg.sender === "agent") {
            direction = "outgoing";
          } else if (msg.to === "business" || msg.recipient === "business") {
            direction = "incoming";
          } else {
            // Por defecto, si el remitente coincide con el contacto, es entrante
            direction = (msg.from === conversation.contact_id ||
                        msg.from === conversation.contact_name ||
                        msg.from === conversation.contact_phone) ? "incoming" : "outgoing";
          }
        }

        // Determinar si es una respuesta de IA
        const isAIResponse = msg.ai_response_generated === true ||
                            msg.is_ai_response === true ||
                            (msg.metadata && msg.metadata.ai_generated === true) ||
                            (msg.metadata && msg.metadata.is_automated === true);

        // Determinar el origen real del mensaje
        const sender_type = msg.sender_type || msg.message_sender ||
                           (direction === "incoming" ? "client" :
                            isAIResponse ? "ai" : "agent");

        return {
          id: msg.id || msg.message_id || Math.random().toString(36).substr(2, 9),
          message_id: msg.message_id || msg.id || "",
          platform: msg.platform || conversation.platform,
          from_number: msg.from_number || msg.from || msg.sender || "",
          to_number: msg.to_number || msg.to || msg.recipient || "",
          direction: direction,
          message_content: msg.message_content || msg.text || msg.body || msg.content || "",
          message_type: msg.message_type || msg.type || "text",
          timestamp: msg.timestamp || msg.created_at || msg.date || new Date().toISOString(),
          created_at: msg.created_at || msg.timestamp || new Date().toISOString(),
          read: msg.read !== undefined ? msg.read : true,
          status: msg.status || "delivered",
          metadata: msg.metadata || {},
          ai_enabled: msg.ai_enabled || false,
          ai_response_generated: isAIResponse,
          sender_type: sender_type,
        } as Message;
      });

      // Ordenar mensajes cronológicamente (más viejo primero)
      const sortedMessages = transformedMessages.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.created_at).getTime();
        const dateB = new Date(b.timestamp || b.created_at).getTime();
        return dateA - dateB; // Orden ascendente (más viejo primero)
      });

      console.log(`Setting ${sortedMessages.length} sorted messages`);

      // Strategy 4: If still no messages, use mock data for testing
      if (sortedMessages.length === 0) {
        console.log("No messages from API, loading mock data for testing...");
        await simulateApiDelay(300);
        const mockMsgs = getMockMessages(conversation.contact_id);
        if (mockMsgs.length > 0) {
          // Ordenar también los mensajes mock
          const sortedMockMsgs = mockMsgs.sort((a, b) => {
            const dateA = new Date(a.timestamp || a.created_at).getTime();
            const dateB = new Date(b.timestamp || b.created_at).getTime();
            return dateA - dateB;
          });
          console.log(`Loaded ${sortedMockMsgs.length} mock messages for testing`);
          setMessages(sortedMockMsgs);
        } else {
          setMessages([]);
        }
      } else {
        setMessages(sortedMessages);
      }

      // Marcar mensajes como leídos
      if (conversation.unread_count > 0) {
        try {
          await apiClient.messages.markRead({
            platform: conversation.platform,
            contactId: conversation.contact_id,
          });
        } catch (markError) {
          console.error("Error marking messages as read:", markError);
        }
      }
    } catch (error) {
      console.error("Error in loadMessages:", error);

      // En caso de error total, intentar con datos mock
      console.log("Loading mock data due to error...");
      await simulateApiDelay(300);
      const mockMsgs = getMockMessages(conversation.contact_id);
      if (mockMsgs.length > 0) {
        // Ordenar mensajes mock cronológicamente
        const sortedMockMsgs = mockMsgs.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.created_at).getTime();
          const dateB = new Date(b.timestamp || b.created_at).getTime();
          return dateA - dateB;
        });
        setMessages(sortedMockMsgs);
      } else {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await apiClient.messages.send({
        platform: conversation.platform,
        to: conversation.contact_id,
        message: newMessage,
        type: "text",
      });

      setNewMessage("");
      // Recargar mensajes después de enviar
      setTimeout(() => loadMessages(), 500);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {conversation.contact_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{conversation.contact_name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <PlatformBadge platform={conversation.platform} />
              {conversation.contact_phone && <span>{conversation.contact_phone}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <Phone size={18} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <Video size={18} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <MoreVertical size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Legend */}
      <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-gray-600 font-medium">Leyenda:</span>
          <div className="flex items-center gap-1">
            <User size={12} className="text-blue-600" />
            <span className="text-gray-600">Cliente</span>
          </div>
          <div className="flex items-center gap-1">
            <Bot size={12} className="text-purple-600" />
            <span className="text-gray-600">Respuesta IA</span>
          </div>
          <div className="flex items-center gap-1">
            <UserCheck size={12} className="text-green-600" />
            <span className="text-gray-600">Agente Humano</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Cargando mensajes...</p>
            </div>
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message, index) => {
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    formatTime={formatTime}
                    contactName={conversation.contact_name}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No hay mensajes en esta conversación</p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip size={20} className="text-gray-600" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Adjuntar imagen"
          >
            <Image size={20} className="text-gray-600" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-900 placeholder:text-gray-400"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  formatTime: (timestamp: string) => string;
  contactName: string;
}

function MessageBubble({ message, formatTime, contactName }: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing";

  // Usar sender_type si está disponible, si no, inferir del mensaje
  const getSenderInfo = () => {
    // Primero, verificar si tenemos sender_type explícito
    if (message.sender_type) {
      switch (message.sender_type) {
        case "client":
          return {
            name: contactName,
            icon: <User size={14} />,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            label: "Cliente",
            bubbleColor: "bg-white text-gray-800 border border-gray-200"
          };
        case "ai":
          return {
            name: "Asistente IA",
            icon: <Bot size={14} />,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            label: "Respuesta Automática",
            bubbleColor: "bg-purple-500 text-white"
          };
        case "agent":
          return {
            name: "Agente",
            icon: <UserCheck size={14} />,
            color: "text-green-600",
            bgColor: "bg-green-50",
            label: "Agente Humano",
            bubbleColor: "bg-primary text-white"
          };
      }
    }

    // Fallback: inferir del mensaje
    if (!isOutgoing) {
      // Mensaje entrante = Cliente
      return {
        name: contactName,
        icon: <User size={14} />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        label: "Cliente",
        bubbleColor: "bg-white text-gray-800 border border-gray-200"
      };
    } else if (message.ai_response_generated === true) {
      // Mensaje saliente con IA = Respuesta automática
      return {
        name: "Asistente IA",
        icon: <Bot size={14} />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        label: "Respuesta Automática",
        bubbleColor: "bg-purple-500 text-white"
      };
    } else {
      // Mensaje saliente sin IA = Agente humano
      return {
        name: "Agente",
        icon: <UserCheck size={14} />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        label: "Agente Humano",
        bubbleColor: "bg-primary text-white"
      };
    }
  };

  const senderInfo = getSenderInfo();

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex ${isOutgoing ? "flex-row-reverse" : "flex-row"} gap-2 max-w-[70%]`}>
        {/* Avatar del remitente */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${senderInfo.bgColor} ${senderInfo.color}`}>
            {senderInfo.icon}
          </div>
        </div>

        {/* Contenedor del mensaje */}
        <div className="flex flex-col">
          {/* Nombre del remitente y etiqueta */}
          <div className={`flex items-center gap-2 mb-1 ${isOutgoing ? "justify-end" : "justify-start"}`}>
            <span className="text-xs font-medium text-gray-600">{senderInfo.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${senderInfo.bgColor} ${senderInfo.color}`}>
              {senderInfo.label}
            </span>
          </div>

          {/* Burbuja del mensaje */}
          <div
            className={`rounded-lg px-4 py-2 ${senderInfo.bubbleColor}`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.message_content}</p>
            <div className={`flex items-center gap-2 mt-1 text-xs ${
              message.sender_type === "client" ? "text-gray-500" : "text-white/70"
            }`}>
              <span>{formatTime(message.timestamp)}</span>
              {isOutgoing && (
                <span className="ml-1">
                  {message.status === "read" && "✓✓"}
                  {message.status === "delivered" && "✓✓"}
                  {message.status === "sent" && "✓"}
                  {message.status === "pending" && "⏱"}
                  {message.status === "failed" && "✗"}
                </span>
              )}
              {/* Indicador de IA en el mensaje */}
              {message.sender_type === "ai" && (
                <span className="flex items-center gap-1">
                  <Bot size={10} />
                  <span>IA</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const platformConfig: Record<string, { label: string; color: string }> = {
    whatsapp: { label: "WhatsApp", color: "bg-green-100 text-green-800" },
    instagram: { label: "Instagram", color: "bg-pink-100 text-pink-800" },
    messenger: { label: "Messenger", color: "bg-blue-100 text-blue-800" },
    facebook: { label: "Facebook", color: "bg-blue-100 text-blue-900" },
  };

  const config = platformConfig[platform] || { label: platform, color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
