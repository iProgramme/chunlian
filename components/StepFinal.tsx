
import React from 'react';
import { Button } from './Button';
import { SocialCopy } from '../types';

interface Props {
  image: string;
  copy: SocialCopy;
  onReset: () => void;
}

export const StepFinal: React.FC<Props> = ({ image, copy, onReset }) => {
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
        <div className="text-center py-4">
          <h2 className="text-3xl font-bold text-china-red">大功告成！🎉</h2>
          <p className="text-gray-500">您的新年作品已准备就绪。</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
          <div className="aspect-[3/4] bg-black">
             <img src={image} className="w-full h-full object-cover" alt="Final Result" />
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-lg">{copy.title}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{copy.content}</p>
          </div>
        </div>
      </div>

       <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-red-100 max-w-md mx-auto">
        <Button className="w-full" onClick={onReset}>
          再做一副
        </Button>
      </div>
    </div>
  );
};
