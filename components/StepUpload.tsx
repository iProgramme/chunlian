
import React, { useCallback, useState, useEffect } from 'react';
import { Button } from './Button';
import { fileToBase64 } from '../services/utils';
import { extractInfoFromUrlContent, extractInfoFromUrlViaSearch, getApiKey } from '../services/geminiService';
import { SocialCopy } from '../types';

interface Props {
  onNext: (coupletImage: string, doorImage: string | null, copy: SocialCopy) => void;
}

export const StepUpload: React.FC<Props> = ({ onNext }) => {
  const [coupletImage, setCoupletImage] = useState<string | null>(null);
  const [doorImage, setDoorImage] = useState<string | null>(null);
  
  // Text Input State
  const [activeTab, setActiveTab] = useState<'manual' | 'link'>('manual');
  const [linkUrl, setLinkUrl] = useState("");
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [title, setTitle] = useState("2024龙年植绒立体春联");
  const [content, setContent] = useState("核心卖点：加厚植绒纸，不掉粉，立体烫金工艺，显得很大气。");
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  // API Key Status
  const [hasApiKey, setHasApiKey] = useState(false);

  // Check for API key periodically or on mount
  useEffect(() => {
    const checkKey = () => {
      const key = getApiKey();
      setHasApiKey(!!key);
    };
    
    checkKey();
    // Also listen for storage events in case it changes in another tab, 
    // though the main App logic passes props usually, checking here adds a layer of safety.
    const interval = setInterval(checkKey, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (type: 'couplet' | 'door') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        if (type === 'couplet') setCoupletImage(base64);
        else setDoorImage(base64);
      } catch (err) {
        console.error("File upload failed", err);
      }
    }
  };

  const handleFetchUrl = async () => {
    if (!linkUrl) return;
    setIsFetchingLink(true);
    setExtractionError(null);
    
    try {
      // 1. 智能清洗链接
      const urlRegex = /(https?:\/\/[^\s\u4e00-\u9fa5,，;；"']+)/;
      const match = linkUrl.match(urlRegex);
      const cleanUrl = match ? match[0] : linkUrl.trim();
      
      if (!cleanUrl.startsWith('http')) {
        throw new Error("链接格式无效");
      }

      console.log("Fetching content from:", cleanUrl);

      let extractedContent = null;

      // 2. 尝试使用本地服务器
      try {
        const res = await fetch('/extract-body', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl })
        });

        if (res.ok) {
           const data = await res.json();
           if (data.elements?.detailTitle) setTitle(data.elements.detailTitle);
           if (data.elements?.detailDesc) setContent(data.elements.detailDesc);
           
           if (data.elements?.detailTitle && data.elements?.detailDesc) {
             setActiveTab('manual');
             setIsFetchingLink(false);
             return;
           }
           if (data.content) extractedContent = data.content;
        }
      } catch (err) {
        console.warn("后端接口调用失败，切换至 Search 方案。", err);
      }

      // 3. AI 智能分析
      let aiResult;
      if (extractedContent) {
        aiResult = await extractInfoFromUrlContent(extractedContent);
      } else {
        aiResult = await extractInfoFromUrlViaSearch(cleanUrl);
      }

      // 4. Update UI
      if (aiResult.title && aiResult.title !== "AI 智能提取结果") setTitle(aiResult.title);
      if (aiResult.content && aiResult.content !== "未能提取有效内容，请手动补充。") setContent(aiResult.content);
      
      setActiveTab('manual'); 
      if (!aiResult.title && !aiResult.content) setExtractionError("未能提取有效内容，请手动输入。");

    } catch (e: any) {
      console.error("Extraction flow error:", e);
      setExtractionError("提取失败，请手动输入。");
      setActiveTab('manual');
    } finally {
      setIsFetchingLink(false);
    }
  };

  const handleNext = () => {
    if (coupletImage && title && content) {
      onNext(coupletImage, doorImage, { title, content });
    }
  };

  const renderUploadBox = (type: 'couplet' | 'door', label: string, imageState: string | null, helpText?: string) => (
    <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">{label}</label>
        {helpText && <p className="text-xs text-red-400">{helpText}</p>}
        {imageState ? (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-red-200 group">
             <img src={imageState} alt="Uploaded" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" className="bg-white border-none text-xs px-3 py-1" onClick={() => type === 'couplet' ? setCoupletImage(null) : setDoorImage(null)}>
                    更换图片
                </Button>
             </div>
          </div>
        ) : (
          <div className="w-full aspect-[4/3] border-2 border-dashed border-red-300 rounded-2xl flex flex-col items-center justify-center bg-white shadow-sm relative overflow-hidden group hover:border-china-red transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange(type)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="text-red-300 group-hover:text-china-red transition-colors flex flex-col items-center p-2 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
              <span className="mt-2 text-xs font-medium">上传图片</span>
            </div>
          </div>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto no-scrollbar pb-24 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-china-red">第一步：配置商品素材</h2>
        <p className="text-gray-600 text-sm">专为运营优化：上传商品图，自动生成带货物料</p>
      </div>

      {/* Image Upload Grid */}
      <div className="grid grid-cols-2 gap-3">
         {renderUploadBox('couplet', '1. 商品平面图 (必需)', coupletImage, '建议上传高清、正面的对联产品图')}
         {renderUploadBox('door', '2. 特定场景图 (可选)', doorImage, '若无特定场景，AI将自动匹配优质大门背景')}
      </div>

      {/* Text Input */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-700">3. 卖点提取与文案配置</label>
        
        <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'manual' ? 'bg-white text-china-red shadow-sm' : 'text-gray-500'}`}
            onClick={() => setActiveTab('manual')}
          >
            手动输入卖点
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'link' ? 'bg-white text-china-red shadow-sm' : 'text-gray-500'}`}
            onClick={() => setActiveTab('link')}
          >
            商品链接提取
          </button>
        </div>

        {activeTab === 'link' ? (
          <div className="space-y-2 animate-fade-in">
             <textarea 
               value={linkUrl}
               onChange={(e) => setLinkUrl(e.target.value)}
               className="w-full p-3 rounded-xl border border-gray-200 focus:border-china-red outline-none text-sm"
               rows={3}
               placeholder="粘贴包含链接的文本，系统将自动抓取产品标题和详情..."
             />
             <div className="flex items-center justify-between">
               <p className="text-xs text-gray-400">支持天猫/淘宝/京东/小红书等链接</p>
               {linkUrl && <button className="text-xs text-red-500 font-bold" onClick={() => setLinkUrl('')}>清空</button>}
             </div>
             
             <Button variant="secondary" fullWidth onClick={handleFetchUrl} disabled={!linkUrl || isFetchingLink}>
               {isFetchingLink ? '正在分析页面...' : '一键提取商品信息'}
             </Button>

             {extractionError && (
                 <p className="text-xs text-red-500 text-center mt-2">{extractionError}</p>
             )}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-china-red outline-none"
              placeholder="商品名称 / 标题"
            />
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-china-red outline-none"
              placeholder="核心卖点 (如：植绒、立体、不掉色、高端大气)..."
            />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-red-100 max-w-md mx-auto z-20 space-y-2">
        {!hasApiKey && (
          <div className="bg-red-50 text-red-600 text-xs p-2 rounded text-center animate-pulse">
            请先点击右上角设置图标配置 API Key
          </div>
        )}
        <Button fullWidth onClick={handleNext} disabled={!coupletImage || !title || !content || !hasApiKey}>
          {hasApiKey ? '下一步：批量生成物料' : '请先配置 API Key'}
        </Button>
      </div>
    </div>
  );
};
