import React, { useState } from 'react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'spei' | 'oxxo' | null;

// Preset amounts for quick selection
const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [amount, setAmount] = useState<string>('500');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(cleaned);
  };

  const numericAmount = parseFloat(amount) || 0;
  const isValidAmount = numericAmount >= 100;

  const handleContinue = () => {
    if (!selectedMethod || !isValidAmount) return;
    setIsProcessing(true);
    // TODO: Integrate with payment provider
    setTimeout(() => setIsProcessing(false), 1000);
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#0d1019] border border-[#1e2330] rounded-2xl shadow-2xl">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F7C948] to-transparent"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e2330]">
          <div className="flex items-center gap-3">
            {selectedMethod && (
              <button 
                onClick={handleBack}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <h2 className="font-display font-bold text-xl text-white">
              Depositar Fondos
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {!selectedMethod ? (
            // Method Selection
            <>
              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* SPEI */}
                <button
                  onClick={() => setSelectedMethod('spei')}
                  className="flex flex-col items-center gap-3 p-4 bg-[#1a1d26] border border-[#2a2d36] rounded-xl hover:border-[#F7C948]/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-[#0d1019] rounded-full flex items-center justify-center group-hover:bg-[#F7C948]/10 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F7C948]">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">SPEI</p>
                    <p className="text-xs text-slate-500">Transferencia Bancaria</p>
                  </div>
                </button>
                
                {/* OXXO */}
                <button
                  onClick={() => setSelectedMethod('oxxo')}
                  className="flex flex-col items-center gap-3 p-4 bg-[#1a1d26] border border-[#2a2d36] rounded-xl hover:border-[#F7C948]/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-[#0d1019] rounded-full flex items-center justify-center group-hover:bg-[#F7C948]/10 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F7C948]">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">OXXO</p>
                    <p className="text-xs text-slate-500">Pago en Efectivo</p>
                  </div>
                </button>
              </div>
              
              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                  Monto a depositar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full bg-[#1a1d26] border border-[#2a2d36] text-white text-xl font-bold pl-8 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#F7C948] transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              {/* Preset Amounts */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${
                      amount === preset.toString()
                        ? 'bg-[#F7C948] text-black'
                        : 'bg-[#1a1d26] text-slate-400 hover:text-white border border-[#2a2d36] hover:border-[#F7C948]/30'
                    }`}
                  >
                    ${preset.toLocaleString()}
                  </button>
                ))}
              </div>
              
              {/* Minimum Notice */}
              <p className="text-xs text-slate-500 text-center mb-4">
                Depósito mínimo: $100 MXN
              </p>
              
              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!selectedMethod && !isValidAmount}
                className="w-full py-3 bg-[#F7C948] hover:bg-[#FFD966] text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selecciona un método de pago
              </button>
            </>
          ) : selectedMethod === 'spei' ? (
            // SPEI Details
            <div className="space-y-4">
              <div className="bg-[#1a1d26] border border-[#2a2d36] rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Monto a depositar</p>
                <p className="text-2xl font-bold text-[#F7C948]">${numericAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              
              <div className="bg-[#1a1d26] border border-[#2a2d36] rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Banco</p>
                  <p className="text-white font-medium">STP (Sistema de Transferencias)</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">CLABE Interbancaria</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-sm flex-1">646180123456789012</p>
                    <button className="p-2 text-slate-400 hover:text-[#F7C948] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Beneficiario</p>
                  <p className="text-white font-medium">LOOTEA GAMING SA DE CV</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Referencia</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-sm flex-1">REF-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                    <button className="p-2 text-slate-400 hover:text-[#F7C948] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F7C948]/10 border border-[#F7C948]/30 rounded-xl p-4">
                <p className="text-sm text-[#F7C948]">
                  <strong>Importante:</strong> Incluye la referencia en tu transferencia. 
                  Tu saldo se acreditará automáticamente en 1-5 minutos.
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#F7C948] hover:bg-[#FFD966] text-black font-bold rounded-xl transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : (
            // OXXO Details
            <div className="space-y-4">
              <div className="bg-[#1a1d26] border border-[#2a2d36] rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Monto a pagar en OXXO</p>
                <p className="text-2xl font-bold text-[#F7C948]">${numericAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-slate-500 mt-1">+ $10 comisión OXXO</p>
              </div>
              
              <div className="bg-[#1a1d26] border border-[#2a2d36] rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Código de pago</p>
                
                {/* Barcode placeholder */}
                <div className="bg-white rounded-lg p-4 mb-3">
                  <div className="h-16 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px)]"></div>
                  <p className="text-center text-black font-mono text-sm mt-2">
                    {Math.random().toString().substring(2, 16)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Referencia OXXO</p>
                  <button className="text-[#F7C948] text-sm font-medium hover:underline">
                    Copiar
                  </button>
                </div>
              </div>
              
              <div className="bg-[#1a1d26] border border-[#2a2d36] rounded-xl p-4 space-y-2">
                <p className="text-sm text-white font-medium">Instrucciones:</p>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Acude a cualquier tienda OXXO</li>
                  <li>Indica que harás un pago de servicio</li>
                  <li>Proporciona el código de barras</li>
                  <li>Paga el monto exacto en efectivo</li>
                </ol>
              </div>
              
              <div className="bg-[#F7C948]/10 border border-[#F7C948]/30 rounded-xl p-4">
                <p className="text-sm text-[#F7C948]">
                  <strong>Importante:</strong> Tu saldo se acreditará en máximo 24 horas después del pago.
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#F7C948] hover:bg-[#FFD966] text-black font-bold rounded-xl transition-colors"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
        
        {/* Footer disclaimer */}
        <div className="px-4 pb-4">
          <p className="text-xs text-slate-600 text-center">
            Los fondos depositados solo pueden usarse para jugar. No hay reembolsos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
