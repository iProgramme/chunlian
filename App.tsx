
import React, { useState, useEffect } from 'react';
import { StepUpload } from './components/StepUpload';
import { StepVisualize } from './components/StepVisualize';
import { StepFinal } from './components/StepFinal';
import { SettingsModal } from './components/SettingsModal';
import { WorkflowStep, AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: WorkflowStep.UPLOAD,
    coupletImage: null,
    doorImage: null,
    originalCopy: { title: '', content: '' },
    
    generatedImages: [],
    selectedImageIndex: 0,
    generatedCopy: null,
    
    isLoading: false,
    error: null
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);

  const checkKeyStatus = () => {
    setHasCustomKey(!!localStorage.getItem('SCW_API_KEY'));
  };

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const goBack = () => {
    switch (state.step) {
      case WorkflowStep.VISUALIZE:
        setState(s => ({ ...s, step: WorkflowStep.UPLOAD }));
        break;
      case WorkflowStep.FINAL:
        setState(s => ({ ...s, step: WorkflowStep.VISUALIZE }));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-gray-800 font-serif">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-red-100 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-china-red flex items-center justify-center text-china-gold font-bold text-lg">商</div>
            <div className="flex flex-col">
               <h1 className="font-bold text-lg text-china-red leading-none">春联营销助手</h1>
               <span className="text-[10px] text-gray-400">商家运营版</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-full transition-colors ${hasCustomKey ? 'text-china-red bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
             </button>
             <div className="text-xs font-bold text-gray-300">
               {Object.values(WorkflowStep).indexOf(state.step) + 1}/3
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="h-[calc(100vh-64px)] relative">
          {state.step === WorkflowStep.UPLOAD && (
            <StepUpload 
              onNext={(couplet, door, copy) => setState(s => ({ 
                ...s, 
                coupletImage: couplet, 
                doorImage: door,
                originalCopy: copy,
                step: WorkflowStep.VISUALIZE 
              }))}
            />
          )}

          {state.step === WorkflowStep.VISUALIZE && state.coupletImage && (
            <StepVisualize 
              coupletImage={state.coupletImage}
              doorImage={state.doorImage}
              originalCopy={state.originalCopy}
              onBack={goBack}
              onConfirm={(selectedImage, finalCopy) => setState(s => ({ 
                ...s, 
                generatedImages: [selectedImage], // Keep track of the selected one
                generatedCopy: finalCopy,
                step: WorkflowStep.FINAL 
              }))}
            />
          )}

          {state.step === WorkflowStep.FINAL && state.generatedImages[0] && state.generatedCopy && (
            <StepFinal 
              image={state.generatedImages[0]}
              copy={state.generatedCopy}
              onReset={() => setState({
                step: WorkflowStep.UPLOAD,
                coupletImage: null,
                doorImage: null,
                originalCopy: { title: '', content: '' },
                generatedImages: [],
                selectedImageIndex: 0,
                generatedCopy: null,
                isLoading: false,
                error: null
              })}
            />
          )}
        </main>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          onSettingsChanged={checkKeyStatus}
        />
      </div>
    </div>
  );
};

export default App;
