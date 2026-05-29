/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Product, ProductLot, Category, Banner, Order, OrderStatus } from '../types';

// Retrieve credentials from Vite env injection
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Detect if we have a valid Supabase setup
export const useRealSupabase = supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '';

// Real Supabase instance
export const supabaseClient = useRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Mock Seed Data
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Canecas', created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Camisetas', created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Brindes', created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Quadros', created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Acessórios', created_at: new Date().toISOString() },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Caneca Matte Personalizada Premium',
    category: 'Canecas',
    description: 'Acabamento sofisticado em cerâmica fosca com personalização exclusiva em ouro 24k. Perfeita para brindes corporativos.',
    unit_price: 89.00,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    orders_count: 45,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Camisa Branca Classic Clean',
    category: 'Camisetas',
    description: 'Camiseta de algodão premium 30.1 fio penteado. Oferece alta qualidade para estampagem direta ou bordados elegantes.',
    unit_price: 79.90,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
    orders_count: 32,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Caneca Cerâmica Linha Botânica',
    category: 'Canecas',
    description: 'Caneca com estampa floral delicada em azul royal e detalhes dourados. Um presente atemporal que encanta no café da manhã.',
    unit_price: 45.90,
    image_url: 'https://images.unsplash.com/photo-1539224979037-336000212a3f?q=80&w=600&auto=format&fit=crop',
    orders_count: 120,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Chaveiro Couro Legítimo gravado',
    category: 'Acessórios',
    description: 'Chaveiro minimalista de couro com argola dourada envelhecida. Personalize com iniciais ou logotipos discretos.',
    unit_price: 29.90,
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=600&auto=format&fit=crop',
    orders_count: 89,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Bloco Foto Acrílico',
    category: 'Quadros',
    description: 'Bloco de vidro acrílico de 2cm de espessura com efeito de profundidade 3D incrível para suas recordações e imagens favoritas.',
    unit_price: 54.90,
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
    orders_count: 24,
    active: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_LOTS: ProductLot[] = [
  { id: 'lot-1', product_id: 'prod-1', quantity: 50, price: 3750.00 }, // Standard 50 x 89 = 4450 -> discount to 3750
  { id: 'lot-2', product_id: 'prod-1', quantity: 100, price: 6900.00 }, // Standard 100 x 89 = 8900 -> discount to 6900
  { id: 'lot-3', product_id: 'prod-1', quantity: 200, price: 12400.00 }, // Standard 200 x 89 = 17800 -> discount to 12400
  
  { id: 'lot-4', product_id: 'prod-3', quantity: 50, price: 1950.00 },
  { id: 'lot-5', product_id: 'prod-3', quantity: 100, price: 3600.00 },
  { id: 'lot-6', product_id: 'prod-3', quantity: 200, price: 6500.00 },
];

const DEFAULT_BANNERS: Banner[] = [
  { id: 'banner-1', image_url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1200&auto=format&fit=crop', active: true, created_at: new Date().toISOString() },
  { id: 'banner-2', image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop', active: true, created_at: new Date().toISOString() }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    customer_name: 'Ana Oliveira',
    phone: '11999990001',
    address: 'Rua das Camélias, 120 - Vila Mariana, São Paulo - SP',
    cep: '04048-000',
    payment_method: 'Pix',
    photo_url: '',
    total: 105.80,
    status: 'Novo',
    items: [
      {
        id: 'item-1',
        product_name: 'Caneca Matte Personalizada Premium',
        product_category: 'Canecas',
        type: 'unit',
        quantity: 1,
        description_details: 'Compra Unitária - 1 unidade',
        price: 89.00,
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop'
      }
    ],
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 mins ago
  },
  {
    id: 'ord-1002',
    customer_name: 'Carlos Mendes',
    phone: '21988881122',
    address: 'Av. Atlântica, 4200 Apt 801 - Copacabana, Rio de Janeiro - RJ',
    cep: '22070-012',
    payment_method: 'Cartão de crédito',
    photo_url: '',
    total: 29.90,
    status: 'Em produção',
    items: [
      {
        id: 'item-2',
        product_name: 'Chaveiro Couro Legítimo gravado',
        product_category: 'Acessórios',
        type: 'unit',
        quantity: 1,
        description_details: 'Compra Unitária - 1 unidade',
        price: 29.90,
        image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=600&auto=format&fit=crop'
      }
    ],
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 mins ago
  }
];

// Helper to interact with local storage
const getStored = <T>(key: string, backup: T): T => {
  const data = localStorage.getItem(`mimoo_${key}`);
  if (!data) {
    localStorage.setItem(`mimoo_${key}`, JSON.stringify(backup));
    return backup;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return backup;
  }
};

const setStored = <T>(key: string, val: T) => {
  localStorage.setItem(`mimoo_${key}`, JSON.stringify(val));
};

// INITIAL COLD SEED MOCK
if (!localStorage.getItem('mimoo_initialized')) {
  setStored('categories', DEFAULT_CATEGORIES);
  setStored('products', DEFAULT_PRODUCTS);
  setStored('product_lots', DEFAULT_LOTS);
  setStored('banners', DEFAULT_BANNERS);
  setStored('orders', DEFAULT_ORDERS);
  localStorage.setItem('mimoo_whatsapp_number', '5511999999999');
  localStorage.setItem('mimoo_initialized', 'true');
}

// Global Storage API
export const api = {
  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('categories').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      return getStored<Category[]>('categories', DEFAULT_CATEGORIES);
    }
  },

  async addCategory(name: string): Promise<Category> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('categories')
        .insert([{ name }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = getStored<Category[]>('categories', DEFAULT_CATEGORIES);
      const newItem: Category = {
        id: 'cat-' + Date.now(),
        name,
        created_at: new Date().toISOString()
      };
      setStored('categories', [...list, newItem]);
      return newItem;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      const { error } = await supabaseClient.from('categories').delete().eq('id', id);
      if (error) throw error;
    } else {
      const list = getStored<Category[]>('categories', DEFAULT_CATEGORIES);
      setStored('categories', list.filter(c => c.id !== id));
    }
  },

  // PRODUCTS
  async getProducts(includeInactive = false): Promise<Product[]> {
    if (useRealSupabase && supabaseClient) {
      let query = supabaseClient.from('products').select('*');
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const list = getStored<Product[]>('products', DEFAULT_PRODUCTS);
      return includeInactive ? list : list.filter(p => p.active);
    }
  },

  async addProduct(product: Omit<Product, 'id' | 'orders_count'>): Promise<Product> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('products')
        .insert([{ ...product, orders_count: 0 }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = getStored<Product[]>('products', DEFAULT_PRODUCTS);
      const newItem: Product = {
        ...product,
        id: 'prod-' + Date.now(),
        orders_count: 0,
        created_at: new Date().toISOString()
      };
      setStored('products', [...list, newItem]);
      return newItem;
    }
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = getStored<Product[]>('products', DEFAULT_PRODUCTS);
      const isPresent = list.find(p => p.id === id);
      if (!isPresent) throw new Error('Product not found');
      const updated = { ...isPresent, ...product };
      setStored('products', list.map(p => p.id === id ? updated : p));
      return updated;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      const { error } = await supabaseClient.from('products').delete().eq('id', id);
      if (error) throw error;
    } else {
      const list = getStored<Product[]>('products', DEFAULT_PRODUCTS);
      setStored('products', list.filter(p => p.id !== id));
      // delete connected lots too
      const lots = getStored<ProductLot[]>('product_lots', DEFAULT_LOTS);
      setStored('product_lots', lots.filter(l => l.product_id !== id));
    }
  },

  // PRODUCT LOTS
  async getProductLots(productId?: string): Promise<ProductLot[]> {
    if (useRealSupabase && supabaseClient) {
      let query = supabaseClient.from('product_lots').select('*');
      if (productId) {
        query = query.eq('product_id', productId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } else {
      const list = getStored<ProductLot[]>('product_lots', DEFAULT_LOTS);
      if (productId) {
        return list.filter(l => l.product_id === productId);
      }
      return list;
    }
  },

  async addProductLot(lot: Omit<ProductLot, 'id'>): Promise<ProductLot> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('product_lots').insert([lot]).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getStored<ProductLot[]>('product_lots', DEFAULT_LOTS);
      const newItem: ProductLot = {
        ...lot,
        id: 'lot-' + Date.now()
      };
      setStored('product_lots', [...list, newItem]);
      return newItem;
    }
  },

  async deleteProductLot(id: string): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      const { error } = await supabaseClient.from('product_lots').delete().eq('id', id);
      if (error) throw error;
    } else {
      const list = getStored<ProductLot[]>('product_lots', DEFAULT_LOTS);
      setStored('product_lots', list.filter(l => l.id !== id));
    }
  },

  async updateProductLot(id: string, lot: Partial<ProductLot>): Promise<ProductLot> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('product_lots').update(lot).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getStored<ProductLot[]>('product_lots', DEFAULT_LOTS);
      const found = list.find(l => l.id === id);
      if (!found) throw new Error('Product Lot not found');
      const updated = { ...found, ...lot };
      setStored('product_lots', list.map(l => l.id === id ? updated : l));
      return updated;
    }
  },

  // BANNERS
  async getBanners(): Promise<Banner[]> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('banners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getStored<Banner[]>('banners', DEFAULT_BANNERS);
    }
  },

  async addBanner(image_url: string): Promise<Banner> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('banners').insert([{ image_url, active: true }]).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getStored<Banner[]>('banners', DEFAULT_BANNERS);
      const newItem: Banner = {
        id: 'banner-' + Date.now(),
        image_url,
        active: true,
        created_at: new Date().toISOString()
      };
      setStored('banners', [newItem, ...list]);
      return newItem;
    }
  },

  async deleteBanner(id: string): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      const { error } = await supabaseClient.from('banners').delete().eq('id', id);
      if (error) throw error;
    } else {
      const list = getStored<Banner[]>('banners', DEFAULT_BANNERS);
      setStored('banners', list.filter(b => b.id !== id));
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(o => ({
        ...o,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
      }));
    } else {
      return getStored<Order[]>('orders', DEFAULT_ORDERS);
    }
  },

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<Order> {
    if (useRealSupabase && supabaseClient) {
      const payload = {
        ...orderData,
        status: 'Novo' as OrderStatus,
        items: JSON.stringify(orderData.items) // store items as JSON string in PostgreSQL/Firestore mock text field
      };
      const { data, error } = await supabaseClient.from('orders').insert([payload]).select().single();
      if (error) throw error;
      return {
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items
      };
    } else {
      const list = getStored<Order[]>('orders', DEFAULT_ORDERS);
      const newId = 'ord-' + (1000 + list.length + 1);
      const newOrder: Order = {
        ...orderData,
        id: newId,
        status: 'Novo',
        created_at: new Date().toISOString()
      };
      setStored('orders', [newOrder, ...list]);

      // increment orders_count on the products purchased
      const prods = getStored<Product[]>('products', DEFAULT_PRODUCTS);
      const updatedProds = prods.map(p => {
        const boughtItem = orderData.items.find(item => item.id.includes(p.id) || p.id === item.id);
        if (boughtItem) {
          return { ...p, orders_count: p.orders_count + boughtItem.quantity };
        }
        return p;
      });
      setStored('products', updatedProds);

      return newOrder;
    }
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items
      };
    } else {
      const list = getStored<Order[]>('orders', DEFAULT_ORDERS);
      const found = list.find(o => o.id === id);
      if (!found) throw new Error('Order not found');
      const updated = { ...found, status };
      setStored('orders', list.map(o => o.id === id ? updated : o));
      return updated;
    }
  },

  // CONFIGURATIONS (WhatsApp Number)
  async getWhatsAppNumber(): Promise<string> {
    if (useRealSupabase && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('app_settings')
          .select('value')
          .eq('key', 'whatsapp_number');
        if (!error && data && data.length > 0) {
          return data[0].value;
        }
      } catch (err) {
        console.warn('Error fetching whatsapp_number from app_settings', err);
      }
    }
    return localStorage.getItem('mimoo_whatsapp_number') || '5511999999999';
  },

  async updateWhatsAppNumber(num: string): Promise<void> {
    const cleanNum = num.replace(/\D/g, '');
    if (useRealSupabase && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('app_settings')
          .select('id')
          .eq('key', 'whatsapp_number');

        if (!error && data && data.length > 0) {
          await supabaseClient
            .from('app_settings')
            .update({ value: cleanNum })
            .eq('id', data[0].id);
        } else {
          await supabaseClient
            .from('app_settings')
            .insert([{ key: 'whatsapp_number', value: cleanNum }]);
        }
      } catch (err) {
        console.warn('Error updating whatsapp_number in app_settings', err);
      }
    }
    localStorage.setItem('mimoo_whatsapp_number', cleanNum);
  },

  // CONFIGURATIONS (Instagram Settings)
  async getInstagramSettings(): Promise<{ username: string; url: string }> {
    let username = localStorage.getItem('mimoo_instagram_username') || '@mimoopersonalizados';
    let url = localStorage.getItem('mimoo_instagram_url') || 'https://instagram.com/mimoopersonalizados';

    if (useRealSupabase && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('app_settings')
          .select('key, value')
          .in('key', ['instagram_username', 'instagram_url']);

        if (!error && data && data.length > 0) {
          const userRow = data.find(r => r.key === 'instagram_username');
          const urlRow = data.find(r => r.key === 'instagram_url');
          if (userRow) username = userRow.value;
          if (urlRow) url = urlRow.value;
        }
      } catch (err) {
        console.warn('Supabase app_settings error loading columns, falling back to localStorage', err);
      }
    }
    return { username, url };
  },

  async updateInstagramSettings(username: string, url: string): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      try {
        // Update username
        const { data: userExist, error: userError } = await supabaseClient
          .from('app_settings')
          .select('id')
          .eq('key', 'instagram_username');
        if (!userError && userExist && userExist.length > 0) {
          await supabaseClient
            .from('app_settings')
            .update({ value: username })
            .eq('id', userExist[0].id);
        } else {
          await supabaseClient
            .from('app_settings')
            .insert([{ key: 'instagram_username', value: username }]);
        }

        // Update url
        const { data: urlExist, error: urlError } = await supabaseClient
          .from('app_settings')
          .select('id')
          .eq('key', 'instagram_url');
        if (!urlError && urlExist && urlExist.length > 0) {
          await supabaseClient
            .from('app_settings')
            .update({ value: url })
            .eq('id', urlExist[0].id);
        } else {
          await supabaseClient
            .from('app_settings')
            .insert([{ key: 'instagram_url', value: url }]);
        }
      } catch (err) {
        console.warn('Supabase app_settings error updating columns, storing locally', err);
      }
    }
    localStorage.setItem('mimoo_instagram_username', username);
    localStorage.setItem('mimoo_instagram_url', url);
  },

  // CONFIGURATIONS (Logo Settings)
  async getStoreLogoUrl(): Promise<string> {
    if (useRealSupabase && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('app_settings')
          .select('value')
          .eq('key', 'store_logo_url');
        if (!error && data && data.length > 0) {
          return data[0].value;
        }
      } catch (err) {
        console.warn('Error fetching store_logo_url from app_settings', err);
      }
    }
    return localStorage.getItem('mimoo_store_logo_url') || '';
  },

  async updateStoreLogoUrl(url: string): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('app_settings')
          .select('id')
          .eq('key', 'store_logo_url');

        if (!error && data && data.length > 0) {
          await supabaseClient
            .from('app_settings')
            .update({ value: url })
            .eq('id', data[0].id);
        } else {
          await supabaseClient
            .from('app_settings')
            .insert([{ key: 'store_logo_url', value: url }]);
        }
      } catch (err) {
        console.warn('Error updating store_logo_url in app_settings', err);
      }
    }
    localStorage.setItem('mimoo_store_logo_url', url);
  },

  // AUTHENTICATION
  async loginAdmin(email: string, password: string): Promise<boolean> {
    if (useRealSupabase && supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return !!data.user;
    } else {
      // Mock log in simulation
      // Fallback custom login matching any email containing admin or simple password 'admin' for sandbox tests
      if (email.trim() !== '' && password === 'admin') {
        localStorage.setItem('mimoo_admin_logged_in', 'true');
        return true;
      }
      return false;
    }
  },

  async logoutAdmin(): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('mimoo_admin_logged_in');
  },

  async isAdminLoggedIn(): Promise<boolean> {
    if (useRealSupabase && supabaseClient) {
      const { data } = await supabaseClient.auth.getSession();
      return !!data.session;
    }
    return localStorage.getItem('mimoo_admin_logged_in') === 'true';
  },

  // STORAGE / FILE UPLOAD
  async uploadImage(file: File, bucket: 'products' | 'banners' | 'orders' | 'logos'): Promise<string> {
    if (useRealSupabase && supabaseClient) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      try {
        const { error: uploadError } = await supabaseClient.storage
          .from(bucket)
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(filePath);
          return data.publicUrl;
        }
        console.warn(`Initial upload attempt to bucket "${bucket}" failed. Error Details:`, uploadError);
      } catch (err) {
        console.warn(`Exception during initial upload attempt to bucket "${bucket}":`, err);
      }

      // Fallback: If designated bucket failed and it wasn't 'products', try 'products' bucket
      if (bucket !== 'products') {
        console.log(`Switching to fallback storage upload: routing to "products" bucket for target category "${bucket}"`);
        const subfolderPath = `${bucket}/${fileName}`;

        try {
          // Attempt 1: Try putting it inside a subfolder in 'products' bucket
          const { error: subfolderError } = await supabaseClient.storage
            .from('products')
            .upload(subfolderPath, file);

          if (!subfolderError) {
            const { data } = supabaseClient.storage
              .from('products')
              .getPublicUrl(subfolderPath);
            return data.publicUrl;
          }
          console.warn(`Fallback upload to "products" with subfolder prefix failed:`, subfolderError);

          // Attempt 2: Try putting it directly at the root level of 'products' bucket
          const { error: rootError } = await supabaseClient.storage
            .from('products')
            .upload(fileName, file);

          if (!rootError) {
            const { data } = supabaseClient.storage
              .from('products')
              .getPublicUrl(fileName);
            return data.publicUrl;
          }
          throw rootError;
        } catch (fallbackErr: any) {
          console.error(`All storage bucket routes exhausted/failed for item "${file.name}":`, fallbackErr);
          throw new Error(fallbackErr.message || `Erro de armazenamento no Supabase. O bucket "${bucket}" não está disponível ou suas políticas de acesso público estão restritas.`);
        }
      } else {
        throw new Error(`Erro de armazenamento no Supabase. O bucket principal "products" não pôde ser acessado. Verifique as configurações de RLS públicas em seu painel.`);
      }
    } else {
      // Offline/local sandbox upload simulation: convert to high quality Base64 so it can be verified beautifully in the preview!
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read visual data'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    }
  },

  // PRODUCT ADDITIONAL IMAGES
  async getProductImages(productId: string): Promise<string[]> {
    if (useRealSupabase && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('product_images')
          .select('image_url')
          .eq('product_id', productId)
          .order('sort_order', { ascending: true });
        
        if (!error && data) {
          return data.map(item => item.image_url);
        }
      } catch (err) {
        console.warn('Could not query product_images table, using localStorage fallback', err);
      }
    }
    const list = getStored<{ id: string; product_id: string; image_url: string; sort_order: number }[]>('product_images', []);
    return list
      .filter(item => item.product_id === productId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => item.image_url);
  },

  async addProductImage(productId: string, imageUrl: string): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      try {
        const { data: existing } = await supabaseClient
          .from('product_images')
          .select('sort_order')
          .eq('product_id', productId);
        
        const nextOrder = (existing?.length || 0) + 1;
        
        const { error } = await supabaseClient
          .from('product_images')
          .insert([{ product_id: productId, image_url: imageUrl, sort_order: nextOrder }]);
        
        if (!error) return;
        console.warn('Insert in product_images table failed, saving locally', error);
      } catch (err) {
        console.warn('Error inserting in product_images table, saving locally', err);
      }
    }
    const list = getStored<{ id: string; product_id: string; image_url: string; sort_order: number }[]>('product_images', []);
    const nextOrder = list.filter(item => item.product_id === productId).length + 1;
    const newItem = {
      id: 'img-' + Date.now() + Math.random().toString(36).substring(2, 5),
      product_id: productId,
      image_url: imageUrl,
      sort_order: nextOrder
    };
    setStored('product_images', [...list, newItem]);
  },

  async deleteProductImage(productId: string, imageUrl: string): Promise<void> {
    if (useRealSupabase && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('product_images')
          .delete()
          .eq('product_id', productId)
          .eq('image_url', imageUrl);
        
        if (!error) return;
        console.warn('Deletation in product_images table failed, deleting locally', error);
      } catch (err) {
        console.warn('Error deleting in product_images table, deleting locally', err);
      }
    }
    const list = getStored<{ id: string; product_id: string; image_url: string; sort_order: number }[]>('product_images', []);
    setStored('product_images', list.filter(item => !(item.product_id === productId && item.image_url === imageUrl)));
  }
};
