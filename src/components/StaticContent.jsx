import React, { useEffect, useRef } from 'react';
import { Coffee, MapPin, Clock, ArrowRight, Wind, Star, Sun, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StaticContent = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered Title Reveals
      gsap.utils.toArray('.staggered-title').forEach((title) => {
        gsap.from(title, {
          y: 60,
          opacity: 0,
          rotateX: -20,
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: {
            trigger: title,
            start: "top 90%",
          }
        });
      });

      // Reveal Sections with a subtle scale
      gsap.utils.toArray('.reveal-section').forEach((section) => {
        gsap.fromTo(section, 
          { opacity: 0, scale: 0.98 },
          { 
            opacity: 1, 
            scale: 1,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
            }
          }
        );
      });

      // Parallax Images - more pronounced
      gsap.utils.toArray('.parallax-img').forEach((img) => {
        gsap.to(img, {
          yPercent: -25,
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            scrub: 1.5
          }
        });
      });

      // Menu Item Reveals
      gsap.from('.menu-item', {
        x: -40,
        opacity: 0,
        stagger: 0.2,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '#rituals',
          start: "top 60%",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] text-vienna-brown selection:bg-vienna-brown selection:text-white pb-32">
      
      {/* Section: Heritage */}
      <section id="heritage" className="py-40 px-6 sm:px-12 md:px-24 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-1 border-l border-vienna-brown/20 h-full hidden lg:block" />
            
            <div className="lg:col-span-6">
                <span className="text-[10px] uppercase tracking-[0.6em] text-vienna-brown/40 block mb-6 staggered-title">Established 1984</span>
                <h2 className="text-6xl sm:text-8xl md:text-9xl leading-[0.9] mb-12 italic staggered-title">The Art of <br/> Stillness</h2>
                <div className="space-y-8 text-xl sm:text-2xl font-sans font-light leading-relaxed max-w-xl reveal-section">
                    <p className="first-letter:text-7xl first-letter:float-left first-letter:mr-4 first-letter:font-serif first-letter:italic">
                        Vienna was born from a singular obsession: the transition between the frantic pace of the city and the quietude of the first sip. 
                    </p>
                    <p>
                        We didn't just build a cafe; we curated a sanctuary where time behaves differently. Every beam of light, every grain of wood, and every drop of espresso is choreographed to return you to yourself.
                    </p>
                </div>
            </div>

            <div className="lg:col-span-5 relative mt-12 lg:mt-0">
                <div className="aspect-[3/4] overflow-hidden rounded-sm group relative reveal-section">
                    <img 
                        src="/assets/posters/2-Entering.png" 
                        alt="Vienna Entrance" 
                        className="parallax-img w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 border-[20px] border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                </div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-vienna-green p-8 flex items-center justify-center rounded-full text-white rotate-12 hover:rotate-0 transition-transform duration-700">
                    <span className="text-center text-[10px] uppercase tracking-[0.3em] leading-tight font-serif italic">Pure <br/> Craftsmanship</span>
                </div>
            </div>
        </div>
      </section>

      {/* Section: Rituals (The Menu) */}
      <section id="rituals" className="py-40 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-vienna-beige/5 pointer-events-none" />
        
        <div className="px-6 sm:px-12 md:px-24 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                <div>
                   <span className="text-[10px] uppercase tracking-[0.6em] text-vienna-brown/40 block mb-6 reveal-section">Curated Selection</span>
                   <h2 className="text-6xl sm:text-7xl italic font-serif reveal-section">Morning Rituals</h2>
                </div>
                <p className="max-w-md text-vienna-brown/60 font-sans italic text-lg text-right reveal-section">
                    "A curated collection of sensory experiences, from the boldest single-origin to the most delicate floral infusions."
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
                {[
                    { name: 'Onyx Reserve', type: 'Espresso', desc: 'Dark chocolate, smoked cedar, and a hint of wild berry.' },
                    { name: 'Floral Mist', type: 'Pour Over', desc: 'Light, tea-like body with notes of jasmine and citrus zest.' },
                    { name: 'The Cloud', type: 'Cappuccino', desc: 'Velvety micro-foam atop our signature signature blend.' },
                    { name: 'Cold Stone', type: 'Nitro Brew', desc: 'Slow-steeped for 24 hours, finished with honeycomb.' },
                    { name: 'Green Haven', type: 'Ceremonial Matcha', desc: 'Whisked with precision, serving calm in every drop.' },
                    { name: 'Amber Glow', type: 'Spice Latte', desc: 'A warm embrace of cinnamon, nutmeg, and aged vanilla.' }
                ].map((drink, i) => (
                    <div key={i} className="group cursor-pointer menu-item">
                        <div className="mb-8 border-b border-vienna-brown/10 pb-4 flex justify-between items-end group-hover:border-vienna-brown transition-colors duration-500">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-vienna-green font-bold">{drink.type}</span>
                            <span className="text-vienna-brown/40 group-hover:text-vienna-brown transition-colors">0{i+1}</span>
                        </div>
                        <h3 className="text-3xl font-serif mb-4 italic group-hover:translate-x-2 transition-transform duration-500">{drink.name}</h3>
                        <p className="text-vienna-brown/60 font-sans font-light text-sm tracking-wide leading-relaxed">{drink.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Section: The Essence (Interactive Gallery) */}
      <section id="gallery" className="py-40 bg-[#080808] text-vienna-cream min-h-screen flex flex-col justify-center">
        <div className="px-6 md:px-24 mb-24 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-12">
             <h2 className="text-6xl sm:text-8xl italic font-serif staggered-title">The Essence</h2>
             <div className="flex gap-16 reveal-section">
                <div className="text-center">
                    <span className="block text-4xl mb-2 italic">12k</span>
                    <span className="text-[8px] uppercase tracking-[0.4em] opacity-40">Cups Shared</span>
                </div>
                <div className="text-center">
                    <span className="block text-4xl mb-2 italic">15</span>
                    <span className="text-[8px] uppercase tracking-[0.4em] opacity-40">Roast Levels</span>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 h-[60vh] md:h-[80vh] reveal-section">
            <div className="bg-vienna-brown/20 overflow-hidden relative group">
                <img src="/assets/posters/7.png" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center px-8 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] font-sans">The Facade</span>
                </div>
            </div>
            <div className="bg-vienna-brown/20 overflow-hidden relative group row-span-2">
                <img src="/assets/posters/3-Coffee_blending.png" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center px-8 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] font-sans">The Alchemy</span>
                </div>
            </div>
            <div className="bg-vienna-brown/20 overflow-hidden relative group">
                <img src="/assets/posters/4-Espresso_pour.png" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center px-8 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] font-sans">The Extraction</span>
                </div>
            </div>
            <div className="bg-vienna-brown/20 overflow-hidden relative group row-span-2">
                <img src="/assets/posters/5-Mixing_sugar.png" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center px-8 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] font-sans">The Balance</span>
                </div>
            </div>
            <div className="bg-vienna-brown/20 overflow-hidden relative group">
                <img src="/assets/posters/8.png" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center px-8 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] font-sans">The Moment</span>
                </div>
            </div>
            <div className="bg-vienna-brown/20 overflow-hidden relative group">
                <img src="/assets/posters/2-Entering.png" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center px-8 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] font-sans">The Welcome</span>
                </div>
            </div>
        </div>
      </section>

      {/* Section: The Promise */}
      <section className="reveal-section py-40 px-6 sm:px-12 md:px-24">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl sm:text-7xl mb-16 italic font-serif staggered-title">Why Vienna?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="flex flex-col items-center">
                    <ShieldCheck className="w-12 h-12 mb-6 text-vienna-green" />
                    <h3 className="text-xl font-bold uppercase tracking-[0.2em] mb-4">Ethical Sourcing</h3>
                    <p className="text-vienna-brown/60 text-sm leading-relaxed">Direct trade relationships with family-owned farms across Ethiopia and Brazil.</p>
                </div>
                <div className="flex flex-col items-center">
                    <Wind className="w-12 h-12 mb-6 text-vienna-green" />
                    <h3 className="text-xl font-bold uppercase tracking-[0.2em] mb-4">Zero Waste Goal</h3>
                    <p className="text-vienna-brown/60 text-sm leading-relaxed">Compostable packaging and a commitment to reducing our urban footprint.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer / Visit */}
      <footer id="visit" className="bg-vienna-brown text-vienna-cream py-40 px-6 md:px-24 relative overflow-hidden reveal-section">
        <div className="absolute bottom-0 right-0 p-12 opacity-5 hidden lg:block">
            <h1 className="text-[25vw] leading-none select-none font-serif italic">VIENNA</h1>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
            <div>
                <h2 className="text-7xl sm:text-9xl mb-16 italic staggered-title">Visit Us</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
                    <div className="space-y-4 reveal-section">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-vienna-beige/40 block underline decoration-vienna-green underline-offset-8">Location</span>
                        <p className="text-2xl font-serif mt-4">123 Riverside Street<br/>Vienna District 4</p>
                    </div>
                    <div className="space-y-4 reveal-section">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-vienna-beige/40 block underline decoration-vienna-green underline-offset-8">Hours</span>
                        <p className="text-2xl font-serif mt-4">Daily 07:00 — 19:00<br/>Weekends 08:00 — 20:00</p>
                    </div>
                </div>
                
                <div className="mt-24 reveal-section">
                     <button className="group flex items-center gap-6 text-2xl sm:text-4xl font-serif italic hover:translate-x-4 transition-transform duration-700">
                        Reserve a Table <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 text-vienna-green group-hover:translate-x-4 transition-transform" />
                     </button>
                </div>
            </div>

            <div className="flex flex-col justify-between items-start lg:items-end">
                <div className="text-left md:text-right space-y-12">
                    <p className="text-2xl sm:text-3xl font-serif italic max-w-md md:ml-auto reveal-section">
                        "In a world that never stops moving, we invite you to be the exception."
                    </p>
                    <div className="brand-lockup reveal-section">
                        <h4 className="text-7xl tracking-tighter mb-4">VIENNA</h4>
                        <div className="flex gap-4 md:justify-end">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-vienna-beige/30">Roastery</span>
                            <span className="text-[10px] opacity-20">•</span>
                            <span className="text-[10px] uppercase tracking-[0.4em] text-vienna-beige/30">Bakery</span>
                            <span className="text-[10px] opacity-20">•</span>
                            <span className="text-[10px] uppercase tracking-[0.4em] text-vienna-beige/30">Sanctuary</span>
                        </div>
                    </div>
                </div>

                <div className="mt-24 lg:mt-0 space-y-6 text-left lg:text-right max-w-sm reveal-section">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-vienna-beige/40 leading-relaxed">
                        This is a example of designing and development for the portfolio of <span className="text-vienna-beige/80">Ryucent™</span>
                    </p>
                    <p className="text-[10px] tracking-[0.4em] text-vienna-beige/60">
                        © 2026 RYUCENT COLLECTIVE
                    </p>
                </div>
            </div>
        </div>
      </footer>

    </div>
  );
};

export default StaticContent;
