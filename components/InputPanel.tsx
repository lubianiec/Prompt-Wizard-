import React, { useState, useCallback, useRef } from 'react';
import { InputMode, GenerationType } from '../types';
import { ImageUploadIcon, TextIcon } from './icons/Icons';
import Loader from './Loader';
import { useLanguage } from '../contexts/LanguageContext';
import Checkbox from './ui/Checkbox';

interface InputPanelProps {
  mode: InputMode;
  setMode: (mode: InputMode) => void;
  onGenerate: (type: GenerationType, data: { text?: string; file?: File; videoDescription?: string; includeImageDetails?: boolean }, isDetailed: boolean) => void;
  isLoading: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ mode, setMode, onGenerate, isLoading }) => {
  const { t } = useLanguage();
  const [text, setText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [includeImageDetails, setIncludeImageDetails] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  }, []);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleGeneralSubmit = () => {
    onGenerate('professional', { text }, false);
  }

  const handleImageSubmit = (isDetailed: boolean) => {
    onGenerate('visual', { text, file, videoDescription, includeImageDetails }, isDetailed);
  }
  
  const tabClass = (tabMode: InputMode) => 
    `flex-1 py-3 px-4 text-center font-semibold transition-colors duration-300 rounded-t-lg flex items-center justify-center gap-2 ${
      mode === tabMode ? 'bg-zinc-800 text-white' : 'bg-zinc-900/50 text-gray-500 hover:bg-zinc-800'
    }`;

  const isGeneralDisabled = mode === InputMode.TEXT && !text.trim();
  const isVisualDisabled = (mode === InputMode.TEXT && !text.trim()) || (mode === InputMode.IMAGE && !file);

  const baseButtonClass = "w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-gray-500 disabled:cursor-not-allowed";

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 flex flex-col h-full">
      <div className="flex border-b border-zinc-800">
        <button onClick={() => setMode(InputMode.TEXT)} className={tabClass(InputMode.TEXT)}>
          <TextIcon /> {t('generateFromText')}
        </button>
        <button onClick={() => setMode(InputMode.IMAGE)} className={tabClass(InputMode.IMAGE)}>
          <ImageUploadIcon /> {t('generateFromImage')}
        </button>
      </div>

      <div className="p-6 flex-grow flex flex-col space-y-4">
        {mode === InputMode.TEXT ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('textPlaceholder')}
            className="w-full flex-grow p-4 bg-zinc-950 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none text-gray-300"
            rows={10}
            disabled={isLoading}
          />
        ) : (
          <>
            <div 
              className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-teal-500 hover:bg-zinc-800/50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={isLoading} />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 object-contain rounded-lg" />
              ) : (
                <>
                  <ImageUploadIcon className="h-12 w-12 text-gray-600 mb-4" />
                  <p className="font-semibold text-gray-400">{t('dragDrop')}</p>
                  <p className="text-sm text-gray-500">{t('clickToBrowse')}</p>
                </>
              )}
              {file && <p className="mt-4 text-sm text-gray-500">{file.name}</p>}
            </div>
            <textarea
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              placeholder={t('videoPlaceholder')}
              className="w-full p-4 bg-zinc-950 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none text-gray-300"
              rows={3}
              disabled={isLoading || !file}
            />
            <Checkbox
              id="include-image-details"
              checked={includeImageDetails}
              onChange={setIncludeImageDetails}
              label={t('includeImageDetailsLabel')}
              disabled={isLoading || !file}
            />
          </>
        )}
      </div>

      <div className="p-6 border-t border-zinc-800 space-y-4">
         {mode === InputMode.TEXT && (
            <button
                onClick={handleGeneralSubmit}
                disabled={isLoading || isGeneralDisabled}
                className={`${baseButtonClass} bg-zinc-700 text-white hover:bg-zinc-600`}
            >
                {isLoading ? <Loader /> : t('ogolnyButton')}
            </button>
         )}

        <button
            onClick={() => handleImageSubmit(false)}
            disabled={isLoading || isVisualDisabled}
            className={`${baseButtonClass} bg-teal-600 text-white hover:bg-teal-700`}
        >
            {isLoading ? <Loader /> : t('obrazButton')}
        </button>
        <button
            onClick={() => handleImageSubmit(true)}
            disabled={isLoading || isVisualDisabled}
            className={`${baseButtonClass} bg-zinc-700 text-white hover:bg-zinc-600`}
        >
            {isLoading ? <Loader /> : t('zaawansowanyObrazButton')}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;