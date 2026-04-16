import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';

interface Product {
  id: string | number;
  name: string;
  price: string | number;
  stock: number;
  image_url?: string;
  vendor_id?: number | string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  products?: Product[];
  imageUrl?: string;
}

const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'assistant', text: '¡Hola! Soy tu asistente inteligente de ShopStarter. Sube una foto o describe lo que estás buscando.' }
  ]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isProcessingVision, setIsProcessingVision] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessingVision, isSearching]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !imageFile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      imageUrl: previewUrl || undefined
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Clear inputs immediately
    const queryText = input;
    const currentFile = imageFile;
    setInput('');
    setImageFile(null);
    setPreviewUrl(null);
    
    if (currentFile) {
      setIsProcessingVision(true);
    } else {
      setIsSearching(true);
    }

    try {
      const formData = new FormData();
      formData.append('message', queryText);
      if (currentFile) {
        formData.append('image', currentFile);
      }

      const response = await api.post('/chat/assistant/', formData);

      // Clear loading states
      setIsProcessingVision(false);
      setIsSearching(false);

      if (response.data) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: response.data.reply,
          products: response.data.products
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (error: any) {
      console.error('Error in chat:', error?.response?.status, error?.response?.data || error?.message);
      setIsProcessingVision(false);
      setIsSearching(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Lo siento, tuve un problema al conectarme. ¿Puedes intentar en un momento?'
      }]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-xl hover:bg-darkprimary transition-transform focus:outline-none z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Icon icon="solar:chat-round-dots-bold-duotone" width={32} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-full max-w-sm sm:w-96 bg-white dark:bg-darkgray rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '600px', maxHeight: '85vh' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-primary text-white rounded-t-2xl shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Icon icon="solar:smart-home-bold-duotone" width={24} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--main-font)]">Geo Assistant</h3>
              <p className="text-xs text-white/80">IA en línea</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Icon icon="solar:close-circle-bold" width={24} />
          </button>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark relative">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Image Bubble */}
              {msg.imageUrl && (
                <div className={`mb-2 max-w-[80%] rounded-2xl overflow-hidden border-2 ${msg.sender === 'user' ? 'border-primary/20' : 'border-gray-200'}`}>
                  <img src={msg.imageUrl} alt="attachment" className="w-full h-auto max-h-48 object-cover" />
                </div>
              )}

              {/* Text Bubble */}
              {msg.text && (
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm font-[var(--main-font)] shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-darkgray text-gray-800 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-700'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              )}

              {/* Products Rendering */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 w-full max-w-[90%] bg-white p-3 rounded-2xl shadow-sm border border-indigo-50">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Recomendaciones para ti</p>
                  <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
                    {msg.products.map(product => (
                      <div key={product.id} className="min-w-[140px] border border-gray-100 rounded-xl overflow-hidden snap-start flex-shrink-0 group">
                        <div className="h-28 bg-gray-100 relative overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Icon icon="solar:gallery-bold" width={24} />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <h4 className="text-xs font-bold truncate" title={product.name}>{product.name}</h4>
                          <p className="text-primary font-black text-sm">${product.price}</p>
                          <button className="mt-2 w-full py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-xs font-bold rounded-lg transition-colors">
                            Ver o Añadir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}

          {/* Loaders */}
          {(isProcessingVision || isSearching) && (
            <div className="flex items-start">
              <div className="px-4 py-3 rounded-2xl bg-white dark:bg-darkgray border border-gray-100 rounded-bl-none shadow-sm flex items-center gap-2 text-sm text-gray-500">
                <Icon icon="solar:magic-stick-3-bold-duotone" className="text-primary animate-pulse" width={20} />
                {isProcessingVision ? "El ojo de la IA está procesando tu imagen..." : "Buscando en la base de datos..."}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preview Input Area */}
        {previewUrl && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-end gap-2 relative">
             <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary shadow-sm relative">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => {setImageFile(null); setPreviewUrl(null)}} 
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                >
                  <Icon icon="solar:close-square-bold" width={14} />
                </button>
             </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-darkgray border-t border-gray-100 dark:border-gray-700 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-primary hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0"
              title="Añadir imagen"
            >
              <Icon icon="solar:gallery-add-bold-duotone" width={24} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta o describe lo que buscas..."
              className="flex-1 bg-gray-100 dark:bg-dark border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-2 text-sm text-gray-800 dark:text-white"
            />
            <button 
              type="submit" 
              disabled={(!input.trim() && !imageFile) || isProcessingVision || isSearching}
              className="p-2 bg-primary hover:bg-darkprimary disabled:bg-gray-300 text-white rounded-full transition-colors flex-shrink-0"
            >
              <Icon icon="solar:map-arrow-right-bold" width={24} />
            </button>
          </div>
        </form>

      </div>
    </>
  );
};

export default FloatingAssistant;
