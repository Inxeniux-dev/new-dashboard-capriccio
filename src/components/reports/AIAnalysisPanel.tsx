"use client";

import { Sparkles, Download, RefreshCw } from "lucide-react";
import type { AIAnalysis } from "@/types/api";

interface AIAnalysisPanelProps {
  analysis: AIAnalysis | null;
  isLoading: boolean;
  onGenerate: () => void;
  onRegenerate?: () => void;
}

export function AIAnalysisPanel({
  analysis,
  isLoading,
  onGenerate,
  onRegenerate,
}: AIAnalysisPanelProps) {
  const handleExportPDF = () => {
    // TODO: Implementar exportación a PDF
    alert("Exportación a PDF - En desarrollo");
  };

  if (!analysis && !isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Análisis con IA
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Obtén insights y recomendaciones personalizadas basadas en tus datos
        </p>
        <button
          onClick={onGenerate}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generar Análisis con IA
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Análisis con IA
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Generado por OpenAI
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {onRegenerate && !isLoading && (
            <button
              onClick={onRegenerate}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerar
            </button>
          )}
          <button
            onClick={handleExportPDF}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Generando análisis con IA...
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            Esto puede tardar 15-30 segundos
          </p>
        </div>
      ) : (
        analysis && (
          <div className="space-y-6">
            {/* Resumen Ejecutivo */}
            {analysis.summary && (
              <div>
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <span>📋</span> Resumen Ejecutivo
                </h4>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.summary) }}
                  />
                </div>
              </div>
            )}

            {/* Insights Clave */}
            {analysis.insights && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <span>💡</span> Insights Clave
                </h4>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.insights) }}
                  />
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {analysis.recommendations && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <span>🎯</span> Recomendaciones
                </h4>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(analysis.recommendations),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tendencias */}
            {analysis.trends && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <span>📈</span> Tendencias
                </h4>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.trends) }}
                  />
                </div>
              </div>
            )}

            {/* Áreas de Atención */}
            {analysis.risks && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <span>⚠️</span> Áreas de Atención
                </h4>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.risks) }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

/**
 * Función simple para convertir markdown básico a HTML
 * Soporta: headers, listas, negrita, énfasis
 */
function formatMarkdown(text: string): string {
  if (!text) return "";

  let html = text;

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3 class='font-semibold text-sm mt-3 mb-2'>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2 class='font-bold text-base mt-4 mb-2'>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1 class='font-bold text-lg mt-4 mb-3'>$1</h1>");

  // Listas
  html = html.replace(/^\* (.+)$/gm, "<li class='ml-4'>$1</li>");
  html = html.replace(/^- (.+)$/gm, "<li class='ml-4'>$1</li>");
  html = html.replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>");

  // Negrita e itálica
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong class='font-semibold'>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em class='italic'>$1</em>");

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-primary hover:underline'>$1</a>");

  // Párrafos
  html = html.replace(/\n\n/g, "</p><p class='mb-2'>");
  html = `<p class='mb-2'>${html}</p>`;

  return html;
}
