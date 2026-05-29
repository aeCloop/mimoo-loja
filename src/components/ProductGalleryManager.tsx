/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/supabase';
import { Trash2, Plus, ImageIcon, Loader2 } from 'lucide-react';
import { showToast } from '../lib/toast';

interface ProductGalleryManagerProps {
  productId: string;
}

export default function ProductGalleryManager({ productId }: ProductGalleryManagerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const fetched = await api.getProductImages(productId);
      setImages(fetched || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const handleAddUrl = async () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;

    try {
      await api.addProductImage(productId, trimmed);
      setNewUrl('');
      await fetchImages();
      showToast('Imagem adicional vinculada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao associar link da imagem.', 'error');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const uploadedUrl = await api.uploadImage(file, 'products');
      if (uploadedUrl) {
        await api.addProductImage(productId, uploadedUrl);
        await fetchImages();
        showToast('Imagem carregada e salva com sucesso!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao carregar ficheiro para o Storage.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm('Deseja realmente remover esta imagem adicional de amostra?')) return;

    try {
      await api.deleteProductImage(productId, url);
      await fetchImages();
      showToast('Imagem removida com sucesso.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao remover imagem.', 'error');
    }
  };

  return (
    <div className="space-y-2 mt-2 bg-slate-100/50 p-2 text-left rounded-xl border border-slate-100">
      <span className="text-[10px] font-black uppercase text-slate-500 block">
        Galeria de Amostras Adicionais ({images.length})
      </span>

      {/* Grid of thumbnails */}
      {loading ? (
        <div className="flex items-center gap-1.5 py-2">
          <Loader2 size={11} className="animate-spin text-blue-700" />
          <span className="text-[9px] text-slate-400">Verificando galeria...</span>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
          {images.map((img, i) => (
            <div key={i} className="aspect-square rounded-lg bg-white overflow-hidden relative border border-slate-200 group/thumbnail">
              <img
                src={img}
                alt={`Extra ${i + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => handleDelete(img)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumbnail:opacity-100 flex items-center justify-center text-white transition-opacity font-bold rounded-lg cursor-pointer"
              >
                <Trash2 size={13} className="text-rose-400" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[9px] text-slate-400 italic">Nenhuma imagem adicional registrada na galeria.</p>
      )}

      {/* Add extra image control form */}
      <div className="pt-2 border-t border-slate-200/50 space-y-1.5">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL da Imagem adicional..."
            className="flex-grow bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] outline-none placeholder:text-slate-400 focus:border-blue-700"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <Plus size={10} />
            Link
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            id={`extra-img-uploader-${productId}`}
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor={`extra-img-uploader-${productId}`}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1"
          >
            {uploading ? (
              <>
                <Loader2 size={10} className="animate-spin text-blue-700" />
                Carregando...
              </>
            ) : (
              <>
                <ImageIcon size={10} />
                Subir Imagem
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
