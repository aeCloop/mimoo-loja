/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../lib/supabase';
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText('');

    try {
      const success = await api.loginAdmin(email, password);
      if (success) {
        onLoginSuccess();
      } else {
        setErrorText('E-mail ou senha incorretos.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Erro inesperado de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-window-container" className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-slate-100 shadow-[0px_8px_32px_rgba(0,0,0,0.06)] animate-fadeIn">
      
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={24} />
        </div>
        <h2 className="text-xl font-black text-slate-800">Mimoo Admin</h2>
        <p className="text-slate-500 text-xs mt-1">Acesso exclusivo para gerenciadores da loja</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email */}
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-1">
            E-mail Administrativo
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail size={15} />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: admin@seudominio.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-blue-700 focus:ring-1 focus:ring-blue-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-1">
            Senha de Acesso
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={15} />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha admin"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-blue-700 focus:ring-1 focus:ring-blue-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Error notification banner */}
        {errorText && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold leading-snug">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        <div className="pt-3 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Voltar à Loja
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              'Autenticar'
            )}
          </button>
        </div>
      </form>

      {/* Guide notes for developers/testers */}
      <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-2 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-100">
        <p className="font-bold text-slate-500 uppercase tracking-wider text-[8px]">Informativos:</p>
        <p>
          Esta tela utiliza o <strong>Supabase Auth</strong> para validar seu e-mail e senha administrativo do painel.
        </p>
      </div>

    </div>
  );
}
