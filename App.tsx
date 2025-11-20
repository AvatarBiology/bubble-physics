
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { BubbleHeroScene } from './components/Bubble3D';
import { BubbleMechanicsLab } from './components/MechanicsLab';
import { ArrowDown, Menu, X, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-blue-200 selection:text-stone-900">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1 border border-white/50">B</div>
            <span className={`font-serif font-bold text-lg tracking-wide transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              BUBBLE <span className="font-normal text-stone-500">PHYSICS</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600">
            <a href="#intro" onClick={scrollToSection('intro')} className="hover:text-blue-500 transition-colors cursor-pointer uppercase">導讀</a>
            <a href="#experiments" onClick={scrollToSection('experiments')} className="hover:text-blue-500 transition-colors cursor-pointer uppercase">虛擬實驗室</a>
            <a href="#conclusion" onClick={scrollToSection('conclusion')} className="hover:text-blue-500 transition-colors cursor-pointer uppercase">結語</a>
            <div className="px-4 py-1.5 bg-stone-200 rounded-full text-xs font-bold text-stone-600">
              科學發展月刊
            </div>
          </div>

          <button className="md:hidden text-stone-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F9F8F4] flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
            <a href="#intro" onClick={scrollToSection('intro')}>導讀</a>
            <a href="#experiments" onClick={scrollToSection('experiments')}>虛擬實驗室</a>
            <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full bg-stone-200"><X /></button>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <BubbleHeroScene />
        
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.0)_0%,rgba(249,248,244,0.8)_80%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-block mb-6 px-4 py-1 border border-stone-300 text-stone-500 text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-md bg-white/40">
            專題報導
          </div>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-medium leading-tight mb-6 text-stone-900 drop-shadow-sm tracking-tight">
            冒泡的美
          </h1>
          <p className="font-serif text-2xl md:text-3xl text-stone-600 italic mb-8">
            The Beauty of Bubbles
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-300 to-purple-300 mx-auto mb-8 rounded-full"></div>
          <p className="max-w-xl mx-auto text-sm md:text-base text-stone-500 font-medium tracking-widest uppercase mb-12">
            傅宗玫、陳正平 ／ 台灣大學大氣科學研究所
          </p>
          
          <div className="flex justify-center animate-bounce">
             <a href="#intro" onClick={scrollToSection('intro')} className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all text-stone-400 hover:text-stone-800">
                <ArrowDown size={20} />
             </a>
          </div>
        </div>
      </header>

      <main>
        {/* Introduction */}
        <section id="intro" className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative z-10">
            <div className="md:col-span-4">
              <h2 className="font-serif text-4xl mb-6 leading-tight text-stone-900">前言</h2>
              <div className="w-12 h-1 bg-blue-300 mb-6"></div>
              <p className="text-stone-500 text-sm leading-loose font-serif italic">
                「請吹一個泡泡，並好好觀察它。你可以窮一生之力對它進行研究，而不斷獲得物理學的知識。」<br/>
                — Lord Kelvin (1824-1907)
              </p>
            </div>
            <div className="md:col-span-8 text-lg text-stone-600 leading-relaxed space-y-8 font-sans text-justify">
              <p>
                <span className="text-6xl float-left mr-4 mt-[-12px] font-serif text-blue-300 opacity-80">應</span>該很少人小時候不愛吹肥皂泡泡的吧！陽光燦爛的午後，看著一個個球形出現，隨著微風飄舞。泡泡既完美又脆弱的特質，和泡膜上反射出的斑斕色彩，都令人深深著迷。然而，這美麗的背後隱藏著深刻的物理、化學與數學原理。
              </p>
              
              <div className="grid gap-6">
                  <div className="border-l-2 border-blue-200 pl-6">
                      <h3 className="font-serif text-xl text-stone-800 mb-2">泡膜力學</h3>
                      <p className="text-base text-stone-500">
                          為什麼吹出來的泡泡會呈完美的球形？這源於<strong className="text-stone-700">表面張力</strong>傾向於採取最小表面積的特性。而當兩個大小不同的泡泡連通時，空氣流動的方向往往違反直覺——這正是我們將在實驗室中探索的「連通管悖論」。
                      </p>
                  </div>
                  
                  <div className="border-l-2 border-blue-200 pl-6">
                      <h3 className="font-serif text-xl text-stone-800 mb-2">幾何結構</h3>
                      <p className="text-base text-stone-500">
                         當多個泡泡聚集時，它們會遵循普拉圖定律 (Plateau's Laws) 自動形成特定的幾何結構。泡膜總是尋找能量最低的狀態，透過數學模型，我們可以證明這些結構是連接多點的最短路徑。
                      </p>
                  </div>

                  <div className="border-l-2 border-blue-200 pl-6">
                      <h3 className="font-serif text-xl text-stone-800 mb-2">光學干涉</h3>
                      <p className="text-base text-stone-500">
                          泡膜上的彩虹並非來自色素，而是<strong className="text-stone-700">薄膜干涉</strong>的結果。光線在薄膜上下表面反射並相互作用，隨著重力使膜厚改變，顏色也隨之產生迷人的動態變化。
                      </p>
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Experiments Section */}
        <section id="experiments" className="py-24 bg-[#F5F7FA] border-t border-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                        Interactive Laboratory
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-900">泡泡科學實驗室</h2>
                    <p className="text-lg text-stone-600 leading-relaxed">
                       從數學模型到物理現象，透過互動模擬深入了解泡泡的奧秘。
                       請選擇下方頁籤開始探索。
                    </p>
                </div>

                {/* The Tabbed Simulation Component */}
                <BubbleMechanicsLab />

            </div>
        </section>

         {/* Conclusion / More Topics */}
         <section id="conclusion" className="py-24 bg-white border-t border-stone-100">
            <div className="container mx-auto px-6 text-center">
                <h2 className="font-serif text-3xl text-stone-900 mb-4">結語</h2>
                <p className="text-stone-500 mb-8 max-w-2xl mx-auto leading-relaxed">
                    透過許多科學家在物理、化學、數學和生物學方面的研究，我們對於泡泡、表面相關問題終於有了較多的瞭解。
                    今日，不論學術界和工業界對於「表面」現象仍然非常重視，包括物質表面的原子排列和化學反應機制及其應用，都是方興未艾的研究課題。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                     {/* Simple visual placeholders for other topics */}
                    <div className="h-32 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center p-4">
                        <span className="font-serif font-bold mb-2">海沫 (Sea Spray)</span>
                        <span className="text-xs text-stone-400">氣候影響與凝結核</span>
                    </div>
                    <div className="h-32 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center p-4">
                        <span className="font-serif font-bold mb-2">生命起源</span>
                        <span className="text-xs text-stone-400">脂類分子與原始細胞</span>
                    </div>
                    <div className="h-32 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center p-4">
                        <span className="font-serif font-bold mb-2">泡泡配方</span>
                        <span className="text-xs text-stone-400">甘油與表面張力</span>
                    </div>
                </div>
            </div>
         </section>

      </main>

      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <div>
                <div className="text-white font-serif font-bold text-xl mb-1">Bubble Science</div>
                <p className="text-xs text-stone-500">Based on "The Beauty of Bubbles", Science Development Journal Vol 29 No 11.</p>
            </div>
            <div className="mt-4 md:mt-0 text-xs">
                Visualization generated by AI
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
