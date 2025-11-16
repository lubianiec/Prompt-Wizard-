import React, { useState, useCallback } from 'react';
import { InputMode, PromptStructure, GenerationType } from './types';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import { 
  generatePromptFromImage, 
  generatePromptFromText, 
  generateCompactPromptFromText,
  generateCompactPromptFromImage,
  generateVideoPromptFromImageAndText,
  generateProfessionalPromptFromText
} from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [promptData, setPromptData] = useState<PromptStructure | null>(null);
  const [compactPrompt, setCompactPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputTitle, setOutputTitle] = useState<string>('');
  const { t } = useLanguage();

  const handleGenerate = useCallback(async (
    type: GenerationType, 
    data: { text?: string; file?: File; videoDescription?: string; includeImageDetails?: boolean },
    isDetailed: boolean,
  ) => {
    setIsLoading(true);
    setError(null);
    setPromptData(null);
    setCompactPrompt(null);
    setOutputTitle(t('generatingTitle'));

    try {
      if (type === 'professional') {
        if (data.text?.trim()) {
            const result = await generateProfessionalPromptFromText(data.text, 'en');
            setCompactPrompt(result);
            setOutputTitle(t('professionalPromptTitle'));
        } else {
             throw new Error(t('errorNoText'));
        }
      } else if (inputMode === InputMode.IMAGE && data.file) {
        if (!data.file.type.startsWith('image/')) {
          throw new Error(t('errorInvalidImage'));
        }
        const { base64, mimeType } = await fileToBase64(data.file);

        if (data.videoDescription?.trim()) {
          const result = await generateVideoPromptFromImageAndText(base64, mimeType, data.videoDescription, 'en', data.includeImageDetails);
          setCompactPrompt(result);
          setOutputTitle(t('videoPromptTitle'));
        } else {
            if (isDetailed) {
                const result = await generatePromptFromImage(base64, mimeType, 'en');
                setPromptData(result);
                setOutputTitle(t('structuredPromptTitle'));
            } else {
                const result = await generateCompactPromptFromImage(base64, mimeType, 'en');
                setCompactPrompt(result);
                setOutputTitle(t('compactPromptTitle'));
            }
        }
      } else if (inputMode === InputMode.TEXT && data.text?.trim()) {
        if (isDetailed) {
          const result = await generatePromptFromText(data.text, 'en');
          setPromptData(result);
          setOutputTitle(t('structuredPromptTitle'));
        } else {
          const result = await generateCompactPromptFromText(data.text, 'en');
          setCompactPrompt(result);
          setOutputTitle(t('compactPromptTitle'));
        }
      } else {
        throw new Error(t('errorNoInput'));
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setError(`${t('errorPrefix')}: ${e.message}`);
      } else {
        setError(t('errorUnknown'));
      }
      setOutputTitle(t('generatedPromptTitle'));
    } finally {
      setIsLoading(false);
    }
  }, [inputMode, t]);

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-300 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputPanel
          mode={inputMode}
          setMode={setInputMode}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
        <OutputPanel
          promptData={promptData}
          compactPrompt={compactPrompt}
          setPromptData={setPromptData}
          isLoading={isLoading}
          error={error}
          outputTitle={outputTitle}
        />
      </main>
      <footer className="text-center p-4 text-gray-600 text-sm">
        <p>Powered by Google Gemini. Design by lubianiec.</p>
      </footer>
    </div>
  );
};

export default App;