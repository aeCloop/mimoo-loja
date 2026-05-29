/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CartItem, Order, OrderStatus } from '../types';
import { api } from '../lib/supabase';
import { showToast } from '../lib/toast';
import { Trash2, Plus, Minus, Image, ShoppingBag, ShieldAlert, CheckCircle, ArrowRight, UploadCloud } from 'lucide-react';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQty: (itemId: string, diff: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onAddOrderToList: (order: Order) => void;
}

export default function CartView({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onAddOrderToList
}: CartViewProps) {
  // Checkout Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão' | 'Dinheiro' | 'Débito'>('Pix');

  // Local storage save credentials
  const [saveDataLocally, setSaveDataLocally] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mimoo_customer_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.cep) setCep(parsed.cep);
        if (parsed.address) setAddress(parsed.address);
        setSaveDataLocally(true);
        setHasSavedData(true);
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
  }, []);

  const handleClearSavedData = () => {
    localStorage.removeItem('mimoo_customer_data');
    setSaveDataLocally(false);
    setHasSavedData(false);
    setName('');
    setPhone('');
    setCep('');
    setAddress('');
    showToast('Dados salvos limpos com sucesso!', 'success');
  };
  
  // Custom design upload
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (errorMsg) {
      showToast(errorMsg, 'error');
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      showToast(successMsg, 'success');
    }
  }, [successMsg]);
  
  // Order Success Overlay state
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; redirectUrl: string } | null>(null);

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.type === 'unit' ? item.product.unit_price : (item.lotDetails?.price || 0);
    return acc + (itemPrice * item.quantity);
  }, 0);

  const total = subtotal; // Frete Grátis as requested in the design layout mockups

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Limit to 10MB as in prototype description
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('O arquivo excede o limite estipulado de 10MB.');
      }
      
      const imageUrl = await api.uploadImage(file, 'orders');
      setUploadedUrl(imageUrl);
      setSuccessMsg('Arte enviada com sucesso para o pedido!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao realizar upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  // Checkout submission
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field integrity verification
    if (!name.trim()) return setErrorMsg('Por favor, informe seu Nome Completo.');
    if (!phone.trim()) return setErrorMsg('Por favor, informe seu número de WhatsApp.');
    if (!address.trim()) return setErrorMsg('Por favor, digite o Endereço de Entrega.');
    if (cart.length === 0) return setErrorMsg('Seu carrinho está vazio.');

    try {
      // 1. Map items to Order structure
      const orderItems = cart.map((item) => {
        const itemPrice = item.type === 'unit' ? item.product.unit_price : (item.lotDetails?.price || 0);
        const description_details = item.type === 'unit' 
          ? `Compra Unitária - ${item.quantity} unidades` 
          : `Lote de ${item.lotDetails?.quantity} un - (${item.quantity} lote)`;

        return {
          id: item.id,
          product_name: item.product.name,
          product_category: item.product.category,
          type: item.type,
          quantity: item.quantity,
          description_details,
          price: itemPrice * item.quantity,
          image_url: item.product.image_url
        };
      });

      const orderData = {
        customer_name: name.trim(),
        phone: phone.trim(),
        address: `${address.trim()}${cep ? `, CEP: ${cep.trim()}` : ''}`,
        payment_method: paymentMethod,
        photo_url: uploadedUrl,
        total,
        items: orderItems
      };

      // 2. Persist in database/mock engine
      const createdOrder = await api.createOrder(orderData);
      onAddOrderToList(createdOrder);

      // 3. Format messaging structure for WhatsApp routing
      const whatsappNumber = await api.getWhatsAppNumber();
      
      const itemsListMsg = orderItems.map((it) => {
        return `• *${it.product_name}*\n  _Detalhes: ${it.description_details}_\n  _Valor: ${formatBRL(it.price)}_`;
      }).join('\n\n');

      const fileAttachmentMsg = uploadedUrl ? `\n\n*ARTE/FOTO DO PEDIDO:* \n${uploadedUrl}` : '';

      const baseText = `Olá *Mimoo Personalizados*! Gostaria de finalizar o meu pedido:\n\n` +
        `*ID DO PEDIDO:* #${createdOrder.id}\n\n` +
        `*DADOS DE CADASTRO OBRIGATÓRIOS:*\n` +
        `- Nome: ${createdOrder.customer_name}\n` +
        `- WhatsApp: ${createdOrder.phone}\n` +
        `- Endereço: ${createdOrder.address}\n\n` +
        `*PRODUTOS SELECIONADOS:*\n${itemsListMsg}\n\n` +
        `*FORMA DE PAGAMENTO:* ${createdOrder.payment_method}\n` +
        `*TAXA DE FRETE:* Grátis\n` +
        `*TOTAL GERAL DO PEDIDO:* *${formatBRL(createdOrder.total)}*` +
        `${fileAttachmentMsg}\n\n` +
        `Fico no aguardo da aprovação e início da produção do meu Mimoo! Obrigado!`;

      const encodedMsg = encodeURIComponent(baseText);
      const waUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMsg}`;

      // Save local data if checkbox is active
      if (saveDataLocally) {
        const dataToSave = {
          name: name.trim(),
          phone: phone.trim(),
          cep: cep.trim(),
          address: address.trim()
        };
        localStorage.setItem('mimoo_customer_data', JSON.stringify(dataToSave));
        setHasSavedData(true);
      }

      // Reset checkout items
      onClearCart();
      setUploadedUrl('');
      setName('');
      setPhone('');
      setAddress('');
      setCep('');

      // Set Success State & trigger redirect
      setOrderSuccess({ id: createdOrder.id, redirectUrl: waUrl });
      
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        console.warn('Auto redirect blocked by popup blocker.', err);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro inesperado ao cadastrar o pedido.');
    }
  };

  const paymentButtons: { key: 'Pix' | 'Cartão' | 'Dinheiro' | 'Débito'; label: string; icon: string }[] = [
    { key: 'Pix', label: 'Pix', icon: 'qr_code_2' },
    { key: 'Cartão', label: 'Cartão', icon: 'credit_card' },
    { key: 'Dinheiro', label: 'Dinheiro', icon: 'payments' },
    { key: 'Débito', label: 'Débito', icon: 'account_balance_wallet' }
  ];

  if (orderSuccess) {
    return (
      <div id="order-success-screen" className="flex flex-col items-center justify-center text-center p-6 sm:p-10 bg-white rounded-3xl border border-slate-100 max-w-xl mx-auto my-8 animate-fadeIn shadow-[0_10px_35px_rgba(15,23,42,0.06)] space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-inner">
          <CheckCircle size={44} className="stroke-[2.5]" />
        </div>
        
        <div className="space-y-2">
          <span className="text-slate-400 font-bold font-mono text-xs uppercase tracking-wider block">ID do Pedido: #{orderSuccess.id}</span>
          <h2 className="font-extrabold text-slate-800 text-xl sm:text-2xl tracking-tight leading-tight">
            Pedido Confirmado! 🎉
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Seu pedido especial da Mimoo foi criado no sistema de forma segura. Agora, vamos fechar os detalhes de arte e personalização com você via WhatsApp!
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100 w-full max-w-md space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-slate-700">Redirecionando automático...</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Se o seu navegador bloqueou a abertura do aplicativo, use o botão de envio manual abaixo.
          </p>
        </div>

        <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setOrderSuccess(null);
            }}
            className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-transform"
          >
            Voltar ao Catálogo
          </button>
          
          <a
            href={orderSuccess.redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 transform cursor-pointer text-center"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.764-5.768zm3.394 8.216c-.146.415-.844.755-1.164.808-.285.048-.654.088-1.055-.042-.254-.083-.575-.192-1.003-.377-1.823-.788-3.003-2.653-3.094-2.775-.091-.122-.738-.982-.738-1.96 0-.978.511-1.458.693-1.66.183-.202.4-.253.533-.253.133 0 .267.002.383.007.124.005.289-.047.452.34.167.394.572 1.391.621 1.492.05.101.083.219.016.353-.067.135-.101.219-.201.336-.1.117-.21.261-.299.353-.099.103-.202.215-.087.412.115.197.511.844 1.096 1.365.753.67 1.389.877 1.587.975.198.098.314.081.43-.053.116-.134.498-.58.631-.776.133-.197.266-.164.449-.097.182.067 1.155.544 1.355.644.199.1.332.149.381.234.05.085.05.49-.096.905zM12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"></path>
            </svg>
            Abrir WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div id="cart-empty-state" className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto my-12 animate-fadeIn">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={28} />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Seu Carrinho está vazio</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
          Navegue pelo nosso catálogo e adicione lindos produtos personalizados para iniciar o seu pedido especial!
        </p>
      </div>
    );
  }

  return (
    <div id="checkout-cart-main-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn pb-16">
      
      {/* Left Area: Display bought products list & uploader card */}
      <section className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Meu Carrinho</h2>
          <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {cart.reduce((s, c) => s + c.quantity, 0)} Itens
          </span>
        </div>

        {/* Item containers */}
        <div className="space-y-3">
          {cart.map((item) => {
            const itemPrice = item.type === 'unit' ? item.product.unit_price : (item.lotDetails?.price || 0);
            const totalItemPrice = itemPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex gap-4 items-center transition-all hover:border-slate-200"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-grow">
                  <span className="text-[11px] uppercase font-extrabold text-blue-600 tracking-wider">
                    {item.product.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">
                    {item.product.name}
                  </h3>
                  
                  <p className="text-[13px] sm:text-sm text-slate-500 font-medium mt-1">
                    {item.type === 'unit' ? 'Compra Unitária' : `Lote de ${item.lotDetails?.quantity} unidades`}
                  </p>

                  <div className="mt-2.5 flex justify-between items-end">
                    <div className="flex items-center gap-3 bg-slate-100/80 rounded-full px-3 py-1">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="text-blue-700 hover:text-slate-800 p-0.5 cursor-pointer active:scale-75 transition-transform"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="text-blue-700 hover:text-slate-800 p-0.5 cursor-pointer active:scale-75 transition-transform"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-extrabold text-slate-950">{formatBRL(totalItemPrice)}</p>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-slate-400">({formatBRL(itemPrice)} un)</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove from card completely button */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors self-start cursor-pointer active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Art customization image cloud uploader area */}
        <div className="bg-blue-50/20 border-2 border-dashed border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 relative">
          <div className="w-14 h-14 bg-blue-100/80 text-blue-700 rounded-full flex items-center justify-center shadow-sm">
            <UploadCloud size={24} />
          </div>

          <div>
            <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider">Enviar sua Arte ou Foto</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mt-1">
              Para produtos personalizados, envie sua imagem agora para agilizar a produção.
            </p>
          </div>

          {/* Trigger Input button style */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
              id="artwork-file-input"
            />
            <label
              htmlFor="artwork-file-input"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full inline-block cursor-pointer active:scale-95 transition-transform shadow-sm"
            >
              {uploading ? 'Carregando Imagem...' : 'Selecionar Arquivo'}
            </label>
          </div>

          <p className="text-[10px] text-slate-400">Formatos aceitos: JPG, PNG, PDF (Máx 10MB)</p>

          {/* Display active results previews */}
          {uploadedUrl && (
            <div className="mt-2 text-center">
              <div className="w-20 h-20 rounded-md overflow-hidden border border-emerald-300 mx-auto relative group">
                <img src={uploadedUrl} alt="Artwork preview" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-emerald-700 font-semibold mt-1">✓ Arte vinculada com sucesso!</p>
            </div>
          )}

          {successMsg && <span className="text-xs text-emerald-600 font-bold mt-1">{successMsg}</span>}
          {errorMsg && <span className="text-xs text-rose-600 font-bold mt-1">{errorMsg}</span>}
        </div>
      </section>

      {/* Right Area: Checkout customer form & whatsapp cta */}
      <section className="lg:col-span-5">
        <div className="bg-white rounded-2xl p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.06)] border border-slate-100">
          <h3 className="font-black text-slate-800 text-lg mb-4">Finalizar Pedido</h3>

          <form onSubmit={handleCheckout} className="space-y-4">
            
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como devemos te chamar?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-700 focus:ring-1 focus:ring-blue-700 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Whatsapp & Zip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-700 focus:ring-1 focus:ring-blue-700 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  CEP (Opcional)
                </label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-700 focus:ring-1 focus:ring-blue-700 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Endereço de Entrega *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número e complemento"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-700 focus:ring-1 focus:ring-blue-700 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Local Storage details */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100 text-left">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveDataLocally}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setSaveDataLocally(isChecked);
                    if (!isChecked) {
                      localStorage.removeItem('mimoo_customer_data');
                      setHasSavedData(false);
                      showToast('Salvamento automático desativado.', 'success');
                    } else {
                      showToast('Ativado! Seus dados serão gravados ao concluir o pedido.', 'success');
                    }
                  }}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-700 mt-1 cursor-pointer w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Salvar meus dados neste dispositivo</span>
                  <span className="text-[10px] text-slate-400 block leading-normal mt-0.5">Seus dados ficarão salvos de forma segura e apenas localmente neste aparelho para compras futuras mais rápidas.</span>
                </div>
              </label>

              {hasSavedData && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    ✓ Contém dados salvos
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSavedData}
                    className="text-[10px] text-rose-600 hover:text-rose-800 font-black uppercase tracking-wider underline cursor-pointer"
                  >
                    Limpar meus dados salvos
                  </button>
                </div>
              )}
            </div>

            {/* Payment selections checkcards */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Forma de Pagamento *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentButtons.map((btn) => (
                  <button
                    key={btn.key}
                    type="button"
                    onClick={() => setPaymentMethod(btn.key)}
                    className={`flex items-center gap-2 p-3 border rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      paymentMethod === btn.key
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-2 ring-blue-700/10'
                        : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-slate-400">❖</span>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial summaries info */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Frete</span>
                <span className="text-emerald-700 font-black">Grátis</span>
              </div>
              
              <div className="flex justify-between items-center text-blue-900 font-bold pt-2">
                <span className="text-base">Total do Pedido</span>
                <span className="text-xl font-black">{formatBRL(total)}</span>
              </div>
            </div>

            {/* Validation errors alerts list */}
            {errorMsg && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* WA final order trigger */}
            <button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] mt-6"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.764-5.768zm3.394 8.216c-.146.415-.844.755-1.164.808-.285.048-.654.088-1.055-.042-.254-.083-.575-.192-1.003-.377-1.823-.788-3.003-2.653-3.094-2.775-.091-.122-.738-.982-.738-1.96 0-.978.511-1.458.693-1.66.183-.202.4-.253.533-.253.133 0 .267.002.383.007.124.005.289-.047.452.34.167.394.572 1.391.621 1.492.05.101.083.219.016.353-.067.135-.101.219-.201.336-.1.117-.21.261-.299.353-.099.103-.202.215-.087.412.115.197.511.844 1.096 1.365.753.67 1.389.877 1.587.975.198.098.314.081.43-.053.116-.134.498-.58.631-.776.133-.197.266-.164.449-.097.182.067 1.155.544 1.355.644.199.1.332.149.381.234.05.085.05.49-.096.905zM12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"></path>
              </svg>
              Finalizar Pedido via WhatsApp
            </button>
            
            <p className="text-center text-[10px] text-slate-400 leading-relaxed pt-1">
              Você será redirecionado para o WhatsApp com todos os detalhes estruturados para a aprovação da arte final.
            </p>
          </form>
        </div>
      </section>

    </div>
  );
}
