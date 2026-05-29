/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Banner } from '../types';

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const activeBanners = banners.filter(b => b.active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || activeBanners.length <= 1) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      // Swiped Left - Show Next Slide
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped Right - Show Previous Slide
      setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
  };

  if (activeBanners.length === 0) {
    return (
      <div id="default-banner" className="w-full h-44 sm:h-64 md:h-80 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl flex flex-col justify-center px-6 sm:px-12 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none">
          <svg className="h-full w-full object-cover" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 Z" fill="white" />
          </svg>
        </div>
        <span className="bg-white/20 text-white rounded-full text-xs font-semibold px-3 py-1 w-fit mb-3">Mimoo Personalizados</span>
        <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight max-w-md">Feito do Seu Jeito, Com Mais Carinho!</h2>
        <p className="text-white/80 text-xs sm:text-sm mt-2 max-w-sm">Canecas, camisetas, almofadas e brindes personalizados de altíssima qualidade.</p>
      </div>
    );
  }

  return (
    <div 
      id="banner-carousel" 
      className="w-full h-44 sm:h-64 md:h-80 bg-slate-100 rounded-2xl overflow-hidden relative shadow-md group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {activeBanners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={banner.image_url}
            alt="Promotional banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent flex flex-col justify-end p-5 pb-8 sm:p-8 text-white">
            <span className="bg-blue-600/90 text-white text-[9px] sm:text-xs font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full w-fit mb-1.5 sm:mb-2 shadow-sm">
              Destaque Especial
            </span>
            <h3 className="text-sm sm:text-2xl font-black tracking-tight leading-tight md:leading-normal">Impressione com Brindes Incríveis</h3>
            <p className="text-white/90 text-[11px] sm:text-sm mt-0.5">Alta qualidade e descontos para atacado.</p>
          </div>
        </div>
      ))}

      {/* Slide Navigation indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-1.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1 sm:gap-1.5 bg-black/35 backdrop-blur-md px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-3 sm:w-4' : 'bg-white/45 hover:bg-white/85'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
