
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { generateDoorVisualization, generateSocialCopy } from '../services/geminiService';
import { SocialCopy } from '../types';

interface Props {
  coupletImage: string;
  doorImage: string | null;
  originalCopy: SocialCopy;
  onConfirm: (selectedImage: string, finalCopy: SocialCopy) => void;
  onBack: () => void;
}

const DEFAULT_DOOR_STYLES = [
  "现代小区防盗门",
  "豪华别墅大门",
  "农村老式木门",
  "古色古香大宅门",
  "商铺玻璃门",
  "自定义"
];

const COUNTS = [1, 2, 3, 4];

export const StepVisualize: React.FC<Props> = ({ coupletImage, doorImage, originalCopy, onConfirm, onBack }) => {
  // Config State
  const [stylesList, setStylesList] = useState(DEFAULT_DOOR_STYLES);
  const [doorStyle, setDoorStyle] = useState(DEFAULT_DOOR_STYLES[0]);
  const [customStyle, setCustomStyle] = useState("");
  const [imageCount, setImageCount] = useState(1);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Result State
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [generatedCopy, setGeneratedCopy] = useState<SocialCopy | null>(null);
  
  // UI State
  const [isGenerating, setIsGenerating] = useState(false); // Overall (Images + Copy)
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false); // Just Copy
  const [error, setError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Initialize styles based on props
  useEffect(() => {
    if (doorImage) {
      const newStyles = ["自家大门", ...DEFAULT_DOOR_STYLES];
      setStylesList(newStyles);
      setDoorStyle("自家大门");
    } else {
      setStylesList(DEFAULT_DOOR_STYLES);
      setDoorStyle(DEFAULT_DOOR_STYLES[0]);
    }
  }, [doorImage]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setHasGenerated(true);
    setGeneratedImages([]);
    setGeneratedCopy(null);

    const stylePrompt = doorStyle === "自定义" ? customStyle : doorStyle;
    if (doorStyle === "自定义" && !stylePrompt) {
        setError("请输入自定义门的样式");
        setIsGenerating(false);
        return;
    }

    try {
      // Parallel requests for images
      const imagePromises = Array(imageCount).fill(0).map(() => 
        generateDoorVisualization(coupletImage, stylePrompt, doorImage)
      );
      
      // Request for Copy
      const copyPromise = generateSocialCopy(originalCopy.title, originalCopy.content);

      const [images, copy] = await Promise.all([
        Promise.all(imagePromises),
        copyPromise
      ]);

      setGeneratedImages(images);
      setGeneratedCopy(copy);
      setSelectedIndex(0);

    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateCopy = async () => {
    if (!originalCopy.title && !originalCopy.content) return;
    setIsGeneratingCopy(true);
    try {
      const copy = await generateSocialCopy(originalCopy.title, originalCopy.content);
      setGeneratedCopy(copy);
    } catch (err) {
      console.error(err);
      // Optional: show a small toast error
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleNext = () => {
    if (generatedImages.length > 0 && generatedCopy) {
      onConfirm(generatedImages[selectedIndex], generatedCopy);
    }
  };

  const copyToClipboard = (text: string, type: 'title' | 'content') => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-24">
        
        {/* Configuration Section - Compact if generated */}
        <div className="space-y-4 bg-white p-4 rounded-xl border border-red-100 shadow-sm">
          <h2 className="text-lg font-bold text-china-red">生成配置</h2>
          
          {/* Door Style */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">选择门的样式</label>
            <div className="flex flex-wrap gap-2">
              {stylesList.map(style => (
                <button
                  key={style}
                  onClick={() => setDoorStyle(style)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    doorStyle === style 
                    ? 'bg-china-red text-white border-china-red' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-red-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            {doorStyle === "自定义" && (
              <input 
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                placeholder="例如：红色的双开大门..."
                className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-china-red"
              />
            )}
            {doorStyle === "自家大门" && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                ✓ 已选择您上传的大门图片
              </p>
            )}
          </div>

          {/* Count */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">生成数量</label>
            <div className="flex gap-2">
              {COUNTS.map(count => (
                <button
                  key={count}
                  onClick={() => setImageCount(count)}
                  className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all ${
                    imageCount === count
                    ? 'bg-china-gold text-red-900 shadow-md'
                    : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          
          {!hasGenerated && (
             <Button fullWidth onClick={handleGenerate} disabled={isGenerating}>
               {isGenerating ? '开始生成' : '一键生成效果与文案'}
             </Button>
          )}
        </div>

        {/* Results Section */}
        {hasGenerated && (
          <div className="space-y-6 animate-fade-in">
            {isGenerating ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red"></div>
                <p>正在施展魔法 (生成图片和文案)...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg flex flex-col gap-2">
                <p>{error}</p>
                <Button variant="outline" onClick={handleGenerate} className="bg-white">
                  重试
                </Button>
              </div>
            ) : (
              <>
                 {/* 1. Image Grid */}
                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <h3 className="font-bold text-gray-800">1. 选择最佳效果图</h3>
                     <span className="text-xs text-gray-400">点击放大查看</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     {generatedImages.map((img, idx) => (
                       <div 
                         key={idx}
                         onClick={() => setSelectedIndex(idx)}
                         className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                           selectedIndex === idx ? 'border-china-red shadow-lg scale-[1.02]' : 'border-transparent opacity-80'
                         }`}
                       >
                         <img src={img} className="w-full h-full object-cover" />
                         <div className="absolute top-2 right-2" onClick={(e) => { e.stopPropagation(); setZoomedImage(img); }}>
                           <div className="bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                           </div>
                         </div>
                         {selectedIndex === idx && (
                           <div className="absolute bottom-2 right-2 bg-china-red text-white text-xs px-2 py-1 rounded-full">已选</div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* 2. Copy Comparison */}
                 {generatedCopy && (
                   <div className="space-y-2">
                     <h3 className="font-bold text-gray-800">2. 文案优化对比</h3>
                     <div className="grid grid-cols-1 gap-4">
                        {/* Original - Read Only */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="text-xs font-bold text-gray-400 mb-1 block">原文</span>
                          <div className="text-sm font-bold text-gray-600 mb-1">{originalCopy.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-3">{originalCopy.content}</div>
                        </div>

                        {/* Generated - Editable */}
                        <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm relative space-y-3">
                           {isGeneratingCopy && (
                              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                                <div className="animate-spin w-6 h-6 border-2 border-china-red border-t-transparent rounded-full"></div>
                              </div>
                           )}
                           <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-china-red">AI 优化 (可编辑)</span>
                                <button 
                                  onClick={handleRegenerateCopy} 
                                  disabled={isGeneratingCopy}
                                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full hover:bg-red-100 flex items-center gap-1 transition-colors border border-red-100"
                                  title="只重新生成标题和正文"
                                >
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                                    换一版
                                  </span>
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => copyToClipboard(generatedCopy.title, 'title')}
                                  className="text-xs text-gray-400 hover:text-china-red flex items-center gap-1"
                                >
                                  {copyFeedback === 'title' ? '已复制' : '复制标题'}
                                </button>
                                <div className="w-px h-3 bg-gray-200"></div>
                                <button 
                                  onClick={() => copyToClipboard(generatedCopy.content, 'content')}
                                  className="text-xs text-gray-400 hover:text-china-red flex items-center gap-1"
                                >
                                  {copyFeedback === 'content' ? '已复制' : '复制文案'}
                                </button>
                              </div>
                           </div>
                           
                           <input
                             value={generatedCopy.title}
                             onChange={(e) => setGeneratedCopy({...generatedCopy, title: e.target.value})}
                             className="w-full font-bold text-gray-800 bg-transparent outline-none border-b border-gray-100 pb-2"
                           />
                           <textarea
                             value={generatedCopy.content}
                             onChange={(e) => setGeneratedCopy({...generatedCopy, content: e.target.value})}
                             className="w-full text-sm text-gray-600 bg-transparent outline-none resize-none h-32"
                           />
                        </div>
                     </div>
                   </div>
                 )}
                 
                 <Button variant="secondary" fullWidth onClick={handleGenerate}>
                   不满意？全部重做 (含图片)
                 </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-red-100 flex gap-3 max-w-md mx-auto">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>返回</Button>
        <Button className="flex-1" onClick={handleNext} disabled={!hasGenerated || isGenerating || !generatedCopy}>
          确认并完成
        </Button>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-xl font-bold bg-white/20 w-10 h-10 rounded-full">×</button>
        </div>
      )}
    </div>
  );
};
