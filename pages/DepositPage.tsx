/**
 * DepositPage - Stake Wallet Style
 * Full page deposit flow for mobile
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../services/supabaseClient';
import { getAuthState } from '../services/authService';

type PaymentMethod = 'spei' | 'oxxo';
type Step = 'select' | 'details' | 'pending';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const BANK_INFO = {
  spei: {
    banco: 'BBVA México',
    clabe: '012180001234567890',
    beneficiario: 'LOOTEA GAMING',
  }
};

const generateReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LT-${timestamp}-${random}`;
};

// Icons
const Icons = {
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Wallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
    </svg>
  ),
};

const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('spei');
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

  const handleContinue = () => {
    if (!isValidAmount) {
      setError('El monto mínimo es $100 MXN');
      return;
    }
    setError(null);
    setStep('details');
  };

  // Navigation handled by bottom nav and header

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
      setError('Debes iniciar sesión');
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

  const formatPresetAmount = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
    return `$${value}`;
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
        
        {/* Card Container - Like desktop modal */}
        <div style={{ background: '#1a2c38', borderRadius: '16px' }}>
          
          {/* Header */}
          <div className="flex items-center gap-2 p-4">
            <span className="text-[#3b82f6]"><Icons.Wallet /></span>
            <span className="text-white font-bold">
              {step === 'pending' ? 'Solicitud Enviada' : 'Wallet'}
            </span>
          </div>
          
          {/* Content */}
          <div className="px-4 pb-6">
            
            {/* STEP 1: Select Amount & Method */}
            {step === 'select' && (
              <>
                {/* Tab Toggle - Stake pill style */}
                <div 
                  className="flex p-1.5 mb-6"
                  style={{ background: '#0f212e', borderRadius: '9999px' }}
                >
                  <button 
                    onClick={() => setSelectedMethod('spei')}
                    className="flex-1 py-2.5 text-sm font-medium transition-all"
                    style={{
                      background: selectedMethod === 'spei' ? '#213743' : 'transparent',
                      color: selectedMethod === 'spei' ? '#ffffff' : '#b1bad3',
                      borderRadius: '9999px',
                    }}
                  >
                    SPEI
                  </button>
                  <button 
                    onClick={() => setSelectedMethod('oxxo')}
                    className="flex-1 py-2.5 text-sm font-medium transition-all"
                    style={{
                      background: selectedMethod === 'oxxo' ? '#213743' : 'transparent',
                      color: selectedMethod === 'oxxo' ? '#ffffff' : '#b1bad3',
                      borderRadius: '9999px',
                    }}
                  >
                    OXXO
                  </button>
                </div>

                {/* Amount Label */}
                <label className="block text-[#b1bad3] text-xs font-medium mb-2">
                  Monto
                </label>
                
                {/* Amount Input - Stake style with container */}
                <div 
                  className="relative mb-4"
                  style={{ background: '#213743', borderRadius: '12px' }}
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6c7b] text-xl font-bold">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full text-white text-2xl font-bold pl-10 pr-4 py-4 focus:outline-none transition-colors bg-transparent"
                    placeholder="0"
                  />
                </div>
                
                {error && (
                  <p className="text-red-400 text-xs mb-4">{error}</p>
                )}
                
                {/* Preset Amounts - Stake style */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className="px-4 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background: amount === preset.toString() ? '#213743' : '#0f212e',
                        color: amount === preset.toString() ? '#ffffff' : '#b1bad3',
                        borderRadius: '8px',
                      }}
                    >
                      {formatPresetAmount(preset)}
                    </button>
                  ))}
                </div>
                
                {/* Method Info - Stake dropdown style */}
                <div 
                  className="flex items-center justify-between p-4 mb-6"
                  style={{ background: '#213743', borderRadius: '12px' }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 flex items-center justify-center"
                      style={{ background: '#0f212e', borderRadius: '12px' }}
                    >
                      {selectedMethod === 'spei' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                          <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {selectedMethod === 'spei' ? 'Transferencia SPEI' : 'Pago en OXXO'}
                      </p>
                      <p className="text-[#5f6c7b] text-sm">
                        {selectedMethod === 'spei' ? '5-30 minutos' : '1-24 horas'}
                      </p>
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6c7b" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                
                {/* CTA - BLUE (Stake style) */}
                <button
                  onClick={handleContinue}
                  disabled={!isValidAmount}
                  className="w-full py-4 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '12px',
                  }}
                >
                  Depositar
                </button>
                
                <p className="text-xs text-[#5f6c7b] text-center mt-4">
                  Mínimo $100 MXN · Sin comisiones
                </p>
              </>
            )}

            {/* STEP 2: Payment Details */}
            {step === 'details' && (
              <>
                {/* Amount Display */}
                <div className="text-center py-6 mb-4">
                  <p className="text-[#5f6c7b] text-sm mb-1">Monto a depositar</p>
                  <p className="text-4xl font-bold text-white">${numericAmount.toLocaleString('es-MX')}.00</p>
                  <p className="text-[#5f6c7b] text-sm">MXN</p>
                </div>
                
                {selectedMethod === 'spei' ? (
                  /* SPEI Details */
                  <div className="space-y-4">
                    <div 
                      className="p-4 space-y-4"
                      style={{ background: '#213743', borderRadius: '12px' }}
                    >
                      <div className="flex justify-between">
                        <span className="text-[#5f6c7b]">Banco</span>
                        <span className="text-white font-medium">{BANK_INFO.spei.banco}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-[#5f6c7b]">Beneficiario</span>
                        <span className="text-white font-medium">{BANK_INFO.spei.beneficiario}</span>
                      </div>
                      
                      {/* CLABE */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#5f6c7b]">CLABE</span>
                          <button 
                            onClick={() => copyToClipboard(BANK_INFO.spei.clabe, 'clabe')}
                            className="flex items-center gap-1 text-sm font-medium"
                            style={{ color: copied === 'clabe' ? '#00e701' : '#3b82f6' }}
                          >
                            {copied === 'clabe' ? <Icons.Check /> : <Icons.Copy />}
                            {copied === 'clabe' ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                        <div 
                          className="px-4 py-3 font-mono text-white"
                          style={{ background: '#0f212e', borderRadius: '6px' }}
                        >
                          {BANK_INFO.spei.clabe}
                        </div>
                      </div>
                      
                      {/* Reference */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#5f6c7b]">Referencia</span>
                          <button 
                            onClick={() => copyToClipboard(reference, 'ref')}
                            className="flex items-center gap-1 text-sm font-medium"
                            style={{ color: copied === 'ref' ? '#00e701' : '#3b82f6' }}
                          >
                            {copied === 'ref' ? <Icons.Check /> : <Icons.Copy />}
                            {copied === 'ref' ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                        <div 
                          className="px-4 py-3 font-mono text-white font-bold"
                          style={{ background: '#0f212e', borderRadius: '6px' }}
                        >
                          {reference}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[#5f6c7b] text-center">
                      Incluye la referencia en el concepto de tu transferencia
                    </p>
                  </div>
                ) : (
                  /* OXXO Details */
                  <div className="space-y-4">
                    <div 
                      className="p-4"
                      style={{ background: '#213743', borderRadius: '12px' }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#5f6c7b]">Referencia OXXO</span>
                        <button 
                          onClick={() => copyToClipboard(reference, 'ref')}
                          className="flex items-center gap-1 text-sm font-medium"
                          style={{ color: copied === 'ref' ? '#00e701' : '#3b82f6' }}
                        >
                          {copied === 'ref' ? <Icons.Check /> : <Icons.Copy />}
                          {copied === 'ref' ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <div 
                        className="px-4 py-4 font-mono text-white text-xl font-bold text-center"
                        style={{ background: '#0f212e', borderRadius: '6px' }}
                      >
                        {reference}
                      </div>
                    </div>
                    
                    <div className="text-[#b1bad3] space-y-2">
                      <p>1. Acude a cualquier OXXO</p>
                      <p>2. Paga servicio "LOOTEA" con tu referencia</p>
                      <p>3. Guarda tu ticket</p>
                    </div>
                    
                    <p className="text-sm text-[#5f6c7b] text-center">
                      Tu saldo se acreditará en máximo 24 horas
                    </p>
                  </div>
                )}
                
                {/* Confirm Button - BLUE */}
                <button
                  onClick={handleConfirmDeposit}
                  disabled={isSubmitting}
                  className="w-full py-4 font-bold transition-all disabled:opacity-50 mt-6"
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '12px',
                  }}
                >
                  {isSubmitting ? 'Procesando...' : 'Ya realicé el pago'}
                </button>
              </>
            )}

            {/* STEP 3: Pending */}
            {step === 'pending' && (
              <div className="text-center py-8">
                {/* Success Icon */}
                <div 
                  className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'rgba(0,231,1,0.15)', borderRadius: '50%' }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00e701" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Solicitud Registrada</h2>
                <p className="text-[#b1bad3] mb-8">
                  Tu depósito de <span className="text-white font-bold">${numericAmount.toLocaleString()}</span> está pendiente.
                </p>
                
                {/* Reference */}
                <div 
                  className="p-4 mb-6"
                  style={{ background: '#213743', borderRadius: '12px' }}
                >
                  <p className="text-[#5f6c7b] text-xs mb-1">Tu referencia</p>
                  <p className="text-white font-mono font-bold text-xl">{reference}</p>
                </div>
                
                {/* Timeline */}
                <div 
                  className="p-4 text-left mb-8"
                  style={{ background: '#213743', borderRadius: '12px' }}
                >
                  <p className="text-white font-medium mb-4">¿Qué sigue?</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(0,231,1,0.15)', borderRadius: '50%' }}
                      >
                        <Icons.Check />
                      </div>
                      <p className="text-[#b1bad3]">Solicitud registrada</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0 animate-pulse"
                        style={{ background: 'rgba(59,130,246,0.15)', borderRadius: '50%' }}
                      >
                        <span className="text-[#3b82f6] text-sm font-bold">2</span>
                      </div>
                      <p className="text-[#b1bad3]">Verificamos tu pago (5-30 min)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                        style={{ background: '#2f4553', borderRadius: '50%' }}
                      >
                        <span className="text-[#5f6c7b] text-sm font-bold">3</span>
                      </div>
                      <p className="text-[#5f6c7b]">Saldo acreditado</p>
                    </div>
                  </div>
                </div>
                
                {/* Done Button */}
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 font-bold transition-all"
                  style={{
                    background: '#213743',
                    color: '#ffffff',
                    borderRadius: '12px',
                  }}
                >
                  Volver al Inicio
                </button>
              </div>
            )}
            
          </div>
        </div>
        
      </div>
    </Layout>
  );
};

export default DepositPage;
