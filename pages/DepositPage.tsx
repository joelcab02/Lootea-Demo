/**
 * DepositPage - Stake Style
 * Full page deposit flow for mobile
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../services/supabaseClient';
import { getAuthState } from '../services/authService';

type PaymentMethod = 'spei' | 'oxxo' | null;
type Step = 'select' | 'details' | 'pending';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const BANK_INFO = {
  spei: {
    banco: 'BBVA Mexico',
    clabe: '012180001234567890',
    beneficiario: 'LOOTEA GAMING',
  }
};

const generateReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LT-${timestamp}-${random}`;
};

const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [amount, setAmount] = useState<string>('500');
  const [reference] = useState<string>(generateReference());
  const [copied, setCopied] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setAmount(cleaned);
  };

  const numericAmount = parseInt(amount) || 0;
  const isValidAmount = numericAmount >= 100;

  const handleSelectMethod = (method: PaymentMethod) => {
    if (!isValidAmount) {
      setError('El monto minimo es $100 MXN');
      return;
    }
    setError(null);
    setSelectedMethod(method);
    setStep('details');
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleConfirmDeposit = async () => {
    const authState = getAuthState();
    if (!authState.user) {
      setError('Debes iniciar sesion');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await supabase
        .from('deposit_requests')
        .insert({
          user_id: authState.user.id,
          amount: numericAmount,
          method: selectedMethod,
          reference: reference,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      setStep('pending');
    } catch (err) {
      console.error('Error submitting deposit:', err);
      setStep('pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 md:py-10 max-w-lg mx-auto" style={{ fontFamily: "'Outfit', sans-serif" }}>
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 text-white">
            {step === 'pending' ? 'Solicitud Enviada' : 'Agregar Fondos'}
          </h1>
          <p className="text-[#b1bad3] text-sm md:text-base">
            {step === 'select' && 'Elige cuanto quieres depositar'}
            {step === 'details' && 'Completa tu pago'}
            {step === 'pending' && 'Tu solicitud esta siendo procesada'}
          </p>
        </div>

        {/* Progress Steps */}
        {(step === 'select' || step === 'details') && (
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              step === 'select' 
                ? 'bg-[#3b82f6] text-white' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {step === 'details' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span>1</span>
              )}
              <span>Monto</span>
            </div>
            
            <div className={`flex-1 h-0.5 ${step === 'details' ? 'bg-[#3b82f6]' : 'bg-[#2f4553]'}`} />
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              step === 'details' 
                ? 'bg-[#3b82f6] text-white' 
                : 'bg-[#213743] text-[#5f6c7b] border border-[#2f4553]'
            }`}>
              <span>2</span>
              <span>Pagar</span>
            </div>
          </div>
        )}

        {/* STEP 1: Select Amount & Method */}
        {step === 'select' && (
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-[#b1bad3] text-xs font-medium mb-2 uppercase tracking-wider">
                Monto a depositar
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6c7b] text-xl font-bold">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-[#0f212e] border border-[#2f4553] text-white text-2xl font-bold pl-10 pr-4 py-4 rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
                  placeholder="0"
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
              )}
            </div>
            
            {/* Preset Amounts */}
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className={`py-3 rounded-lg text-sm font-bold transition-all ${
                    amount === preset.toString()
                      ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-2 border-[#3b82f6]'
                      : 'bg-[#213743] text-[#b1bad3] hover:text-white border border-[#2f4553] hover:border-[#3d5564]'
                  }`}
                >
                  ${preset.toLocaleString()}
                </button>
              ))}
            </div>
            
            {/* Payment Methods */}
            <div>
              <label className="block text-[#b1bad3] text-xs font-medium mb-3 uppercase tracking-wider">
                Metodo de pago
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* SPEI */}
                <button
                  onClick={() => setSelectedMethod('spei')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    selectedMethod === 'spei'
                      ? 'bg-[#3b82f6]/10 border-2 border-[#3b82f6]'
                      : 'bg-[#213743] border border-[#2f4553] hover:border-[#3d5564]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    selectedMethod === 'spei' ? 'bg-[#3b82f6]/20' : 'bg-[#0f212e]'
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#3b82f6]">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">SPEI</p>
                    <p className="text-xs text-[#5f6c7b]">5-30 min</p>
                  </div>
                </button>
                
                {/* OXXO */}
                <button
                  onClick={() => setSelectedMethod('oxxo')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    selectedMethod === 'oxxo'
                      ? 'bg-[#3b82f6]/10 border-2 border-[#3b82f6]'
                      : 'bg-[#213743] border border-[#2f4553] hover:border-[#3d5564]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    selectedMethod === 'oxxo' ? 'bg-[#3b82f6]/20' : 'bg-[#0f212e]'
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#3b82f6]">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">OXXO</p>
                    <p className="text-xs text-[#5f6c7b]">1-24 hrs</p>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Continue Button */}
            <button
              onClick={() => handleSelectMethod(selectedMethod)}
              disabled={!selectedMethod || !isValidAmount}
              className="w-full py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
            
            <p className="text-xs text-[#5f6c7b] text-center">
              Minimo $100 MXN - Sin comisiones
            </p>
          </div>
        )}

        {/* STEP 2: SPEI Details */}
        {step === 'details' && selectedMethod === 'spei' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">${numericAmount.toLocaleString('es-MX')}.00 MXN</p>
            </div>
            
            <div className="space-y-4 bg-[#213743] rounded-xl p-4 border border-[#2f4553]">
              <div className="flex justify-between items-center">
                <span className="text-[#b1bad3]">Banco</span>
                <span className="text-white font-medium">{BANK_INFO.spei.banco}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#b1bad3]">Beneficiario</span>
                <span className="text-white font-medium">{BANK_INFO.spei.beneficiario}</span>
              </div>
              
              <div className="border-t border-[#2f4553] pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#b1bad3]">CLABE</span>
                  <button 
                    onClick={() => copyToClipboard(BANK_INFO.spei.clabe, 'clabe')}
                    className={`text-sm font-medium ${copied === 'clabe' ? 'text-green-400' : 'text-[#3b82f6]'}`}
                  >
                    {copied === 'clabe' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-white font-mono bg-[#0f212e] px-4 py-3 rounded-lg">
                  {BANK_INFO.spei.clabe}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#b1bad3]">Referencia</span>
                  <button 
                    onClick={() => copyToClipboard(reference, 'ref')}
                    className={`text-sm font-medium ${copied === 'ref' ? 'text-green-400' : 'text-[#3b82f6]'}`}
                  >
                    {copied === 'ref' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-white font-mono font-bold bg-[#0f212e] px-4 py-3 rounded-lg">
                  {reference}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-[#5f6c7b] text-center">
              Incluye la referencia en el concepto de tu transferencia
            </p>
            
            <button
              onClick={handleConfirmDeposit}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Procesando...' : 'Ya realice la transferencia'}
            </button>
          </div>
        )}

        {/* STEP 2: OXXO Details */}
        {step === 'details' && selectedMethod === 'oxxo' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">${numericAmount.toLocaleString('es-MX')}.00 MXN</p>
            </div>
            
            <div className="bg-[#213743] rounded-xl p-4 border border-[#2f4553]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#b1bad3]">Referencia OXXO</span>
                <button 
                  onClick={() => copyToClipboard(reference, 'ref')}
                  className={`text-sm font-medium ${copied === 'ref' ? 'text-green-400' : 'text-[#3b82f6]'}`}
                >
                  {copied === 'ref' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-white font-mono text-xl font-bold bg-[#0f212e] px-4 py-4 rounded-lg text-center">
                {reference}
              </p>
            </div>
            
            <div className="space-y-2 text-[#b1bad3]">
              <p>1. Acude a cualquier OXXO</p>
              <p>2. Paga servicio "LOOTEA" con tu referencia</p>
              <p>3. Guarda tu ticket</p>
            </div>
            
            <p className="text-sm text-[#5f6c7b] text-center">
              Tu saldo se acreditara en maximo 24 horas
            </p>
            
            <button
              onClick={handleConfirmDeposit}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Procesando...' : 'Ya realice el pago'}
            </button>
          </div>
        )}

        {/* STEP 3: Pending */}
        {step === 'pending' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Solicitud Registrada</h2>
            <p className="text-[#b1bad3] mb-8">
              Tu deposito de <span className="text-white font-bold">${numericAmount.toLocaleString()}</span> esta pendiente de verificacion.
            </p>
            
            <div className="bg-[#213743] border border-[#2f4553] rounded-xl p-4 mb-6">
              <p className="text-xs text-[#5f6c7b] mb-1">Tu referencia</p>
              <p className="text-white font-mono font-bold text-xl">{reference}</p>
            </div>
            
            <div className="bg-[#213743] border border-[#2f4553] rounded-xl p-4 text-left mb-8">
              <p className="text-sm text-white font-medium mb-4">Que sigue?</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p className="text-[#b1bad3]">Solicitud registrada</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center animate-pulse">
                    <span className="text-[#3b82f6] text-sm font-bold">2</span>
                  </div>
                  <p className="text-[#b1bad3]">Verificamos tu transferencia (5-30 min)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2f4553] flex items-center justify-center">
                    <span className="text-[#5f6c7b] text-sm font-bold">3</span>
                  </div>
                  <p className="text-[#5f6c7b]">Saldo acreditado automaticamente</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-lg"
            >
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DepositPage;
