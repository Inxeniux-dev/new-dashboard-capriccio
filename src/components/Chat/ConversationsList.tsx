"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MessageSquare } from "lucide-react";
import type { Conversation, Platform } from "@/types/api";
import apiClient from "@/lib/api-client";
import { mockConversations, simulateApiDelay } from "@/lib/mock-conversations";

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  platform?: Platform;
}

export default function ConversationsList({
  onSelectConversation,
  selectedConversationId,
  platform,
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>(platform || "all");

  // Sincronizar filterPlatform con el prop platform cuando cambie
  useEffect(() => {
    if (platform) {
      setFilterPlatform(platform);
    }
  }, [platform]);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, filterPlatform]);

  const loadConversations = async () => {
    try {
      setLoading(true);

      // Si no hay plataforma específica, cargamos todas las plataformas principales
      if (!platform && filterPlatform === "all") {
        const platforms: Platform[] = ["whatsapp", "messenger", "instagram", "facebook"];
        const allConversations: Conversation[] = [];

        for (const plat of platforms) {
          try {
            const response = await apiClient.conversations.getAll({
              platform: plat,
              limit: 100
            });
            if (response.data) {
              // Ensure each conversation has required fields
              const conversations = Array.isArray(response.data) ? response.data : [];
              const validConversations = conversations.map(conv => ({
                ...conv,
                id: conv.id || `${plat}-${conv.contact_id}`,
                conversation_status: conv.conversation_status || "active",
                unread_count: conv.unread_count || 0,
                last_message: conv.last_message || "",
                last_message_time: conv.last_message_time || conv.updated_at || conv.created_at || new Date().toISOString()
              }));
              allConversations.push(...validConversations);
            }
          } catch (err) {
            console.error(`Error loading ${plat} conversations:`, err);
          }
        }

        // If no conversations from API, use mock data
        if (allConversations.length === 0) {
          console.log("No conversations from any platform API, loading mock data...");
          await simulateApiDelay(300);
          setConversations(mockConversations);
        } else {
          setConversations(allConversations);
        }
      } else {
        // Cargar de una plataforma específica
        const targetPlatform = platform || (filterPlatform !== "all" ? filterPlatform as Platform : "whatsapp");

        console.log(`🔍 [DEBUG] Cargando conversaciones de ${targetPlatform}...`);
        console.log(`🔍 [DEBUG] Endpoint: /api/conversations?platform=${targetPlatform}&limit=100`);

        const response = await apiClient.conversations.getAll({
          platform: targetPlatform,
          limit: 100
        });

        console.log(`📡 [DEBUG] Response completo de ${targetPlatform}:`, response);
        console.log(`📡 [DEBUG] Response.data:`, response.data);
        console.log(`📡 [DEBUG] Es array?:`, Array.isArray(response.data));
        console.log(`📡 [DEBUG] Cantidad de conversaciones:`, response.data?.length);

        const conversations = Array.isArray(response.data) ? response.data : [];
        console.log(`✅ [DEBUG] Conversaciones parseadas (${conversations.length}):`, conversations);

        const validConversations = conversations.map(conv => ({
          ...conv,
          id: conv.id || `${targetPlatform}-${conv.contact_id}`,
          conversation_status: conv.conversation_status || "active",
          unread_count: conv.unread_count || 0,
          last_message: conv.last_message || "",
          last_message_time: conv.last_message_time || conv.updated_at || conv.created_at || new Date().toISOString()
        }));

        console.log(`✅ [DEBUG] Conversaciones validadas (${validConversations.length}):`, validConversations);
        setConversations(validConversations);

        // If no conversations from API, use mock data
        if (validConversations.length === 0) {
          console.log(`⚠️ [DEBUG] No ${targetPlatform} conversations from API, loading mock data...`);
          await simulateApiDelay(300);
          const mockConvs = mockConversations.filter(conv =>
            conv.platform === targetPlatform
          );
          setConversations(mockConvs);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);

      // On error, use mock data for testing
      console.log("Loading mock conversations due to error...");
      await simulateApiDelay(300);

      // Determine which platform to filter for
      const targetPlatform = platform || (filterPlatform !== "all" ? filterPlatform : null);

      const mockConvs = targetPlatform
        ? mockConversations.filter(conv => conv.platform === targetPlatform)
        : mockConversations;

      setConversations(mockConvs);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contact_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.last_message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatform =
      filterPlatform === "all" || conv.platform === filterPlatform;

    return matchesSearch && matchesPlatform;
  });

  console.log(`🔎 [DEBUG] Total conversations loaded: ${conversations.length}`);
  console.log(`🔎 [DEBUG] Filter platform: ${filterPlatform}`);
  console.log(`🔎 [DEBUG] Search term: "${searchTerm}"`);
  console.log(`🔎 [DEBUG] Filtered conversations: ${filteredConversations.length}`);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <MessageSquare className="text-primary" size={24} />
          Conversaciones
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Platform Filter */}
        {!platform && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500 dark:text-gray-400" />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Todas las plataformas</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="messenger">Messenger</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">Cargando conversaciones...</p>
            </div>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={() => onSelectConversation(conversation)}
                formatTime={formatTime}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <MessageSquare className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No hay conversaciones</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {searchTerm
                  ? "No se encontraron resultados para tu búsqueda"
                  : "Las conversaciones aparecerán aquí"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  formatTime: (timestamp: string) => string;
}

function ConversationItem({ conversation, isSelected, onClick, formatTime }: ConversationItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
        isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {conversation.contact_name.charAt(0).toUpperCase()}
          </div>
          {conversation.unread_count > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold truncate ${conversation.unread_count > 0 ? "text-gray-900 dark:text-gray-50" : "text-gray-800 dark:text-gray-100"}`}>
                {conversation.contact_name}
              </h4>
              <PlatformBadge platform={conversation.platform} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
              {formatTime(conversation.last_message_time)}
            </span>
          </div>

          <p
            className={`text-sm truncate ${
              conversation.unread_count > 0 ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {conversation.last_message}
          </p>
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
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${config.color} mt-1`}>
      {config.label}
    </span>
  );
}
