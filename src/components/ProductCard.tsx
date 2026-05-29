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
      className="bg-white rounded-2xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.09)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full border border-slate-100 group relative"
    >
      {/* Popular indicator badge */}
      {(isPopular || product.orders_count >= 50) && (
        <span className="absolute top-3 left-3 bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full z-10 flex items-center gap-1 shadow-sm uppercase tracking-wider backdrop-blur-md">
          <Sparkles size={10} className="fill-blue-800" />
          Mais Pedido
        </span>
      )}

      {/* Image element with cover zoom */}
      <div className="w-full aspect-[4/3] sm:aspect-square bg-slate-50 overflow-hidden relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Item info */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 mb-1">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-900 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-3 line-clamp-2 leading-relaxed flex-grow">
          {product.description}
        </p>

        {/* Pricing tag footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-tight">A partir de</span>
            <span className="text-base font-extrabold text-blue-900">{formatBRL(product.unit_price)}</span>
          </div>
          
          <button className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all active:scale-95 shadow-sm">
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
