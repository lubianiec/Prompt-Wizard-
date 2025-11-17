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

  // State for image sub-modes
  const [imageMode, setImageMode] = useState<'edit' | 'video'>('edit');
  const [imageEditDescription, setImageEditDescription] = useState<string>('');
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

  const handleVisualSubmit = (isDetailed: boolean) => {
    if (mode === InputMode.TEXT) {
      onGenerate('visual', { text }, isDetailed);
    } else { // mode === InputMode.IMAGE
      if (imageMode === 'edit') {
        onGenerate('imageEdit', { file, text: imageEditDescription }, isDetailed);
      } else { // video
        onGenerate('video', { file, videoDescription, includeImageDetails }, isDetailed);
      }
    }
  };
  
  const tabClass = (tabMode: InputMode) => 
    `flex-1 py-3 px-4 text-center font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-t-2xl ${
      mode === tabMode 
        ? 'bg-[#2B273A] text-[#F0F0F0] shadow-[inset_5px_5px_10px_#1b1825,inset_-5px_-5px_10px_#3b364f]' 
        : 'bg-transparent text-[#F0F0F0]/60 hover:bg-[#201D2B]/50'
    }`;
  
  const isGeneralDisabled = mode === InputMode.TEXT && !text.trim();
  const isVisualDisabled = (mode === InputMode.TEXT && !text.trim()) || (mode === InputMode.IMAGE && !file);
  const isDetailedVisualDisabled = isVisualDisabled || (mode === InputMode.IMAGE && imageMode === 'video');

  const baseButtonClass = "w-full font-bold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const raisedButtonShadow = "shadow-[5px_5px_10px_#1b1825,-5px_-5px_10px_#3b364f] hover:shadow-[2px_2px_5px_#1b1825,-2px_-2px_5px_#3b364f] active:shadow-[inset_5px_5px_10px_#1b1825,inset_-5px_-5px_10px_#3b364f] disabled:shadow-none";
  const insetStyle = "shadow-[inset_5px_5px_10px_#1b1825,inset_-5px_-5px_10px_#3b364f]";
  
  const subModeButtonClass = (buttonMode: 'edit' | 'video') => 
    `w-full text-center font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        imageMode === buttonMode
        ? 'bg-[#2B273A] text-[#F0C38E] shadow-[inset_3px_3px_6px_#1b1825,inset_-3px_-3px_6px_#3b364f]'
        : 'text-[#F0F0F0]/60 hover:bg-[#2B273A]/50'
    }`;


  return (
    <div className="bg-[#2B273A] rounded-3xl shadow-[8px_8px_16px_#1b1825,-8px_-8px_16px_#3b364f] flex flex-col h-full overflow-hidden">
      <div className="flex bg-[#201D2B] rounded-t-3xl">
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
            className={`w-full flex-grow p-4 bg-[#2B273A] rounded-2xl border-none focus:outline-none focus:shadow-[inset_3px_3px_7px_#1b1825,inset_-3px_-3px_7px_#3b364f] transition-shadow resize-none text-[#F0F0F0] placeholder:text-[#F0F0F0]/40 ${insetStyle}`}
            rows={10}
            disabled={isLoading}
          />
        ) : (
          <>
            <div 
              className={`flex-grow flex flex-col items-center justify-center rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#2B273A] ${insetStyle}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={isLoading} />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 object-contain rounded-lg" />
              ) : (
                <>
                  <ImageUploadIcon className="h-12 w-12 text-[#F0F0F0]/30 mb-4" />
                  <p className="font-semibold text-[#F0F0F0]">{t('dragDrop')}</p>
                  <p className="text-sm text-[#F0F0F0]/50">{t('clickToBrowse')}</p>
                </>
              )}
              {file && <p className="mt-4 text-sm text-[#F0F0F0]/50">{file.name}</p>}
            </div>

            <div className="flex items-center space-x-2 my-2 bg-[#201D2B] p-1 rounded-xl">
                <button
                    onClick={() => setImageMode('edit')}
                    disabled={isLoading || !file}
                    className={subModeButtonClass('edit')}
                >
                    {t('imagePromptMode')}
                </button>
                <button
                    onClick={() => setImageMode('video')}
                    disabled={isLoading || !file}
                    className={subModeButtonClass('video')}
                >
                    {t('videoPromptMode')}
                </button>
            </div>

            <div className={imageMode === 'edit' ? '' : 'hidden'}>
               <textarea
                value={imageEditDescription}
                onChange={(e) => setImageEditDescription(e.target.value)}
                placeholder={t('imageEditPlaceholder')}
                className={`w-full p-4 bg-[#2B273A] rounded-2xl border-none focus:outline-none focus:shadow-[inset_3px_3px_7px_#1b1825,inset_-3px_-3px_7px_#3b364f] transition-shadow resize-none text-[#F0F0F0] placeholder:text-[#F0F0F0]/40 ${insetStyle}`}
                rows={4}
                disabled={isLoading || !file}
              />
            </div>
            
            <div className={imageMode === 'video' ? 'space-y-4' : 'hidden'}>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder={t('videoPlaceholder')}
                  className={`w-full p-4 bg-[#2B273A] rounded-2xl border-none focus:outline-none focus:shadow-[inset_3px_3px_7px_#1b1825,inset_-3px_-3px_7px_#3b364f] transition-shadow resize-none text-[#F0F0F0] placeholder:text-[#F0F0F0]/40 ${insetStyle}`}
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
            </div>
          </>
        )}
      </div>

      <div className="p-6 bg-[#2B273A] space-y-4">
         {mode === InputMode.TEXT && (
            <button
                onClick={handleGeneralSubmit}
                disabled={isLoading || isGeneralDisabled}
                className={`${baseButtonClass} bg-[#F0C38E] text-[#312C51] ${raisedButtonShadow}`}
            >
                {isLoading ? <Loader /> : t('professionalButton')}
            </button>
         )}

        <button
            onClick={() => handleVisualSubmit(false)}
            disabled={isLoading || isVisualDisabled}
            className={`${baseButtonClass} bg-[#F0C38E] text-[#312C51] ${raisedButtonShadow}`}
        >
            {isLoading ? <Loader /> : t('compactButton')}
        </button>
        <button
            onClick={() => handleVisualSubmit(true)}
            disabled={isLoading || isDetailedVisualDisabled}
            className={`${baseButtonClass} bg-[#F0C38E] text-[#312C51] ${raisedButtonShadow}`}
        >
            {isLoading ? <Loader /> : t('detailedButton')}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;