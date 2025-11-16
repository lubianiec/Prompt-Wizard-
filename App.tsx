import React, { useState, useCallback, useEffect } from 'react';
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
import Loader from './components/Loader';
import { SparklesIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [promptData, setPromptData] = useState<PromptStructure | null>(null);
  const [compactPrompt, setCompactPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputTitle, setOutputTitle] = useState<string>('');
  const { t } = useLanguage();

  const [isKeyReady, setIsKeyReady] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      // No need to set isCheckingKey to true here, it's already true initially.
      try {
        if (await window.aistudio.hasSelectedApiKey()) {
          setIsKeyReady(true);
        }
      } catch (e) {
        console.error("Error checking for API key:", e);
        // Assume no key is ready if an error occurs.
        setIsKeyReady(false);
      } finally {
        // This is crucial: always stop checking, even if there was an error.
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    // Optimistically set to true to avoid race conditions where `hasSelectedApiKey`
    // might not immediately return true after the dialog closes.
    setIsKeyReady(true); 
  };

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
        if (e.message.includes('Requested entity was not found')) {
            setError(t('errorInvalidApiKey'));
            setIsKeyReady(false);
        } else {
            setError(`${t('errorPrefix')}: ${e.message}`);
        }
      } else {
        setError(t('errorUnknown'));
      }
      setOutputTitle(t('generatedPromptTitle'));
    } finally {
      setIsLoading(false);
    }
  }, [inputMode, t]);
  
  const raisedButtonShadow = "shadow-[5px_5px_10px_#1b1825,-5px_-5px_10px_#3b364f] hover:shadow-[2px_2px_5px_#1b1825,-2px_-2px_5px_#3b364f] active:shadow-[inset_5px_5px_10px_#1b1825,inset_-5px_-5px_10px_#3b364f] disabled:shadow-none";

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#201D2B]">
        <Loader />
      </div>
    );
  }

  if (!isKeyReady) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center bg-[#201D2B] p-4">
        <div className="bg-[#2B273A] rounded-3xl shadow-[8px_8px_16px_#1b1825,-8px_-8px_16px_#3b364f] w-full max-w-md text-center p-8">
            <SparklesIcon className="h-16 w-16 text-[#F0C38E] opacity-50 mb-4 mx-auto" />
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">{t('apiKeyTitle')}</h1>
            <p className="text-[#F0F0F0]/70 mb-4">{t('apiKeyDescription')}</p>
            <p className="text-xs text-[#F0F0F0]/50 mb-6">
                {t('apiKeyBillingPre')}{' '}
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#F0C38E]">
                    {t('apiKeyBillingLink')}
                </a>.
            </p>
             <button
                onClick={handleSelectKey}
                className={`w-full font-bold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 bg-[#F0C38E] text-[#312C51] ${raisedButtonShadow}`}
            >
                {t('apiKeyButton')}
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans flex flex-col bg-[#201D2B] text-[#F0F0F0]">
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
      <footer className="text-center p-4 text-[#F0F0F0]/50 text-sm">
        <p>Powered by Google Gemini. Design by lubianiec.</p>
      </footer>
    </div>
  );
};

export default App;