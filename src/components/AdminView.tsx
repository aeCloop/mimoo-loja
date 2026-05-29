/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, ProductLot, Category, Banner, Order, OrderStatus } from '../types';
import { api } from '../lib/supabase';
import {
  TrendingUp,
  Package,
  ListOrdered,
  Layers,
  Sparkles,
  Settings,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Eye,
  PlusCircle,
  Phone,
  Image as ImageIcon,
  CheckCircle2,
  Instagram
} from 'lucide-react';

interface AdminViewProps {
  onLogout: () => void;
}

type AdminTab = 'orders' | 'products' | 'categories_banners' | 'config';

export default function AdminView({ onLogout }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  
  // Storage states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  // Loading/Operation states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [opSuccess, setOpSuccess] = useState('');

  // Creation forms states
  // 1. New Product
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImgUrl, setNewProdImgUrl] = useState('');
  const [prodImgFile, setProdImgFile] = useState<File | null>(null);
  const [uploadingProdImg, setUploadingProdImg] = useState(false);

  // 2. New Product Lot Price
  const [newLotProdId, setNewLotProdId] = useState('');
  const [newLotQty, setNewLotQty] = useState<'50' | '100' | '200' | string>('50');
  const [newLotPrice, setNewLotPrice] = useState('');

  // 3. New Category
  const [newCatName, setNewCatName] = useState('');

  // 4. New Banner Image
  const [bannerImgUrl, setBannerImgUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [o, p, l, c, b, wa, insta] = await Promise.all([
        api.getOrders(),
        api.getProducts(true), // Include inactive too for admin CRUD
        api.getProductLots(),
        api.getCategories(),
        api.getBanners(),
        api.getWhatsAppNumber(),
        api.getInstagramSettings()
      ]);
      setOrders(o);
      setProducts(p);
      setLots(l);
      setCategories(c);
      setBanners(b);
      setWhatsappNumber(wa);
      setInstagramUsername(insta.username);
      setInstagramUrl(insta.url);
      
      if (p.length > 0) {
        setNewLotProdId(p[0].id);
      }
      if (c.length > 0) {
        setNewProdCategory(c[0].name);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Falha ao descarregar as informações de Mimoo do Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setOpSuccess(msg);
    setTimeout(() => {
      setOpSuccess('');
    }, 4000);
  };

  // 1. ORDERS ACTIONS
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showSuccess(`Pedido #${orderId} atualizado para ${status}!`);
    } catch (err: any) {
      setErrorMsg('Erro ao atualizar status do pedido.');
    }
  };

  // 2. PRODUCT ACTIONS
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProdImg(true);
    try {
      const url = await api.uploadImage(file, 'products');
      setNewProdImgUrl(url);
      showSuccess('Imagem do produto anexada!');
    } catch (err: any) {
      setErrorMsg('Falha ao subir imagem para o Storage.');
    } finally {
      setUploadingProdImg(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdCategory || !newProdPrice || !newProdImgUrl) {
      setErrorMsg('Preencha os campos obrigatórios do item.');
      return;
    }

    try {
      const added = await api.addProduct({
        name: newProdName,
        category: newProdCategory,
        description: newProdDesc,
        unit_price: parseFloat(newProdPrice),
        image_url: newProdImgUrl,
        active: true
      });
      setProducts(prev => [...prev, added]);
      setNewProdName('');
      setNewProdDesc('');
      setNewProdPrice('');
      setNewProdImgUrl('');
      showSuccess('Produto cadastrado com sucesso!');
    } catch (err: any) {
      setErrorMsg('Erro ao cadastrar produto no Supabase.');
    }
  };

  const handleToggleProductActive = async (id: string, currentActive: boolean) => {
    try {
      const updated = await api.updateProduct(id, { active: !currentActive });
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      showSuccess(`Produto ${updated.name} está agora ${updated.active ? 'Ativo' : 'Inativo'}!`);
    } catch (err: any) {
      setErrorMsg('Erro ao mudar status do produto.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente apagar este produto e todos os lotes vinculados?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setLots(prev => prev.filter(l => l.product_id !== id));
      showSuccess('Produto excluído com sucesso.');
    } catch (err: any) {
      setErrorMsg('Erro ao remover produto.');
    }
  };

  // 3. LOT ACTIONS
  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLotProdId || !newLotPrice) {
      setErrorMsg('Escolha o produto e o preço do lote.');
      return;
    }

    try {
      const created = await api.addProductLot({
        product_id: newLotProdId,
        quantity: parseInt(newLotQty),
        price: parseFloat(newLotPrice)
      });
      setLots(prev => [...prev, created]);
      setNewLotPrice('');
      showSuccess(`Lote de ${newLotQty} un adicionado com sucesso!`);
    } catch (err: any) {
      setErrorMsg('Erro ao registrar lote tarifário.');
    }
  };

  const handleDeleteLot = async (id: string) => {
    try {
      await api.deleteProductLot(id);
      setLots(prev => prev.filter(l => l.id !== id));
      showSuccess('Lote removido.');
    } catch (err: any) {
      setErrorMsg('Erro ao excluir lote.');
    }
  };

  // 4. CATEGORY ACTIONS
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const added = await api.addCategory(newCatName.trim());
      setCategories(prev => [...prev, added]);
      setNewCatName('');
      showSuccess(`Categoria "${added.name}" criada!`);
    } catch (err: any) {
      setErrorMsg('Erro ao criar categoria: ' + (err.message || JSON.stringify(err)));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Eliminar esta categoria?')) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showSuccess('Categoria removida.');
    } catch (err: any) {
      setErrorMsg('Erro ao deletar categoria.');
    }
  };

  // 5. BANNER ACTIONS
  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const url = await api.uploadImage(file, 'banners');
      setBannerImgUrl(url);
      showSuccess('Imagem de oferta anexada!');
    } catch (err: any) {
      setErrorMsg('Falha ao carregar banner para o Storage.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImgUrl) return;

    try {
      const added = await api.addBanner(bannerImgUrl);
      setBanners(prev => [added, ...prev]);
      setBannerImgUrl('');
      showSuccess('Banner promocional ativado!');
    } catch (err: any) {
      setErrorMsg('Erro ao salvar banner no banco.');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await api.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      showSuccess('Banner desativado.');
    } catch (err: any) {
      setErrorMsg('Erro ao deletar banner.');
    }
  };

  // 6. WHATSAPP SAVE
  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateWhatsAppNumber(whatsappNumber);
      showSuccess('Número de vendas updated!');
    } catch (err: any) {
      setErrorMsg('Erro ao salvar configurações de WhatsApp.');
    }
  };

  // 7. INSTAGRAM SAVE
  const handleSaveInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateInstagramSettings(instagramUsername, instagramUrl);
      showSuccess('Instagram da loja atualizado!');
    } catch (err: any) {
      setErrorMsg('Erro ao salvar as configurações do Instagram da Loja.');
    }
  };

  // BRL formatting helper
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Metrics calculators
  const stats = {
    revenue: orders.filter(o => o.status !== 'Novo').reduce((s, o) => s + o.total, 0),
    activeOrdersCount: orders.filter(o => o.status !== 'Entregue').length,
    leadsCount: orders.length,
    activeProductsCount: products.filter(p => p.active).length
  };

  return (
    <div id="admin-management-view" className="space-y-6 pb-20 animate-fadeIn">
      
      {/* Metric Cards Grid Panel */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Faturamento</span>
            <span className="text-sm sm:text-base font-extrabold text-blue-950">{formatBRL(stats.revenue)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
            <ListOrdered size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fila de Produção</span>
            <span className="text-sm sm:text-base font-extrabold text-blue-950">{stats.activeOrdersCount} Pedidos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Package size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Produtos Ativos</span>
            <span className="text-sm sm:text-base font-extrabold text-blue-950">{stats.activeProductsCount} itens</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Phone size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cadastros</span>
            <span className="text-sm sm:text-base font-extrabold text-blue-950">{stats.leadsCount} contatos</span>
          </div>
        </div>
      </section>

      {/* Operation messages alerts overlay */}
      {opSuccess && (
        <div className="bg-[#e8f5e9] border border-[#a5d6a7] text-emerald-800 rounded-xl p-3 flex items-center gap-2 text-xs font-bold leading-relaxed shadow-sm animate-fadeIn">
          <CheckCircle2 size={15} />
          <span>{opSuccess}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs font-semibold leading-relaxed shadow-sm animate-fadeIn">
          {errorMsg}
        </div>
      )}

      {/* Sub Navigation controls tabs */}
      <section className="bg-white border border-slate-100 rounded-2xl p-2.5 flex items-center justify-between gap-1 shadow-sm overflow-x-auto">
        <div className="flex gap-1.5 flex-1 min-w-max">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <ListOrdered size={14} />
            Pedidos ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'products'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Package size={14} />
            Produtos & Lotes ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories_banners')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'categories_banners'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Layers size={14} />
            Banners & Categorias
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'config'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Settings size={14} />
            Definições
          </button>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LogOut size={13} />
          Sair
        </button>
      </section>

      {/* ACTIVE SCREEN RENDERER */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-widest mt-4">Consultando base de dados Supabase...</p>
        </div>
      ) : (
        <main className="space-y-6">
          {/* 1. ORDERS MODULE */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-base">Controle de Produção e logística</h3>
                <button onClick={fetchData} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <RefreshCw size={14} />
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-center py-10 text-xs text-slate-400">Nenhum pedido foi realizado ainda.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                      
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                        <div>
                          <span className="font-black text-xs text-blue-900">Pedido #{order.id}</span>
                          <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                            Cliente: <strong className="text-slate-600 font-bold">{order.customer_name}</strong> • Cel: {order.phone}
                          </span>
                        </div>

                        {/* Status switcher dropdown selection */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-white border border-slate-200 text-xs font-bold px-2 py-1.5 rounded-lg text-slate-705 outline-none focus:border-blue-700"
                          >
                            <option value="Novo">Novo</option>
                            <option value="Em produção">Em produção</option>
                            <option value="Pronto">Pronto</option>
                            <option value="Entregue">Entregue</option>
                          </select>
                        </div>
                      </div>

                      {/* Purchased items descriptions list */}
                      <div className="space-y-1.5 py-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 font-medium">
                              - {it.product_name} <span className="text-slate-400 font-normal">({it.description_details})</span>
                            </span>
                            <span className="font-extrabold text-slate-800">{formatBRL(it.price)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Log details footer address */}
                      <p className="text-[10px] text-slate-400 block bg-slate-100 p-2.5 rounded-xl leading-relaxed">
                        🛵 <strong>Endereço de Entrega:</strong> {order.address} <br />
                        💳 <strong>Forma de pagamento:</strong> {order.payment_method}
                      </p>

                      {/* Customer custom photo files */}
                      {order.photo_url && (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-2 rounded-xl text-xs font-semibold w-fit">
                          <span>📁 Arte do Cliente:</span>
                          <a href={order.photo_url} target="_blank" rel="noreferrer" className="text-blue-700 underline flex items-center gap-1.5 hover:text-blue-900">
                            <Eye size={12} />
                            Visualizar Arquivo de Imagem
                          </a>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400">Total Pago pelo Cliente:</span>
                        <strong className="text-blue-900 text-sm font-black">{formatBRL(order.total)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. PRODUCTS & LOTS MODULE */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Create Product & Create Lot */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Form: New Product */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-1">
                    <PlusCircle size={15} className="text-blue-700" />
                    Novo Produto
                  </h4>

                  <form onSubmit={handleCreateProduct} className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome do Item *</label>
                      <input
                        type="text"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="Ex: Caneca Porcelana Fosca"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-blue-700 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Categoria *</label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-700"
                        >
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Preço Unitário (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          placeholder="45.90"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-blue-700 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Descrição</label>
                      <textarea
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        placeholder="Descreva detalhes estruturais, materiais..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-blue-700 outline-none transition-all resize-none placeholder:text-slate-400"
                      />
                    </div>

                    {/* Image Selector / Custom URL input */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Link de Imagem (ou Upload) *</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={newProdImgUrl}
                          onChange={(e) => setNewProdImgUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/example..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-blue-700 outline-none transition-all placeholder:text-slate-400"
                        />
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="admin-prod-image-uploader"
                            onChange={handleProductImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="admin-prod-image-uploader"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors block text-center border border-slate-200"
                          >
                            {uploadingProdImg ? 'Carregando arquivo...' : 'Fazer Upload de arquivo'}
                          </label>
                          {newProdImgUrl && <span className="text-[10px] text-emerald-700 font-bold">✓ Imagem vinculada</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-colors active:scale-95"
                    >
                      Cadastrar Produto
                    </button>
                  </form>
                </div>

                {/* Form: New Product Lot Price Tier */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-1">
                    <PlusCircle size={15} className="text-blue-700" />
                    Novo Lote com desconto (Atacado)
                  </h4>

                  <form onSubmit={handleCreateLot} className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Selecione o Produto *</label>
                      <select
                        value={newLotProdId}
                        onChange={(e) => setNewLotProdId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-700"
                      >
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Quantidade do Lote *</label>
                        <select
                          value={newLotQty}
                          onChange={(e) => setNewLotQty(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-700"
                        >
                          <option value="50">50 Unidades</option>
                          <option value="100">100 Unidades</option>
                          <option value="200">200 Unidades</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Preço Total do Lote (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newLotPrice}
                          onChange={(e) => setNewLotPrice(e.target.value)}
                          placeholder="Ex: 3750.00"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-blue-700 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-colors active:scale-95"
                    >
                      Cadastrar Lote Atacado
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column: Existing products list & dynamic connected lot price grid */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                  <h4 className="font-black text-slate-800 text-base">Produtos Ativos / Inativos</h4>

                  <div className="space-y-3">
                    {products.map((prod) => {
                      const prodLots = lots.filter(l => l.product_id === prod.id);

                      return (
                        <div key={prod.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                          
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                              <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-grow">
                              <span className="text-[9px] uppercase font-bold text-blue-700 block tracking-wider">{prod.category}</span>
                              <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm line-clamp-1">{prod.name}</h5>
                              <p className="text-xs text-slate-900 font-bold mt-0.5">Preço Unitário: {formatBRL(prod.unit_price)}</p>
                            </div>

                            {/* Active/Inactive switch trigger toggler button as requested strictly in the prototype specifications */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleToggleProductActive(prod.id, prod.active)}
                                className="p-1 transition-colors cursor-pointer text-slate-400 hover:text-blue-700"
                                title={prod.active ? 'Mudar para Inativo' : 'Mudar para Ativo'}
                              >
                                {prod.active ? (
                                  <ToggleRight size={32} className="text-blue-700" />
                                ) : (
                                  <ToggleLeft size={32} />
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer active:scale-90"
                                title="Apagar Produto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Connected Lot Prices details lists */}
                          {prodLots.length > 0 && (
                            <div className="pt-2 border-t border-slate-250 flex flex-wrap gap-2">
                              {prodLots.map((lot) => (
                                <div key={lot.id} className="bg-blue-100/40 text-blue-900 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                  <span>{lot.quantity} un: {formatBRL(lot.price)}</span>
                                  <button
                                    onClick={() => handleDeleteLot(lot.id)}
                                    className="hover:text-rose-600 font-black ml-1 cursor-pointer focus:outline-none"
                                    title="Remover Lote"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 3. CATEGORIES & BANNERS MODULE */}
          {activeTab === 'categories_banners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Side: Category listing and Creation */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="font-black text-slate-800 text-base">Coleções e Categorias</h4>

                <form onSubmit={handleCreateCategory} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Adicionar Categoria (Ex: Almofadas)"
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:border-blue-700 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Plus size={14} />
                    Criar
                  </button>
                </form>

                <div className="space-y-1.5 pt-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-rose-500 hover:bg-rose-105 p-1.5 rounded-lg active:scale-90"
                        title="Apagar Categoria"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Promo Banners list uploader */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="font-black text-slate-800 text-base">Banner Slides do Topo</h4>

                <form onSubmit={handleCreateBanner} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Link de Imagem (ou Upload) *</label>
                    <input
                      type="text"
                      required
                      value={bannerImgUrl}
                      onChange={(e) => setBannerImgUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/promo-banner..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:border-blue-700 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      id="admin-banner-uploader"
                      onChange={handleBannerImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="admin-banner-uploader"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border border-slate-200"
                    >
                      {uploadingBanner ? 'Subindo Imagem...' : 'Novo Arquivo Banner'}
                    </label>

                    <button
                      type="submit"
                      className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Plus size={14} />
                      Salvar Banner
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {banners.map((banner) => (
                    <div key={banner.id} className="relative rounded-xl overflow-hidden border border-slate-150 group max-h-32">
                      <img src={banner.image_url} alt="Promo Slide" className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-3 text-white">
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-600 px-2 py-0.5 rounded-md">
                          Slide Ativo
                        </span>

                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="bg-rose-600 hover:bg-rose-700 p-2 text-white rounded-full transition-colors cursor-pointer"
                          title="Remover Banner"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 4. CONFIG SECTION */}
          {activeTab === 'config' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm max-w-xl mx-auto space-y-6 animate-fadeIn">
              
              {/* WhatsApp Config Setting */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-3">
                  Telefone de Atendimento / Canal de Vendas
                </h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Os pedidos finalizados via chat serão gerados contendo o link de contato e redirecionados para o número configurado abaixo:
                </p>

                <form onSubmit={handleSaveWhatsApp} className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      💬 WA:
                    </span>
                    <input
                      type="text"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Ex: 5511999999999"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-16 pr-4 py-2.5 text-xs focus:border-blue-700 outline-none transition-all font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Atualizar Vendas
                  </button>
                </form>
                <p className="text-[10px] text-slate-400 mt-2">
                  * Importante: Digite apenas números, incluindo o DDI (Ex: 55 para Brasil) e o DDD.
                </p>
              </div>

              {/* Instagram Config Setting */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Instagram size={16} className="text-pink-600" />
                  Instagram da Loja
                </h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Configure o nome de usuário e o link do do perfil do Instagram para serem exibidos no rodapé do e-commerce:
                </p>

                <form onSubmit={handleSaveInstagram} className="space-y-4">
                  <div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        @ Usuário:
                      </span>
                      <input
                        type="text"
                        required
                        value={instagramUsername}
                        onChange={(e) => setInstagramUsername(e.target.value)}
                        placeholder="Ex: @mimoopersonalizados"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-24 pr-4 py-2.5 text-xs focus:border-pink-600 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        🔗 Link:
                      </span>
                      <input
                        type="url"
                        required
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="Ex: https://instagram.com/mimoopersonalizados"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs focus:border-pink-600 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity"
                  >
                    Atualizar Instagram
                  </button>
                </form>
              </div>

            </div>
          )}
        </main>
      )}

    </div>
  );
}
