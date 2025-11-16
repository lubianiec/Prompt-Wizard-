import React, { useState, useEffect, useCallback } from 'react';
import { PromptStructure, TargetAI } from '../types';
import { TARGET_AI_MODELS } from '../constants';
import { CopyIcon, CheckIcon, SparklesIcon } from './icons/Icons';
import Loader from './Loader';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface OutputPanelProps {
  promptData: PromptStructure | null;
  compactPrompt: string | null;
  setPromptData: React.Dispatch<React.SetStateAction<PromptStructure | null>>;
  isLoading: boolean;
  error: string | null;
  outputTitle: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ promptData, compactPrompt, setPromptData, isLoading, error, outputTitle }) => {
  const { t } = useLanguage();
  const [targetAI, setTargetAI] = useState<TargetAI>(TargetAI.MIDJOURNEY);
  const [copied, setCopied] = useState(false);
  const [editableCompactPrompt, setEditableCompactPrompt] = useState('');

  useEffect(() => {
    if (compactPrompt) {
      setEditableCompactPrompt(compactPrompt);
    }
  }, [compactPrompt]);

  const handleModuleChange = useCallback((key: keyof PromptStructure, value: string) => {
    setPromptData(prev => prev ? { ...prev, [key]: value } : null);
  }, [setPromptData]);

  const assemblePrompt = useCallback(() => {
    if (compactPrompt) {
        return editableCompactPrompt;
    }
    if (!promptData) return '';
    
    const parts = [
      promptData.subject,
      promptData.scene,
      promptData.mood,
      promptData.style,
      promptData.lighting,
      promptData.camera,
      promptData.details
    ].filter(Boolean).join(', ');

    let finalPrompt = parts;

    if (targetAI === TargetAI.MIDJOURNEY) {
      finalPrompt += ` --ar 16:9`;
      if (promptData.negativePrompt) {
        finalPrompt += ` --no ${promptData.negativePrompt}`;
      }
    } else if (targetAI === TargetAI.STABLE_DIFFUSION) {
        if (promptData.negativePrompt) {
            finalPrompt += `\nNegative prompt: ${promptData.negativePrompt}`;
        }
    }
    // DALL-E prefers natural language, so we don't add special parameters.

    return finalPrompt;
  }, [promptData, compactPrompt, editableCompactPrompt, targetAI]);

  const copyToClipboard = useCallback(() => {
    const fullPrompt = assemblePrompt();
    navigator.clipboard.writeText(fullPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [assemblePrompt]);

  useEffect(() => {
    if (error || promptData || compactPrompt) {
      setCopied(false);
    }
  }, [error, promptData, compactPrompt]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <Loader />
            <p className="mt-4 text-lg font-semibold text-gray-400">{t('loadingTitle')}</p>
            <p className="text-gray-500 mt-2">{t('loadingSubtitle')}</p>
        </div>
      );
    }
    if (error) {
      return <div className="flex items-center justify-center h-full p-4 text-red-400 bg-red-900/20 rounded-lg">{error}</div>;
    }

    if (compactPrompt) {
        return (
            <div>
                 <label className="text-sm font-bold text-gray-400 mb-2 block">
                    {outputTitle || t('compactPromptTitle')}
                </label>
                <textarea
                    value={editableCompactPrompt}
                    onChange={(e) => setEditableCompactPrompt(e.target.value)}
                    className="w-full p-4 bg-zinc-950 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-y text-gray-300"
                    rows={15}
                />
            </div>
        )
    }

    if (promptData) {
        return (
            <div className="space-y-4">
              {Object.entries(promptData).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-bold text-gray-400 capitalize mb-1 block">
                    {/* FIX: Cast key to `keyof PromptStructure` for type safety with the `t` function and to remove reference to `translations`. */}
                    {t(key as keyof PromptStructure)}
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => handleModuleChange(key as keyof PromptStructure, e.target.value)}
                    className="w-full p-2 bg-zinc-950 rounded-md border border-zinc-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-y text-gray-300"
                    rows={key === 'scene' || key === 'subject' ? 3 : 2}
                  />
                </div>
              ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center text-center h-full p-4">
            <SparklesIcon className="h-16 w-16 text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">{t('placeholderTitle')}</h3>
            <p className="text-gray-500 mt-2">{t('placeholderSubtitle')}</p>
        </div>
    );
  };
  
  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-gray-200">{t('generatedPromptTitle')}</h2>
      </div>

      <div className="p-6 flex-grow overflow-y-auto">
        {renderContent()}
      </div>

      {(promptData || compactPrompt) && !isLoading && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/70 rounded-b-xl space-y-4">
          <div>
            <label htmlFor="target-ai" className="block text-sm font-medium text-gray-400 mb-2">{t('targetAI')}</label>
            <select
              id="target-ai"
              value={targetAI}
              onChange={(e) => setTargetAI(e.target.value as TargetAI)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            >
              {TARGET_AI_MODELS.map(model => <option key={model} value={model}>{model}</option>)}
            </select>
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? t('copied') : t('copyButton')}
          </button>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;