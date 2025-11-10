"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Image, Phone, Video, MoreVertical, ArrowLeft, Bot, User, UserCheck, RefreshCw, ArrowDown } from "lucide-react";
import type { Message, Conversation, MessageDirection } from "@/types/api";
import apiClient from "@/lib/api-client";
import { getMockMessages, simulateApiDelay } from "@/lib/mock-conversations";
import { toast } from 'sonner';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [resettingConversation, setResettingConversation] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [togglingAI, setTogglingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadAIStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMenu]);

  // Detectar scroll para mostrar/ocultar botón de scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Mostrar botón si no está en el fondo (con un margen de 100px)
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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
        } else if (Array.isArray(response.data)) {
          // Sometimes the response might be directly an array of messages
          messagesData = response.data as Message[];
        } else if (Array.isArray(response)) {
          messagesData = response as Message[];
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
            messagesData = messagesResponse.data as Message[];
          } else if (Array.isArray(messagesResponse)) {
            messagesData = messagesResponse as Message[];
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
      messagesData = messagesData.filter((msg: Message | Record<string, unknown>) =>
        msg &&
        ((msg as Message).message_content || (msg as Record<string, unknown>).text || (msg as Record<string, unknown>).body || (msg as Record<string, unknown>).content) &&
        ((msg as Message).timestamp || (msg as Message).created_at || (msg as Record<string, unknown>).date)
      ) as Message[];

      // Transform messages to ensure consistent structure
      const transformedMessages = messagesData.map((msg: Message | Record<string, unknown>) => {
        const msgAny = msg as Record<string, unknown>;

        // 🔑 USAR LOS CAMPOS DEL BACKEND: is_from_contact y sent_by_user
        const isFromContact = (msg as Message).is_from_contact ?? msgAny.is_from_contact;
        const sentByUser = (msg as Message).sent_by_user ?? msgAny.sent_by_user;

        // Determinar la dirección basada en is_from_contact
        let direction: MessageDirection;
        if (isFromContact !== undefined) {
          // Si tenemos is_from_contact, usarlo como fuente de verdad
          direction = isFromContact ? "incoming" : "outgoing";
        } else {
          // Fallback a la lógica anterior si no viene is_from_contact
          direction = (msg as Message).direction;
          if (!direction) {
            if (msgAny.from_me !== undefined) {
              direction = msgAny.from_me ? "outgoing" : "incoming";
            } else if (msgAny.from === "business" || msgAny.from === "agent" || msgAny.sender === "agent") {
              direction = "outgoing";
            } else if (msgAny.to === "business" || msgAny.recipient === "business") {
              direction = "incoming";
            } else {
              direction = (msgAny.from === conversation.contact_id ||
                          msgAny.from === conversation.contact_name ||
                          msgAny.from === conversation.contact_phone) ? "incoming" : "outgoing";
            }
          }
        }

        // Determinar si es una respuesta de IA
        const isAIResponse = (msg as Message).ai_response_generated === true ||
                            msgAny.is_ai_response === true ||
                            (typeof (msg as Message).metadata === 'object' && (msg as Message).metadata && 'ai_generated' in (msg as Message).metadata! && ((msg as Message).metadata as Record<string, unknown>).ai_generated === true) ||
                            (typeof (msg as Message).metadata === 'object' && (msg as Message).metadata && 'is_automated' in (msg as Message).metadata! && ((msg as Message).metadata as Record<string, unknown>).is_automated === true);

        // Determinar el sender_type usando la lógica del backend
        let sender_type: "client" | "ai" | "agent";

        if (isFromContact === true) {
          // true = mensaje del cliente
          sender_type = "client";
        } else if (isFromContact === false) {
          // false = mensaje del sistema
          if (sentByUser === "Asistente IA" || isAIResponse) {
            sender_type = "ai";
          } else {
            sender_type = "agent";
          }
        } else {
          // Fallback a la lógica anterior
          const existingSenderType = (msg as Message).sender_type;
          const msgSender = msgAny.message_sender as string | undefined;

          if (existingSenderType && ["client", "ai", "agent"].includes(existingSenderType)) {
            sender_type = existingSenderType;
          } else if (msgSender && ["client", "ai", "agent"].includes(msgSender)) {
            sender_type = msgSender as "client" | "ai" | "agent";
          } else {
            sender_type = direction === "incoming" ? "client" : (isAIResponse ? "ai" : "agent");
          }
        }

        return {
          id: (msg as Message).id || msgAny.message_id || Math.random().toString(36).substr(2, 9),
          message_id: (msg as Message).message_id || msgAny.id || "",
          conversation_id: (msg as Message).conversation_id || msgAny.conversation_id,
          contact_id: (msg as Message).contact_id || msgAny.contact_id,
          platform: (msg as Message).platform || conversation.platform,
          from_number: (msg as Message).from_number || msgAny.from || msgAny.sender || "",
          to_number: (msg as Message).to_number || msgAny.to || msgAny.recipient || "",
          direction: direction,
          message_content: (msg as Message).message_content || msgAny.text || msgAny.body || msgAny.content || "",
          message_type: (msg as Message).message_type || msgAny.type || "text",
          timestamp: (msg as Message).timestamp || (msg as Message).created_at || msgAny.date || new Date().toISOString(),
          created_at: (msg as Message).created_at || (msg as Message).timestamp || new Date().toISOString(),
          read: (msg as Message).read !== undefined ? (msg as Message).read :
                (msg as Message).is_read !== undefined ? (msg as Message).is_read : true,
          status: (msg as Message).status || "delivered",
          metadata: (msg as Message).metadata || {},
          ai_enabled: (msg as Message).ai_enabled || false,
          ai_response_generated: isAIResponse,
          sender_type: sender_type,
          is_from_contact: isFromContact,
          sent_by_user: sentByUser,
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
      toast.error("Error al enviar el mensaje");
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

  const handleRefreshConversation = async () => {
    try {
      setRefreshing(true);
      setShowMenu(false);
      await loadMessages();
      // Asegurar que se desplace al mensaje más reciente después de actualizar
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error("Error refreshing conversation:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleResetConversation = async () => {
    if (!confirm("¿Estás seguro de que deseas restablecer el estado de esta conversación? Esto enviará el menú principal al cliente.")) {
      return;
    }

    try {
      setResettingConversation(true);
      setShowMenu(false);

      // TODO: Cuando el backend implemente el endpoint, reemplazar esto con:
      // await apiClient.conversations.resetState(conversation.platform, conversation.contact_id, "menu");

      // Por ahora, simulamos el comportamiento
      console.log("Resetting conversation state for:", {
        platform: conversation.platform,
        contact_id: conversation.contact_id
      });

      // Simulación temporal - remover cuando el endpoint esté listo
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.error("⚠️ Función en desarrollo\n\nEl endpoint de backend aún no está implementado.\n\nSe ha agregado la solicitud al equipo de backend en BACKEND_REQUESTS.md\n\nCuando esté listo, este botón:\n✅ Restablecerá el estado de la conversación\n✅ Enviará el menú principal al cliente\n✅ Limpiará variables de sesión");

      // Recargar mensajes para ver los cambios
      await loadMessages();
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error("Error resetting conversation:", error);
      toast.error("Error al restablecer la conversación. Por favor intenta de nuevo.");
    } finally {
      setResettingConversation(false);
    }
  };

  const loadAIStatus = async () => {
    try {
      const response = await apiClient.ai.getAIStatus(
        conversation.platform,
        conversation.contact_id
      );
      if (response.data?.ai_enabled !== undefined) {
        setAiEnabled(response.data.ai_enabled);
      }
    } catch (error) {
      console.error("Error loading AI status:", error);
      // Si falla, asumir que está habilitado
      setAiEnabled(true);
    }
  };

  const toggleAI = async () => {
    try {
      setTogglingAI(true);
      const newState = !aiEnabled;

      await apiClient.ai.setAIControl(
        conversation.platform,
        conversation.contact_id,
        newState
      );

      setAiEnabled(newState);

      // Mostrar notificación
      const message = newState
        ? "✅ IA activada - El bot responderá automáticamente"
        : "👤 Modo manual activado - Debes responder manualmente";

      // Mostrar notificación toast
      if (newState) {
        toast.success("IA activada - El bot responderá automáticamente");
      } else {
        toast.success("Modo manual activado - Debes responder manualmente");
      }
    } catch (error) {
      console.error("Error toggling AI:", error);
      toast.error("Error al cambiar el modo de IA. Por favor intenta de nuevo.");
    } finally {
      setTogglingAI(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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
            <h3 className="font-bold text-gray-800 dark:text-gray-100">{conversation.contact_name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <PlatformBadge platform={conversation.platform} />
              {conversation.contact_phone && <span>{conversation.contact_phone}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle IA/Manual */}
          <button
            onClick={toggleAI}
            disabled={togglingAI}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              aiEnabled
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
            } disabled:opacity-50`}
            title={aiEnabled ? "IA activa - Click para modo manual" : "Modo manual - Click para activar IA"}
          >
            {togglingAI ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : aiEnabled ? (
              <Bot size={14} />
            ) : (
              <User size={14} />
            )}
            <span>{aiEnabled ? "IA" : "Manual"}</span>
          </button>

          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Phone size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Video size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical size={18} className="text-gray-600 dark:text-gray-300" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
                <button
                  onClick={handleRefreshConversation}
                  disabled={refreshing}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Actualizando..." : "Actualizar conversación"}
                </button>

                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

                <button
                  onClick={handleResetConversation}
                  disabled={resettingConversation}
                  className="w-full px-4 py-2 text-left text-sm text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2 transition-colors disabled:opacity-50"
                  title="Restablecer el estado de la conversación y enviar menú al cliente"
                >
                  <RefreshCw size={16} className={resettingConversation ? "animate-spin" : ""} />
                  {resettingConversation ? "Restableciendo..." : "Resetear conversación"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Legend */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-gray-600 dark:text-gray-300 font-medium">Leyenda:</span>
          <div className="flex items-center gap-1">
            <User size={12} className="text-blue-600" />
            <span className="text-gray-600 dark:text-gray-300">Cliente</span>
          </div>
          <div className="flex items-center gap-1">
            <Bot size={12} className="text-purple-600" />
            <span className="text-gray-600 dark:text-gray-300">Respuesta IA</span>
          </div>
          <div className="flex items-center gap-1">
            <UserCheck size={12} className="text-green-600" />
            <span className="text-gray-600 dark:text-gray-300">Agente Humano</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 relative"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">Cargando mensajes...</p>
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
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
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
            <p className="text-gray-500 dark:text-gray-400">No hay mensajes en esta conversación</p>
          </div>
        )}

        {/* Botón de scroll hacia abajo - discreto */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 bg-primary hover:bg-primary-hover text-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-80 hover:opacity-100 z-10"
            aria-label="Ir al final de la conversación"
            title="Ir al final"
          >
            <ArrowDown size={20} />
          </button>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Paperclip size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Adjuntar imagen"
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
  // 🔑 USAR is_from_contact COMO FUENTE PRIMARIA DE VERDAD
  // is_from_contact === true → mensaje del cliente (izquierda)
  // is_from_contact === false → mensaje del sistema (derecha)
  const isFromClient = message.is_from_contact === true ||
                       (message.is_from_contact === undefined && message.sender_type === "client");

  // Determinar el tipo de remitente usando sender_type (ya calculado correctamente en loadMessages)
  const getSenderInfo = () => {
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
          name: message.sent_by_user || "Asistente IA",
          icon: <Bot size={14} />,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          label: "Respuesta Automática",
          bubbleColor: "bg-purple-500 text-white"
        };
      case "agent":
      default:
        return {
          name: message.sent_by_user || "Agente",
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
    <div className={`flex ${isFromClient ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`flex ${isFromClient ? "flex-row" : "flex-row-reverse"} gap-2 max-w-[70%]`}>
        {/* Avatar del remitente */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${senderInfo.bgColor} ${senderInfo.color}`}>
            {senderInfo.icon}
          </div>
        </div>

        {/* Contenedor del mensaje */}
        <div className="flex flex-col">
          {/* Nombre del remitente y etiqueta */}
          <div className={`flex items-center gap-2 mb-1 ${isFromClient ? "justify-start" : "justify-end"}`}>
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
              {!isFromClient && (
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
