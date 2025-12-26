
import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onSettingsChanged }) => {
  const [apiKey, setApiKey] = useState('');
  const [copyStatus, setCopyStatus] = useState(''); // State for copy feedback

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('SCW_API_KEY') || '');
      setCopyStatus('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('SCW_API_KEY', apiKey.trim());
    } else {
      localStorage.removeItem('SCW_API_KEY');
    }
    
    // Notify parent to update state immediately without reloading
    onSettingsChanged();
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('SCW_API_KEY');
    setApiKey('');
    onSettingsChanged();
    onClose();
  };

  const handleCopyWeChat = () => {
      navigator.clipboard.writeText('teachAIGC');
      setCopyStatus('已复制');
      setTimeout(() => setCopyStatus(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-china-red p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">API 授权配置</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white" type="button">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">请输入 API Key</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入密钥..."
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-china-red outline-none text-sm font-mono"
            />
            
            {/* 说明区域 */}
            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 leading-relaxed">
              <p className="font-bold text-gray-700 mb-1">说明：</p>
              <ul className="list-disc pl-4 space-y-1 mb-2">
                <li>支持输入官方 Google Gemini Key。</li>
                <li>支持输入渠道专用 Key（更优惠）。</li>
                <li>系统将根据 Key 自动识别并配置网络线路。</li>
              </ul>
              
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                {/* 渠道1：网站 */}
                <a 
                  href="https://guojianapi.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-china-red font-bold hover:underline group"
                >
                  <span className="bg-red-100 p-1 rounded-full group-hover:bg-red-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </span>
                  没有密钥？点此在线购买 &rarr;
                </a>

                {/* 渠道2：微信 */}
                <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="bg-green-100 text-green-600 p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </span>
                        <span>或加微信购买：</span>
                    </div>
                    <button 
                        onClick={handleCopyWeChat}
                        className="font-mono font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-all active:scale-95 flex items-center gap-1"
                        title="点击复制"
                        type="button"
                    >
                        teachAIGC
                        {copyStatus ? (
                            <span className="text-green-600 text-[10px] scale-75 block">{copyStatus}</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        )}
                    </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClear} className="flex-1 text-xs">
              清除配置
            </Button>
            <Button onClick={handleSave} className="flex-[2]">
              保存并生效
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
