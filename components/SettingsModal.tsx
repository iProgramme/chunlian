
import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onSettingsChanged }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('SCW_API_KEY') || '');
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
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <a 
                  href="https://guojianapi.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-china-red font-bold hover:underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  没有密钥？点此购买获取 &rarr;
                </a>
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
