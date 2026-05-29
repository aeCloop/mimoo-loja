/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Product, ProductLot, CartItem } from '../types';
import { api } from '../lib/supabase';
import { X, ShoppingCart, Percent, Layers, CheckCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [purchaseType, setPurchaseType] = useState<'unit' | 'lot'>('unit');
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!product) return;
    
    // Reset selectors
    setPurchaseType('unit');
    setSelectedLot(null);
    setLoaded(false);

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
  }, [product]);

  if (!product) return null;

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAdd = () => {
    if (purchaseType === 'unit') {
      onAddToCart({
        product,
        type: 'unit',
        quantity: 1,
      });
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
      });
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
        <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
          {/* Big high quality photo with touch visual aspect */}
          <div className="w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-105 overflow-hidden relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#faf9f8] to-transparent"></div>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Title & Description */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase bg-blue-600 text-white rounded-md font-black px-2.5 py-1 w-fit block tracking-wider">
                {product.category}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
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
              <div className="space-y-2.5 pt-1 animate-fadeIn">
                <h3 className="text-[10px] font-black uppercase text-slate-400 block tracking-widest mb-2.5">
                  Escolha o seu lote ideal:
                </h3>

                {lots.map((lot) => {
                  const standardAmount = product.unit_price * lot.quantity;
                  const discountPct = Math.round((1 - lot.price / standardAmount) * 100);
                  const isBestSeller = lot.quantity === 100;

                  return (
                    <label
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all relative ${
                        selectedLot?.id === lot.id
                          ? 'border-blue-700 bg-blue-50/10 ring-1 ring-blue-700/5 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {isBestSeller && (
                        <div className="absolute -top-2.5 left-4 bg-red-650 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
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

        {/* Sticky footer action button */}
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pt-8 flex gap-3 z-10 border-t border-slate-100/60 pb-6">
          <button
            onClick={handleAdd}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_6px_20px_rgba(29,78,216,0.3)] cursor-pointer"
          >
            <ShoppingCart size={15} />
            Adicionar —{' '}
            {purchaseType === 'unit'
              ? formatBRL(product.unit_price)
              : selectedLot
              ? formatBRL(selectedLot.price)
              : 'Selecione o Lote'}
          </button>
        </footer>
      </div>
    </div>
  );
}
