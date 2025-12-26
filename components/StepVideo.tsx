
import React, { useState } from 'react';
import { Button } from './Button';
import { generateCoupletVideo, getApiKey } from '../services/geminiService';

interface Props {
  image: string;
  onConfirm: (videoUrl: string) => void;
  onBack: () => void;
}

export const StepVideo: React.FC<Props> = ({ image, onConfirm, onBack }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // 检查是否有自定义Key
      const customKey = localStorage.getItem('SCW_API_KEY');
      
      // 只有在没有自定义Key的情况下，才走官方AiStudio的选Key流程
      if (!customKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }
      
      // 获取下载链接（不含key）
      const downloadLink = await generateCoupletVideo(image);
      
      // 使用正确的Key下载视频
      const effectiveKey = getApiKey();
      const response = await fetch(`${downloadLink}&key=${effectiveKey}`);
      
      if (!response.ok) throw new Error("Failed to download generated video.");
      
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      setVideoUrl(localUrl);

    } catch (err: any) {
      if (err.message && err.message.includes("Requested entity was not found")) {
         setError("API Key问题，请重新选择有效的项目或检查自定义Key。");
         // 如果是官方流程出错，重新打开选key
         if (!localStorage.getItem('SCW_API_KEY')) {
            await window.aistudio.openSelectKey();
         }
      } else {
         setError(err instanceof Error ? err.message : "视频生成失败");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-china-red">动态视频</h2>
          <p className="text-gray-500 text-sm">让画面动起来</p>
        </div>

        <div className="w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-lg relative">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              autoPlay 
              loop 
              muted 
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <img src={image} alt="Static Base" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                 {isGenerating ? (
                    <div className="flex flex-col items-center text-white space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                      <span className="text-sm font-medium bg-black/50 px-3 py-1 rounded-full">正在生成视频 (约1-2分钟)...</span>
                    </div>
                 ) : (
                    <div className="text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                      准备生成
                    </div>
                 )}
              </div>
            </>
          )}
        </div>
        
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="bg-paper-cream p-4 rounded-xl border border-stone-200">
           <h4 className="font-bold text-stone-700">视频效果</h4>
           <p className="text-sm text-stone-500">镜头缓慢拉近，模拟手持拍摄的微抖动感，营造春节热闹氛围。</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-red-100 flex gap-3 max-w-md mx-auto">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          返回
        </Button>
        {videoUrl ? (
          <Button className="flex-1" onClick={() => onConfirm(videoUrl)}>
            下一步
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? '生成中...' : '生成视频'}
          </Button>
        )}
      </div>
    </div>
  );
};
