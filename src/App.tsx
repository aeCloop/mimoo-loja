/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Product, Category, Banner, CartItem, Order } from './types';
import { api } from './lib/supabase';
import BannerCarousel from './components/BannerCarousel';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartView from './components/CartView';
import OrdersView from './components/OrdersView';
import AdminLogin from './components/AdminLogin';
import AdminView from './components/AdminView';
import {
  ShoppingBag,
  Home,
  Grid,
  ClipboardList,
  User,
  Search,
  ChevronRight,
  Gift,
  Bell,
  Sparkles,
  Info,
  ArrowRight,
  Instagram,
  MessageCircle
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'inicio' | 'produtos' | 'pedidos' | 'carrinho' | 'admin'>('inicio');

  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Loading/Interactions States
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Cart Local Storage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mimoo_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Admin Logged Session state
  const [isAdmin, setIsAdmin] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('5511999999999');
  const [instagramSettings, setInstagramSettings] = useState({ username: '@mimoopersonalizados', url: 'https://instagram.com/mimoopersonalizados' });

  useEffect(() => {
    // Save cart state
    localStorage.setItem('mimoo_cart_items', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // Initial fetch
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Sync configurations when shifting across active tabs to reflect in footer/floating button immediately
    const syncConfig = async () => {
      try {
        const [wa, insta, adminSession] = await Promise.all([
          api.getWhatsAppNumber(),
          api.getInstagramSettings(),
          api.isAdminLoggedIn()
        ]);
        setWhatsappNumber(wa);
        setInstagramSettings(insta);
        setIsAdmin(adminSession);
        
        if (adminSession) {
          const latestOrders = await api.getOrders();
          setOrders(latestOrders);
        }
      } catch (err) {
        console.error('Error syncing config:', err);
      }
    };
    syncConfig();
  }, [activeTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [p, c, b, o, adminSession, wa, insta] = await Promise.all([
        api.getProducts(false), // Fetch active ones only for client storefront
        api.getCategories(),
        api.getBanners(),
        api.getOrders(),
        api.isAdminLoggedIn(),
        api.getWhatsAppNumber(),
        api.getInstagramSettings()
      ]);
      setProducts(p);
      setCategories(c);
      setBanners(b);
      setOrders(o);
      setIsAdmin(adminSession);
      setWhatsappNumber(wa);
      setInstagramSettings(insta);
    } catch (err) {
      console.error('Error fetching storefront data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toast notifier
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Cart Action Handlers
  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    const itemId = item.type === 'unit' 
      ? `unit-${item.product.id}` 
      : `lot-${item.lotDetails?.lotId}-${item.product.id}`;

    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, id: itemId }];
    });

    setSelectedProduct(null);
    triggerToast('✓ Adicionado ao carrinho com sucesso!');
  };

  const handleUpdateQty = (itemId: string, diff: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.id === itemId) {
          const nextQty = i.quantity + diff;
          return nextQty > 0 ? { ...i, quantity: nextQty } : i;
        }
        return i;
      });
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
    triggerToast('Item removido do carrinho');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order List action hook
  const handleAddOrderToList = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setActiveTab('pedidos');
    triggerToast('🎉 Pedido cadastrado e pronto para aprovação!');
  };

  // Search/Filters computations
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div id="mimoo-applet-root" className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Dynamic Floating Toast notification pill */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-blue-900 text-white font-extrabold text-xs uppercase px-5 py-3 rounded-full flex items-center gap-1.5 shadow-lg max-w-sm w-fit border border-blue-800 transition-all duration-300 transform scale-100 select-none">
          <Sparkles size={13} className="fill-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container structure wrapping mobile or desktop responsive frame */}
      <div className="w-full max-w-4xl mx-auto min-h-screen flex flex-col bg-[#fbfbfb] shadow-2xl pb-24 relative select-none">
        
        {/* Top Header branding bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-rose-50/5 flex items-center justify-between px-5 py-4">
          <div
            id="brand-header-navigation"
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md">
              <Gift size={18} className="fill-white" />
            </div>
            <div>
              <h1 className="font-black text-slate-800 text-base leading-none tracking-tight">
                Mimoo <span className="text-blue-700">Personalizados</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Feito do seu jeito</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('carrinho')}
              className="relative w-9 h-9 bg-slate-50 hover:bg-slate-100 text-blue-900 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90"
              aria-label="Carrinho de Compras"
            >
              <ShoppingBag size={17} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#e31c5f] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => {
                if (isAdmin) {
                  setActiveTab('admin');
                } else {
                  setActiveTab('admin');
                }
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                activeTab === 'admin' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
              title="Acesso Admin"
            >
              <User size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic page screens routing block */}
        <main className="flex-grow p-4 sm:p-6">
          {loading ? (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-black uppercase tracking-widest mt-4 text-blue-900">Preparando seus Mimoos...</p>
            </div>
          ) : (
            <>
              {/* SCREEN 1: HOME PAGE (INÍCIO) */}
              {activeTab === 'inicio' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Promo Landing Banners Slider */}
                  <BannerCarousel banners={banners} />

                  {/* Quick dynamic categories cards buttons */}
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Categorias da Loja</h4>
                      <button
                        onClick={() => {
                          setSelectedCategory('Todos');
                          setActiveTab('produtos');
                        }}
                        className="text-blue-700 hover:text-blue-950 text-xs font-bold flex items-center gap-0.5 transition-colors"
                      >
                        Ver todas <ChevronRight size={13} />
                      </button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-hide">
                      <button
                        onClick={() => setSelectedCategory('Todos')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          selectedCategory === 'Todos'
                            ? 'bg-blue-700 text-white shadow-sm'
                            : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        🏷️ Todos
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                            selectedCategory === cat.name
                              ? 'bg-blue-700 text-white shadow-sm'
                              : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          ✧ {cat.name}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Highlights section (Popular designs) */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-base">Coleção em Destaque</h3>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        Novos Modelos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {filteredProducts.slice(0, 4).map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onSelect={setSelectedProduct}
                          isPopular={prod.orders_count >= 30}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Visual promotional tag line */}
                  <section className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-3xl p-5 text-white flex items-center justify-between gap-4 shadow-md">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Qualidade Máxima
                      </span>
                      <h4 className="font-black text-sm sm:text-base tracking-tight leading-tight pt-1">
                        Desconto real progressivo em compras coletivas!
                      </h4>
                      <p className="text-[10px] text-white/80">Confira a modalidade em Lotes na página de produtos.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('Todos');
                        setActiveTab('produtos');
                      }}
                      className="bg-white text-blue-900 py-2.5 px-4 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm min-w-max flex items-center gap-1"
                    >
                      Ver Atacado
                      <ArrowRight size={12} />
                    </button>
                  </section>

                </div>
              )}

              {/* SCREEN 2: ALL PRODUCTS CATALOG (PRODUTOS) */}
              {activeTab === 'produtos' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Header text and search Input wrapper */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Catálogo Personalizado</h2>
                      <p className="text-xs text-slate-500 mt-1">Selecione peças sob demanda ou pacotes para aniversários e empresas.</p>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar canecas, chaveiros, quadros..."
                        className="w-full bg-slate-100/80 border border-slate-200/40 rounded-xl pl-11 pr-4 py-3 text-xs focus:border-blue-700 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    {/* Category quick selectors line */}
                    <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1">
                      <button
                        onClick={() => setSelectedCategory('Todos')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          selectedCategory === 'Todos'
                            ? 'bg-blue-700 text-white'
                            : 'bg-white border border-slate-100 text-slate-500'
                        }`}
                      >
                        Todos
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                            selectedCategory === cat.name
                              ? 'bg-blue-700 text-white'
                              : 'bg-white border border-slate-100 text-slate-500'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <Info size={28} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold uppercase">Nenhum Mimoo encontrado na busca.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('Todos');
                        }}
                        className="mt-3 text-xs text-blue-700 underline font-extrabold"
                      >
                        Limpar Filtros e voltar
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {filteredProducts.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onSelect={setSelectedProduct}
                          isPopular={prod.orders_count >= 30}
                        />
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* SCREEN 3: ORDERS HISTORIES (PEDIDOS) */}
              {activeTab === 'pedidos' && (
                <OrdersView orders={orders} />
              )}

              {/* SCREEN 4: SHOPPING CART / ORDER FORM CHECKOUT (CARRINHO) */}
              {activeTab === 'carrinho' && (
                <CartView
                  cart={cart}
                  onUpdateQty={handleUpdateQty}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onAddOrderToList={handleAddOrderToList}
                />
              )}

              {/* SCREEN 5: EXECUTIVE GATEKEEPER / ADMIN VIEW (ADMIN) */}
              {activeTab === 'admin' && (
                <>
                  {isAdmin ? (
                    <AdminView
                      onLogout={() => {
                        api.logoutAdmin();
                        setIsAdmin(false);
                        triggerToast('Sessão encerrada com sucesso');
                      }}
                    />
                  ) : (
                    <AdminLogin
                      onLoginSuccess={async () => {
                        setIsAdmin(true);
                        triggerToast('Acesso administrativo autenticado!');
                        const list = await api.getOrders();
                        setOrders(list);
                      }}
                      onCancel={() => {
                        setActiveTab('inicio');
                      }}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Modern, responsive Footer */}
        <footer className="bg-white border-t border-slate-100 py-12 px-6 mt-auto">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 tracking-tight text-base flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-pulse"></span>
                Mimoo Personalizados © 2026
              </h3>
              <p className="text-slate-500 text-xs italic">Criando presentes únicos e momentos inesquecíveis.</p>
            </div>

            {/* Configurable Instagram Profile direct outbound link */}
            {instagramSettings && instagramSettings.username && (
              <a
                href={instagramSettings.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-50 hover:bg-pink-50 border border-slate-100 hover:border-pink-200 text-slate-700 hover:text-pink-600 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shadow-sm group active:scale-95"
              >
                <Instagram size={14} className="text-pink-500 group-hover:scale-110 transition-transform" />
                <span>{instagramSettings.username}</span>
              </a>
            )}

            <div className="pt-4 border-t border-slate-100 w-full text-[10px] text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Tecnologia de ponta em personalização ✨</span>
              <span>
                Desenvolvido por <strong className="font-bold text-slate-600">Adriano Costa</strong>.
              </span>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Action Button (visible above bottom nav on mobile) */}
        <a
          href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20produtos%20personalizados.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white p-3.5 sm:p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-all duration-350 hover:-translate-y-1.5 z-50 flex items-center justify-center cursor-pointer group"
          title="Fale Conosco no WhatsApp"
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-350 ease-out whitespace-nowrap text-xs font-black uppercase tracking-wider text-white select-none">
            Fale Conosco&nbsp;&nbsp;
          </span>
          <MessageCircle size={20} className="fill-white/10 group-hover:rotate-12 transition-transform duration-300" />
        </a>

        {/* Sticky Mobile Fixed navigation footer bar */}
        <nav
          id="fixed-bottom-navigation-bar"
          className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around py-3 px-4 z-40 shadow-[0px_-4px_24px_rgba(0,0,0,0.03)]"
        >
          <div className="w-full max-w-4xl mx-auto flex items-center justify-around">
            
            <button
              id="nav-btn-inicio"
              onClick={() => {
                setActiveTab('inicio');
                setSelectedCategory('Todos');
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'inicio' ? 'text-blue-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home size={18} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Início</span>
            </button>

            <button
              id="nav-btn-produtos"
              onClick={() => setActiveTab('produtos')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'produtos' ? 'text-blue-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid size={18} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Produtos</span>
            </button>

            <button
              id="nav-btn-pedidos"
              onClick={() => setActiveTab('pedidos')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'pedidos' ? 'text-blue-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ClipboardList size={18} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Pedidos</span>
            </button>

            <button
              id="nav-btn-carrinho"
              onClick={() => setActiveTab('carrinho')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative cursor-pointer ${
                activeTab === 'carrinho' ? 'text-blue-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ShoppingBag size={18} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Carrinho</span>
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-1 bg-blue-700 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {cartItemsCount}
                </span>
              )}
            </button>

          </div>
        </nav>

        {/* Selected single product Detail Modal sliding panel */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />

      </div>
    </div>
  );
}
