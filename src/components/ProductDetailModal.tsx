/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, ProductLot, CartItem } from '../types';
import { api } from '../lib/supabase';
import { X, ShoppingCart, Percent, Layers, CheckCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>, buyNow?: boolean) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [purchaseType, setPurchaseType] = useState<'unit' | 'lot'>('unit');
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imgTouchStart, setImgTouchStart] = useState<number | null>(null);
  const [imgTouchEnd, setImgTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!product) return;
    
    // Reset selectors
    setPurchaseType('unit');
    setSelectedLot(null);
    setLoaded(false);
    setActiveImageIndex(0);
    setExtraImages([]);

    api.getProductLots(product.id).then((fetchedLots) => {
      // If we got real lots, set them.
      // Else generate default generic lot choices as fallback to maintain high fidelity
      if (fetchedLots && fetchedLots.length > 0) {
        setLots(fetchedLots);
        const bestSeller = fetchedLots.find(l => l.quantity === 100) || fetchedLots[0];
        setSelectedLot(bestSeller);
      } else {
        const generatedLots: ProductLot[] = [
          { id: `mock-lot-50-${product.id}`, product_id: product.id, quantity: 50, price: Number((product.unit_price * 50 * 0.85).toFixed(2)) },
          { id: `mock-lot-100-${product.id}`, product_id: product.id, quantity: 100, price: Number((product.unit_price * 100 * 0.78).toFixed(2)) },
          { id: `mock-lot-200-${product.id}`, product_id: product.id, quantity: 200, price: Number((product.unit_price * 200 * 0.70).toFixed(2)) }
        ];
        setLots(generatedLots);
        setSelectedLot(generatedLots[1]); // Default to 100 lot as Best Seller
      }
      setLoaded(true);
    }).catch(err => {
      console.error('Error fetching product lots:', err);
      setLoaded(true);
    });

    api.getProductImages(product.id).then((imgs) => {
      setExtraImages(imgs || []);
    }).catch(err => {
      console.warn('Error fetching product images:', err);
    });
  }, [product]);

  const allImages = product ? [product.image_url, ...extraImages].filter(Boolean) : [];

  // Auto advance image carousel
  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  if (!product) return null;

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleImgTouchStart = (e: React.TouchEvent) => {
    setImgTouchEnd(null);
    setImgTouchStart(e.targetTouches[0].clientX);
  };

  const handleImgTouchMove = (e: React.TouchEvent) => {
    setImgTouchEnd(e.targetTouches[0].clientX);
  };

  const handleImgTouchEnd = () => {
    if (!imgTouchStart || !imgTouchEnd || allImages.length <= 1) return;
    const diff = imgTouchStart - imgTouchEnd;
    const minDistance = 50;
    if (diff > minDistance) {
      setActiveImageIndex(prev => (prev + 1) % allImages.length);
    } else if (diff < -minDistance) {
      setActiveImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const handleAdd = (buyNow = false) => {
    if (purchaseType === 'unit') {
      onAddToCart({
        product,
        type: 'unit',
        quantity: 1,
      }, buyNow);
    } else {
      if (!selectedLot) return;
      onAddToCart({
        product,
        type: 'lot',
        quantity: 1, // 1 lot of specified units
        lotDetails: {
          lotId: selectedLot.id,
          quantity: selectedLot.quantity,
          price: selectedLot.price
        }
      }, buyNow);
    }
  };

  return (
    <div
      id="product-detail-modal-overlay"
      className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity duration-300 animate-fadeIn"
    >
      {/* Tap outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Slide-Up container sheet */}
      <div
        id="product-detail-sheet"
        className="w-full max-w-xl bg-[#faf9f8] rounded-t-[28px] overflow-hidden flex flex-col relative shadow-[0_-8px_40px_rgba(15,23,42,0.15)] h-[90vh] md:h-[80vh] max-h-[780px] z-10 animate-slideUp border-t border-slate-100"
      >
        {/* Grabber indicator & close bar */}
        <header className="flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100/60">
          <div className="w-12 h-1 rounded-full bg-slate-200 absolute top-2.5 left-1/2 -translate-x-1/2"></div>
          <h2 className="font-extrabold text-slate-800 text-sm md:text-base uppercase tracking-wider flex items-center gap-2 mt-1">
            Detalhes do Produto
          </h2>
          <button
            id="close-detail-modal"
            className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all cursor-pointer active:scale-90"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        {/* Scrollable contents */}
        <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide">
          {/* Slider/Carousel for multiple/single images */}
          <div 
            className="w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-100 overflow-hidden relative group"
            onTouchStart={handleImgTouchStart}
            onTouchMove={handleImgTouchMove}
            onTouchEnd={handleImgTouchEnd}
          >
            {allImages.length > 1 ? (
              <>
                {allImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${product.name} - Amostra ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                      i === activeImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ))}
                
                {/* Horizontal Indicators Bullets List */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/35 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === activeImageIndex ? 'bg-white w-3.5' : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Visualizar imagem ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#faf9f8] to-transparent z-10"></div>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Title & Description enlarged discretely by 10% to 15% */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase bg-blue-600 text-white rounded-md font-black px-2.5 py-1 w-fit block tracking-wider">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-semibold">
                {product.description}
              </p>
            </div>

            {/* Toggle switch between Unit vs Lots */}
            <div className="pt-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest mb-3">
                Modalidade de Compra
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPurchaseType('unit')}
                  className={`py-3 px-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center outline-none ${
                    purchaseType === 'unit'
                      ? 'border-blue-700 bg-blue-50/40 text-blue-900 shadow-sm'
                      : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Compra Unitária</span>
                  <span className="text-base font-black text-blue-900">{formatBRL(product.unit_price)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPurchaseType('lot')}
                  className={`py-3 px-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center outline-none ${
                    purchaseType === 'lot'
                      ? 'border-blue-700 bg-blue-50/40 text-blue-900 shadow-sm'
                      : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Atacado em Lotes</span>
                  <span className="text-[9px] bg-red-500 text-white rounded-full px-2 py-0.5 font-black uppercase tracking-wide">
                    Super Desconto
                  </span>
                </button>
              </div>
            </div>

            {/* Lot Selections Layout */}
            {purchaseType === 'lot' && (
              <div className="space-y-3.5 pt-1.5 animate-fadeIn">
                <h3 className="text-[10px] font-black uppercase text-slate-400 block tracking-widest mb-2.5">
                  Escolha o seu lote ideal:
                </h3>

                {lots.map((lot, index) => {
                  const standardAmount = product.unit_price * lot.quantity;
                  const discountPct = Math.round((1 - lot.price / standardAmount) * 100);
                  const isBestSeller = lot.quantity === 100;

                  return (
                    <label
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      style={{ zIndex: index === 0 ? 30 : 20 - index }}
                      className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all relative ${
                        isBestSeller ? 'mt-4' : ''
                      } ${
                        selectedLot?.id === lot.id
                          ? 'border-blue-700 bg-blue-50/10 ring-1 ring-blue-700/5 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {isBestSeller && (
                        <div className="absolute -top-2.5 left-4 bg-rose-600 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-md z-40 animate-pulse">
                          Melhor Custo-Benefício
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="product-lot-selection"
                          checked={selectedLot?.id === lot.id}
                          onChange={() => setSelectedLot(lot)}
                          className="w-4 h-4 text-blue-700 border-slate-300 focus:ring-blue-500 focus:ring-1"
                        />
                        <div>
                          <span className="font-extrabold text-slate-800 text-xs sm:text-sm block">
                            Lote c/ {lot.quantity} unidades
                          </span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 font-black uppercase tracking-wide mt-1 inline-block">
                            -{discountPct}% de Economia
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] text-slate-400 line-through">
                          {formatBRL(standardAmount)}
                        </span>
                        <span className="block font-black text-blue-900 text-sm sm:text-base">
                          {formatBRL(lot.price)}
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          ({formatBRL(lot.price / lot.quantity)}/un)
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer double action buttons */}
        <footer className="flex-none p-4 bg-white border-t border-slate-200/80 flex gap-2.5 z-10 pb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => handleAdd(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-800 py-3.5 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-slate-200/40"
          >
            <ShoppingCart size={13} />
            Add ao Carrinho
          </button>
          
          <button
            type="button"
            onClick={() => handleAdd(true)}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-[0_6px_20px_rgba(29,78,216,0.25)] cursor-pointer"
          >
            Comprar Agora —{' '}
            {purchaseType === 'unit'
              ? formatBRL(product.unit_price)
              : selectedLot
              ? formatBRL(selectedLot.price)
              : 'Selecione'}
          </button>
        </footer>
      </div>
    </div>
  );
}
