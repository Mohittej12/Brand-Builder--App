/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layout, 
  Type, 
  Newspaper, 
  Share2, 
  Loader2, 
  AlertCircle,
  Download,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { generateProductDescription, generateBrandImage, BrandAsset } from './services/aiService';

export default function App() {
  const [productInput, setProductInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'describing' | 'generating'>('idle');
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!productInput.trim()) return;

    setIsGenerating(true);
    setError(null);
    setAssets([]);
    
    try {
      setGenerationStep('describing');
      const detailedDescription = await generateProductDescription(productInput);
      
      setGenerationStep('generating');
      
      const mediums: Array<'billboard' | 'newspaper' | 'social'> = ['billboard', 'newspaper', 'social'];
      
      // Generate all images
      const results = await Promise.all(
        mediums.map(async (medium) => {
          const { url, prompt } = await generateBrandImage(detailedDescription, medium);
          return {
            id: Math.random().toString(36).substr(2, 9),
            medium: medium.charAt(0) + medium.slice(1),
            url,
            prompt
          };
        })
      );
      
      setAssets(results);
      setGenerationStep('idle');
    } catch (err) {
      console.error(err);
      setError('Something went wrong during generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.4em] text-orange-500 font-bold mb-2">Powered by Nano-Banana V2</span>
          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tighter uppercase">BRAND BUILDER</h1>
        </div>
        <div className="flex flex-col items-start md:items-end w-full md:w-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Consistency Engine</span>
          <div className="h-1.5 w-full md:w-64 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: isGenerating ? '70%' : assets.length > 0 ? '100%' : '5%' }}
              className="h-full bg-orange-500"
            />
          </div>
          <span className="text-[10px] mt-1 font-mono text-white/60">
            {isGenerating ? 'ANALYZING VECTORS...' : assets.length > 0 ? 'VECTOR MATCH: 98.4%' : 'IDLE'}
          </span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 p-8 max-w-[1600px] mx-auto w-full">
        {/* Sidebar: Control Console */}
        <aside className="md:col-span-3 flex flex-col gap-8 h-fit md:sticky md:top-40">
          <div className="bg-white/5 p-8 border border-white/10 flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
            
            <div className="space-y-4">
              <label htmlFor="product" className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50 block">
                Product Description
              </label>
              <textarea
                id="product"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="Describe your product... (e.g. Minimalist coffee thermos)"
                className="w-full h-48 bg-black/40 border border-white/5 rounded-none p-4 text-sm focus:outline-none focus:border-orange-500 transition-all resize-none placeholder:text-neutral-700 italic font-medium text-orange-100"
              />
            </div>

            <div className="h-px bg-white/10" />
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest text-white/40">Variation</span>
              <span className="text-xs font-mono text-orange-500">#NB-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !productInput.trim()}
              className="w-full py-5 bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">{generationStep === 'describing' ? 'CONCEPTUALIZING' : 'MANIFESTING'}</span>
                </>
              ) : (
                <>
                  <span className="text-xs tracking-widest">Generate Across Mediums</span>
                </>
              )}
            </button>

            <p className="text-[9px] text-white/30 uppercase leading-tight tracking-wider">
              System constrained to 3 parallel visualizations per batch. Image generation follows Nano-Banana safety protocols (No Humans).
            </p>
          </div>

          {error && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-[10px] uppercase font-bold tracking-widest"
              >
                {error}
              </motion.div>
            </AnimatePresence>
          )}
        </aside>

        {/* Results Area */}
        <section className="md:col-span-9">
          <AnimatePresence mode="wait">
            {assets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {assets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative border border-white/5 overflow-hidden flex flex-col bg-[#1A1A1A] ${
                      index === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square'
                    }`}
                  >
                    <div className="absolute top-4 left-6 z-20">
                      <span className="bg-black/90 px-3 py-1.5 text-[9px] uppercase tracking-widest font-black border border-white/10 shadow-xl">
                        Medium: {asset.medium === 'Billboard' ? '48-Sheet Billboard' : asset.medium}
                      </span>
                    </div>

                    <div className="flex-1 relative overflow-hidden">
                      <img
                        src={asset.url}
                        alt={asset.medium}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Overlay Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 gap-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[9px] font-mono text-white/50 max-w-lg line-clamp-2">
                            PROMPT: {asset.prompt}
                          </p>
                          <a 
                            href={asset.url} 
                            download={`${asset.medium}.png`}
                            className="p-4 bg-orange-500 text-black hover:bg-white transition-colors"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Footer decoration for each card */}
                    <div className="h-2 w-full flex">
                      <div className="h-full bg-orange-500 w-[15%]" />
                      <div className="h-full bg-white/10 flex-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center border border-white/5 relative overflow-hidden bg-[#0F0F0F]">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 z-10"
                >
                  <div className="w-32 h-32 border-4 border-white/5 rounded-full flex items-center justify-center mx-auto relative">
                    <ImageIcon className="w-10 h-10 text-white/10" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-t-4 border-orange-500/20 rounded-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">No Active Session</h3>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
                      Initialize generating sequences via the control console on the left.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="px-8 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-white/30 font-bold mb-8">
        <div className="flex gap-6">
          <span>Viewport: Optimized for 1024x768+</span>
          <span>© {new Date().getFullYear()} MOOD: BOLD_TYPE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-orange-500/20" />
            ))}
          </div>
          <span>Status: Consistency Engine Active</span>
        </div>
      </footer>
    </div>
  );
}
