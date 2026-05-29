/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from '../types';
import { Package, Clock, CheckCircle2, ShoppingBag, Truck, Calendar } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
}

export default function OrdersView({ orders }: OrdersViewProps) {
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Novo':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <Clock size={11} />
            Novo / Aguardando
          </span>
        );
      case 'Em produção':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <Package size={11} className="animate-pulse" />
            Em Produção
          </span>
        );
      case 'Pronto':
        return (
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle2 size={11} />
            Pronto para Entrega
          </span>
        );
      case 'Entregue':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <Truck size={11} />
            Entregue
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full w-fit">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (orders.length === 0) {
    return (
      <div id="orders-empty-state" className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto my-12 animate-fadeIn">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Calendar size={28} />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Nenhum pedido encontrado</h3>
        <p className="text-slate-500 text-sm mt-1.5 max-w-xs leading-relaxed">
          Você ainda não realizou nenhum pedido neste navegador. Preencha seu carrinho para iniciar um pedido!
        </p>
      </div>
    );
  }

  return (
    <div id="customer-orders-history-container" className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-16">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Meus Pedidos</h2>
        <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {orders.length} Pedidos
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:shadow-[0px_8px_32px_rgba(0,0,0,0.05)]"
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-black text-blue-800 block">ID: #{order.id}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Realizado em {formatDate(order.created_at)}
                </span>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            {/* List purchased goods */}
            <div className="py-4 space-y-3">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                    <img src={it.image_url} alt={it.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-xs text-slate-800 line-clamp-1">{it.product_name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{it.description_details}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-slate-850">{formatBRL(it.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Card Footer detail info */}
            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
              <div className="text-slate-500 font-medium">
                Pgo via <span className="font-bold text-blue-900">{order.payment_method}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium mr-1.5">Total Pago:</span>
                <span className="font-black text-blue-900 text-sm">{formatBRL(order.total)}</span>
              </div>
            </div>

            {/* Custom image design linked indicators */}
            {order.photo_url && (
              <div className="mt-3 pt-2 border-t border-dashed border-slate-100 flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50/50 p-2 rounded-lg">
                <span className="text-emerald-600 block">✓</span>
                <span className="font-semibold block">Arte personalizada anexada ao pedido.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
