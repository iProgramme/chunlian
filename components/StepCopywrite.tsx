
import React, { useState } from 'react';
import { Button } from './Button';
import { generateSocialCopy } from '../services/geminiService';
import { SocialCopy } from '../types';

interface Props {
  onConfirm: (copy: SocialCopy) => void;
  onBack: () => void;
}

export const StepCopywrite: React.FC<Props> = ({ onConfirm, onBack }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'link'>('manual');
  const [linkUrl, setLinkUrl] = useState("");
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  
  const [titleTemplate, setTitleTemplate] = useState("新年快乐，龙年大吉");
  const [contentTemplate, setContentTemplate] = useState("这款春联质量很好，寓意也好，适合贴在家里。");
  const [generatedCopy, setGeneratedCopy] = useState<SocialCopy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFetchUrl = async () => {
    if (!linkUrl) return;
    setIsFetchingLink(true);
    try {
      // Use the new backend endpoint to bypass CORS and extract specific elements
      const response = await fetch('/extract-body', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkUrl })
      });
      
      if (!response.ok) throw new Error("Fetch failed");
      
      const data = await response.json();
      
      const extractedTitle = data.elements?.detailTitle;
      const extractedDesc = data.elements?.detailDesc;

      if (extractedTitle) setTitleTemplate(extractedTitle.trim());
      if (extractedDesc) setContentTemplate(extractedDesc.trim());

      if (!extractedTitle && !extractedDesc) {
        alert("未能识别到指定内容，请确认链接页面包含 #detail-title 或 #detail-desc 元素。");
      } else {
        setActiveTab('manual'); // Switch to manual view to show extracted content
      }
    } catch (e) {
      console.error(e);
      alert("内容提取失败，请检查链接或确保后端服务已启动。");
    } finally {
      setIsFetchingLink(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSocialCopy(titleTemplate, contentTemplate);
      setGeneratedCopy(result);
    } catch (err) {
      alert("生成文案失败，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-china-red">小红书文案</h2>
          <p className="text-gray-500 text-sm">智能生成爆款文案</p>
        </div>

        {!generatedCopy ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'manual' ? 'bg-white text-china-red shadow-sm' : 'text-gray-500'}`}
                onClick={() => setActiveTab('manual')}
              >
                手动输入
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'link' ? 'bg-white text-china-red shadow-sm' : 'text-gray-500'}`}
                onClick={() => setActiveTab('link')}
              >
                链接提取
              </button>
            </div>

            {activeTab === 'link' ? (
              <div className="space-y-4 animate-fade-in py-4">
                 <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">粘贴链接</label>
                  <input 
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-china-red focus:ring-1 focus:ring-china-red outline-none"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    系统将尝试提取页面中的标题(#detail-title)和详情(#detail-desc)
                  </p>
                </div>
                <Button variant="secondary" fullWidth onClick={handleFetchUrl} disabled={!linkUrl || isFetchingLink}>
                  {isFetchingLink ? '提取中...' : '提取内容'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">标题参考</label>
                  <input 
                    value={titleTemplate}
                    onChange={(e) => setTitleTemplate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-china-red focus:ring-1 focus:ring-china-red outline-none"
                    placeholder="输入标题关键词..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">内容详情</label>
                  <textarea 
                    value={contentTemplate}
                    onChange={(e) => setContentTemplate(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-china-red focus:ring-1 focus:ring-china-red outline-none"
                    placeholder="输入详细的文案内容..."
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 relative">
               <span className="absolute top-2 right-2 text-xs font-bold text-red-300">标题</span>
               <textarea
                  value={generatedCopy.title}
                  onChange={(e) => setGeneratedCopy({...generatedCopy, title: e.target.value})}
                  className="w-full text-lg font-bold text-gray-800 bg-transparent outline-none resize-none"
                  rows={2}
               />
               <div className="text-right text-xs text-gray-400">{generatedCopy.title.length}/24</div>
             </div>

             <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 relative">
               <span className="absolute top-2 right-2 text-xs font-bold text-red-300">正文</span>
               <textarea
                  value={generatedCopy.content}
                  onChange={(e) => setGeneratedCopy({...generatedCopy, content: e.target.value})}
                  className="w-full text-sm text-gray-600 bg-transparent outline-none resize-none h-64"
               />
               <div className="text-right text-xs text-gray-400">限300字</div>
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-red-100 flex gap-3 max-w-md mx-auto">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          返回
        </Button>
        {generatedCopy ? (
          <>
             <Button variant="secondary" onClick={handleGenerate} disabled={isGenerating}>
              重新生成
            </Button>
            <Button className="flex-1" onClick={() => onConfirm(generatedCopy)}>
              完成
            </Button>
          </>
        ) : (
          <Button className="flex-1" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? '正在创作...' : '智能生成文案'}
          </Button>
        )}
      </div>
    </div>
  );
};
