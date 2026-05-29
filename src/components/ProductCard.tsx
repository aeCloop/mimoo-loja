/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';
import { Sparkles, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isPopular?: boolean;
  key?: any;
}

export default function ProductCard({ product, onSelect, isPopular = false }: ProductCardProps) {
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_25px_rgba(15,23,42,0.09)] border border-slate-100/60 transition-all duration-300 active:scale-[0.98] cursor-pointer flex flex-col h-full group relative focus-within:ring-2 focus-within:ring-blue-600/50"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(product);
        }
      }}
    >
      {/* Popular indicator badge */}
      {(isPopular || product.orders_count >= 50) && (
        <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full z-10 flex items-center gap-1 shadow-md uppercase tracking-wider">
          <Sparkles size={9} className="fill-white animate-pulse" />
          Mais Pedido
        </span>
      )}

      {/* Image element with cover zoom & touch overlay */}
      <div className="w-full aspect-[4/3] xs:aspect-square bg-slate-50 overflow-hidden relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-blue-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Item info */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
        <span className="text-[10px] uppercase tracking-widest font-black text-blue-600 mb-1 block">
          {product.category}
        </span>
        <h3 className="text-sm sm:text-base font-extrabold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1 leading-snug">
          {product.name}
        </h3>
        <p className="text-xs sm:text-[13px] text-slate-500 mt-1 mb-3 line-clamp-2 leading-relaxed flex-grow">
          {product.description}
        </p>

        {/* Pricing tag footer */}
        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-slate-50">
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">A partir de</span>
            <span className="text-base sm:text-lg font-black text-blue-900 tracking-tight">{formatBRL(product.unit_price)}</span>
          </div>
          
          <button 
            type="button"
            className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all active:scale-90 shadow-sm flex-shrink-0"
            aria-label={`Ver detalhes de ${product.name}`}
          >
            <ShoppingBag size={14} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
