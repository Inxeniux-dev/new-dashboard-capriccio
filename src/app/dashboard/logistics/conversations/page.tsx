"use client";

import { useState } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import ConversationsList from "@/components/Chat/ConversationsList";
import ChatWindow from "@/components/Chat/ChatWindow";
import type { Conversation } from "@/types/api";
import { MessageSquare } from "lucide-react";

export default function LogisticsConversationsPage() {
  const { loading } = useRequireAuth(["logistics", "logistica", "admin"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || undefined;
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Conversaciones</h1>
        <p className="text-gray-600">Gestiona las conversaciones de todas las plataformas</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Conversations List */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <ConversationsList
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
            platform={platform as any}
          />
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 h-full overflow-hidden">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="h-full bg-white rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="text-gray-300 mx-auto mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-500">
                  Elige una conversación de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
