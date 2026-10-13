import React, { useState } from 'react';
import { X, LogIn, Lock, Mail, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEST_CREDENTIALS } from '../data/constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresá tu correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const success = await login(email.trim(), password.trim());
      if (success) {
        onClose();
      } else {
        setErrorMessage('Credenciales inválidas o cuenta no encontrada.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#1A365D] text-white p-4 flex items-center justify-between border-b-4 border-[#C53030]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-xs">
              <span className="w-6 h-6 rounded-full bg-[#C53030] text-white flex items-center justify-center text-xs font-black">
                G
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Acceso al Sistema</h3>
              <p className="text-[11px] text-blue-200">Club Social y Deportivo "El Globo"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-800 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@elglobo.com.ar"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#1A365D] hover:bg-[#2B6CB0] text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión con JWT</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credentials Helper */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Credenciales Oficiales de Prueba (Base de Datos):</span>
            </div>

            <div className="space-y-1.5">
              {TEST_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => handleQuickLogin(cred.email, cred.password)}
                  className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      {cred.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {cred.email} • {cred.password}
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 group-hover:bg-blue-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    Autocompletar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Autenticación segura con NestJS & JWT</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};
