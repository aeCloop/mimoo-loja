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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity duration-300 animate-fadeIn"
    >
      {/* Tap outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Slide-Up container sheet */}
      <div
        id="product-detail-sheet"
        className="w-full max-w-2xl bg-[#fbf9f8] rounded-t-[24px] overflow-hidden flex flex-col relative shadow-2xl h-[92vh] max-h-[850px] z-10 select-none animate-slideUp"
      >
        {/* Grabber indicator & close bar */}
        <header className="flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur-md sticky top-0 z-10 border-b border-rose-50/10">
          <div className="w-10 h-1.5 rounded-full bg-slate-200 absolute top-2.5 left-1/2 -translate-x-1/2"></div>
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            Detalhes do Produto
          </h2>
          <button
            id="close-detail-modal"
            className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer active:scale-95"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        {/* Scrollable contents */}
        <div className="flex-1 overflow-y-auto pb-32">
          {/* Big high quality photo */}
          <div className="w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-200 overflow-hidden relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="px-5 py-6">
            {/* Title & Description */}
            <div className="space-y-2">
              <span className="text-xs uppercase bg-blue-100 text-blue-800 rounded-md font-extrabold px-2.5 py-1 w-fit block">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-blue-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Toggle switch between Unit vs Lots */}
            <div className="mt-8">
              <span className="text-xs font-bold uppercase text-slate-400 block tracking-wider mb-3">
                Modalidade de Compra
              </span>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPurchaseType('unit')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    purchaseType === 'unit'
                      ? 'border-blue-700 bg-blue-50/50 text-blue-900 shadow-sm'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">Compra Unitária</span>
                  <span className="text-lg font-black">{formatBRL(product.unit_price)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPurchaseType('lot')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    purchaseType === 'lot'
                      ? 'border-blue-700 bg-blue-50/50 text-blue-900 shadow-sm'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">Compra por Lotes</span>
                  <span className="text-xs bg-blue-600 text-white rounded-full px-2.5 py-0.5 font-bold uppercase">
                    Economize muito!
                  </span>
                </button>
              </div>
            </div>

            {/* Lot Selections Layout */}
            {purchaseType === 'lot' && (
              <div className="mt-6 space-y-3 animate-slideUp">
                <h3 className="text-xs font-bold uppercase text-slate-400 block tracking-wider">
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
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all relative ${
                        selectedLot?.id === lot.id
                          ? 'border-blue-700 bg-blue-50/10 ring-2 ring-blue-700/10'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {isBestSeller && (
                        <div className="absolute -top-3 left-4 bg-orange-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                          Mais Vendido / Economia Total
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="product-lot-selection"
                          checked={selectedLot?.id === lot.id}
                          onChange={() => setSelectedLot(lot)}
                          className="w-5 h-5 text-blue-700 border-slate-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">
                            Lote com {lot.quantity} unidades
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 rounded font-extrabold px-1.5 py-0.5 uppercase tracking-wider mt-0.5 inline-block">
                            -{discountPct}% Desconto
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-xs text-slate-400 line-through">
                          {formatBRL(standardAmount)}
                        </span>
                        <span className="block font-black text-blue-900 text-base">
                          {formatBRL(lot.price)}
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          ({formatBRL(lot.price / lot.quantity)} / un)
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
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#fbf9f8] via-[#fbf9f8] to-transparent pt-8 flex gap-3 z-10.">
          <button
            onClick={handleAdd}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0px_8px_30px_rgba(0,86,179,0.15)] cursor-pointer"
          >
            <ShoppingCart size={16} />
            Adicionar ao Carrinho —{' '}
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
