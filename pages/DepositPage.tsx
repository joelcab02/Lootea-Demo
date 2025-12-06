/**
 * DepositPage - Full page deposit flow for mobile
 * Same functionality as DepositModal but as a standalone page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../services/supabaseClient';
import { getAuthState } from '../services/authService';

type PaymentMethod = 'spei' | 'oxxo' | null;
type Step = 'select' | 'details' | 'pending';

// Preset amounts for quick selection
const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

// Datos bancarios
const BANK_INFO = {
  spei: {
    banco: 'BBVA Mexico',
    clabe: '012180001234567890',
    beneficiario: 'LOOTEA GAMING',
  }
};

// Generar referencia unica
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
  const [reference, setReference] = useState<string>(generateReference());
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

  const handleBack = () => {
    if (step === 'details') {
      setStep('select');
      setSelectedMethod(null);
    } else {
      navigate(-1);
    }
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
      <div className="px-4 md:px-8 py-6 md:py-10 max-w-lg mx-auto">
        
        {/* Header with back button */}
        {step !== 'pending' && (
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="text-sm">Volver</span>
          </button>
        )}

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight mb-2">
            {step === 'pending' ? 'Solicitud Enviada' : 'Agregar Fondos'}
          </h1>
          {step === 'select' && (
            <p className="text-slate-500 text-sm">
              Elige cuanto quieres depositar
            </p>
          )}
          {step === 'details' && (
            <p className="text-slate-500 text-sm">
              Completa tu pago
            </p>
          )}
        </div>

        {/* Progress Steps - Only on select and details */}
        {(step === 'select' || step === 'details') && (
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              step === 'select' 
                ? 'bg-[#F7C948] text-black' 
                : 'bg-emerald-500/20 text-emerald-400'
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
            
            <div className={`flex-1 h-0.5 ${step === 'details' ? 'bg-[#F7C948]' : 'bg-[#2a2d36]'}`} />
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              step === 'details' 
                ? 'bg-[#F7C948] text-black' 
                : 'bg-[#1a1d26] text-slate-500 border border-[#2a2d36]'
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
              <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                Monto a depositar
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-bold">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#222222] text-white text-2xl font-bold pl-10 pr-4 py-4 rounded-xl focus:outline-none focus:border-[#F7C948] transition-colors"
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
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${
                    amount === preset.toString()
                      ? 'bg-transparent text-[#F7C948] border-2 border-[#F7C948]'
                      : 'bg-[#1a1a1a] text-slate-400 hover:text-white border border-[#222222] hover:border-slate-500'
                  }`}
                >
                  ${preset.toLocaleString()}
                </button>
              ))}
            </div>
            
            {/* Payment Methods */}
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
                Metodo de pago
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* SPEI */}
                <button
                  onClick={() => setSelectedMethod('spei')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    selectedMethod === 'spei'
                      ? 'bg-[#F7C948]/10 border-2 border-[#F7C948]'
                      : 'bg-[#1a1a1a] border border-[#222222] hover:border-[#F7C948]/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    selectedMethod === 'spei' ? 'bg-[#F7C948]/20' : 'bg-[#0d1019]'
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#F7C948]">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">SPEI</p>
                    <p className="text-xs text-slate-500">5-30 min</p>
                  </div>
                </button>
                
                {/* OXXO */}
                <button
                  onClick={() => setSelectedMethod('oxxo')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    selectedMethod === 'oxxo'
                      ? 'bg-[#F7C948]/10 border-2 border-[#F7C948]'
                      : 'bg-[#1a1a1a] border border-[#222222] hover:border-[#F7C948]/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    selectedMethod === 'oxxo' ? 'bg-[#F7C948]/20' : 'bg-[#0d1019]'
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#F7C948]">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">OXXO</p>
                    <p className="text-xs text-slate-500">1-24 hrs</p>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Continue Button */}
            <button
              onClick={() => handleSelectMethod(selectedMethod)}
              disabled={!selectedMethod || !isValidAmount}
              className="w-full py-4 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black font-display font-bold rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(247,201,72,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
            
            {/* Notice */}
            <p className="text-xs text-slate-500 text-center">
              Minimo $100 MXN - Sin comisiones
            </p>
          </div>
        )}

        {/* STEP 2: SPEI Details */}
        {step === 'details' && selectedMethod === 'spei' && (
          <div className="space-y-6">
            {/* Amount */}
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">${numericAmount.toLocaleString('es-MX')}.00 MXN</p>
            </div>
            
            {/* Bank Info */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Banco</span>
                <span className="text-white font-medium">{BANK_INFO.spei.banco}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Beneficiario</span>
                <span className="text-white font-medium">{BANK_INFO.spei.beneficiario}</span>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">CLABE</span>
                  <button 
                    onClick={() => copyToClipboard(BANK_INFO.spei.clabe, 'clabe')}
                    className={`text-sm font-medium ${copied === 'clabe' ? 'text-green-400' : 'text-[#F7C948]'}`}
                  >
                    {copied === 'clabe' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-white font-mono bg-[#1a1a1a] px-4 py-3 rounded-xl border border-[#222222]">
                  {BANK_INFO.spei.clabe}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Referencia</span>
                  <button 
                    onClick={() => copyToClipboard(reference, 'ref')}
                    className={`text-sm font-medium ${copied === 'ref' ? 'text-green-400' : 'text-[#F7C948]'}`}
                  >
                    {copied === 'ref' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-[#F7C948] font-mono font-bold bg-[#1a1a1a] px-4 py-3 rounded-xl border border-[#222222]">
                  {reference}
                </p>
              </div>
            </div>
            
            {/* Note */}
            <p className="text-sm text-slate-500 text-center">
              Incluye la referencia en el concepto de tu transferencia
            </p>
            
            {/* Confirm Button */}
            <button
              onClick={handleConfirmDeposit}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black font-display font-bold rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Procesando...' : 'Ya realice la transferencia'}
            </button>
          </div>
        )}

        {/* STEP 2: OXXO Details */}
        {step === 'details' && selectedMethod === 'oxxo' && (
          <div className="space-y-6">
            {/* Amount */}
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">${numericAmount.toLocaleString('es-MX')}.00 MXN</p>
            </div>
            
            {/* Reference */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Referencia OXXO</span>
                <button 
                  onClick={() => copyToClipboard(reference, 'ref')}
                  className={`text-sm font-medium ${copied === 'ref' ? 'text-green-400' : 'text-[#F7C948]'}`}
                >
                  {copied === 'ref' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-[#F7C948] font-mono text-xl font-bold bg-[#1a1a1a] px-4 py-4 rounded-xl border border-[#222222] text-center">
                {reference}
              </p>
            </div>
            
            {/* Instructions */}
            <div className="space-y-2 text-slate-400">
              <p>1. Acude a cualquier OXXO</p>
              <p>2. Paga servicio "LOOTEA" con tu referencia</p>
              <p>3. Guarda tu ticket</p>
            </div>
            
            {/* Note */}
            <p className="text-sm text-slate-500 text-center">
              Tu saldo se acreditara en maximo 24 horas
            </p>
            
            {/* Confirm Button */}
            <button
              onClick={handleConfirmDeposit}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black font-display font-bold rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Procesando...' : 'Ya realice el pago'}
            </button>
          </div>
        )}

        {/* STEP 3: Pending */}
        {step === 'pending' && (
          <div className="text-center py-8">
            {/* Success Icon */}
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Solicitud Registrada</h2>
            <p className="text-slate-400 mb-8">
              Tu deposito de <span className="text-[#F7C948] font-bold">${numericAmount.toLocaleString()}</span> esta pendiente de verificacion.
            </p>
            
            {/* Reference */}
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-500 mb-1">Tu referencia</p>
              <p className="text-[#F7C948] font-mono font-bold text-xl">{reference}</p>
            </div>
            
            {/* Timeline */}
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-xl p-4 text-left mb-8">
              <p className="text-sm text-white font-medium mb-4">Que sigue?</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p className="text-slate-400">Solicitud registrada</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7C948]/20 flex items-center justify-center animate-pulse">
                    <span className="text-[#F7C948] text-sm font-bold">2</span>
                  </div>
                  <p className="text-slate-400">Verificamos tu transferencia (5-30 min)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="text-slate-500 text-sm font-bold">3</span>
                  </div>
                  <p className="text-slate-500">Saldo acreditado automaticamente</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black font-display font-bold rounded-xl"
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
