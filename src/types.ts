/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string; // matches Category name, e.g., 'Canecas', 'Camisetas'
  description: string;
  unit_price: number;
  image_url: string;
  orders_count: number;
  active: boolean; // Ativo / Inativo
  created_at?: string;
}

export interface ProductLot {
  id: string;
  product_id: string;
  quantity: 50 | 100 | 200 | number;
  price: number;
}

export interface Banner {
  id: string;
  image_url: string;
  active: boolean;
  created_at?: string;
}

export type OrderStatus = 'Novo' | 'Em produção' | 'Pronto' | 'Entregue';

export interface CartItem {
  id: string; // unique item representation id (can be productId + lotId/unit)
  product: Product;
  type: 'unit' | 'lot';
  quantity: number; // For type: 'unit' it's unit count (e.g. 1, 2, 3). For type: 'lot' it specifies how many lots.
  lotDetails?: {
    lotId: string;
    quantity: number; // e.g. 50, 100, 200 units
    price: number;
  };
  customPhotoUrl?: string; // Client custom design upload image
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  cep?: string; // Option CEP
  payment_method: 'Pix' | 'Cartão' | 'Dinheiro' | 'Débito' | 'Cartão de crédito' | 'Cartão de débito' | string;
  photo_url: string; // client uploaded design reference url
  total: number;
  status: OrderStatus;
  items: Array<{
    id: string;
    product_name: string;
    product_category: string;
    type: 'unit' | 'lot';
    quantity: number; // count of items or lots
    description_details: string; // e.g. "Compra Unitária - 2 un" or "Lote de 100 un"
    price: number;
    image_url: string;
  }>;
  created_at?: string;
}

export interface AppSettings {
  whatsapp_number: string; // Admin phone number formatted for API, e.g. "5511999999999"
}
