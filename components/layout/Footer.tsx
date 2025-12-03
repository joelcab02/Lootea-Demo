import React, { memo } from 'react';
import { Logo } from '../shared/Logo';

const Icons = {
    ShieldCheck: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
    RefreshCW: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
    Truck: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
    Card: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
    Social: {
        X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
        Insta: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
        Face: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    }
};

function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background with subtle pattern */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: '#111111',
        }}
      />
      
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #F7C948 50%, transparent 100%)' }} />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-10 md:pt-14 pb-8">
        
        {/* Trust Badges - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 md:mb-16">
          <TrustCard 
            icon={<Icons.ShieldCheck />}
            title="100% Auténticos"
            desc="Verificados por StockX y retailers oficiales"
          />
          <TrustCard 
            icon={<Icons.RefreshCW />}
            title="Intercambio Instantáneo"
            desc="Cambia items por saldo sin comisiones"
          />
          <TrustCard 
            icon={<Icons.Truck />}
            title="Envío Gratis México"
            desc="Entrega asegurada a tu puerta"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 pb-12 border-b border-white/5">
          
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F7C948] blur-xl opacity-30" />
                <Logo size={36} />
              </div>
              <span 
                className="font-display text-2xl uppercase"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F7C948 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                LOOTEA
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
              La experiencia premium de Mystery Boxes en México. Abre cajas con probabilidad justa verificable.
            </p>
            
            {/* Social */}
            <div className="flex gap-2">
              <SocialButton icon={<Icons.Social.X />} />
              <SocialButton icon={<Icons.Social.Insta />} />
              <SocialButton icon={<Icons.Social.Face />} />
            </div>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-display text-white uppercase text-sm mb-4 tracking-wide">Legal</h5>
            <div className="flex flex-col gap-2.5">
              <FooterLink>Términos de Servicio</FooterLink>
              <FooterLink>Privacidad</FooterLink>
              <FooterLink>Política AML</FooterLink>
              <FooterLink>Envíos y Devoluciones</FooterLink>
            </div>
          </div>

          {/* Juegos */}
          <div>
            <h5 className="font-display text-white uppercase text-sm mb-4 tracking-wide">Juegos</h5>
            <div className="flex flex-col gap-2.5">
              <FooterLink>Cajas Misteriosas</FooterLink>
              <FooterLink>Batallas de Cajas</FooterLink>
              <FooterLink>Upgrader</FooterLink>
            </div>
          </div>

          {/* Ayuda */}
          <div>
            <h5 className="font-display text-white uppercase text-sm mb-4 tracking-wide">Ayuda</h5>
            <div className="flex flex-col gap-2.5">
              <FooterLink>Soporte 24/7</FooterLink>
              <FooterLink>Preguntas Frecuentes</FooterLink>
              <FooterLink>Provably Fair</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-xs mr-2">Pagos:</span>
            <PaymentBadge>VISA</PaymentBadge>
            <PaymentBadge>MC</PaymentBadge>
            <PaymentBadge>OXXO</PaymentBadge>
            <PaymentBadge>SPEI</PaymentBadge>
            <PaymentBadge highlight>BTC</PaymentBadge>
            <PaymentBadge highlight>USDT</PaymentBadge>
          </div>
          
          {/* Copyright */}
          <p className="text-slate-600 text-xs font-display uppercase tracking-wider">
            © 2025 Lootea México
          </p>
        </div>
      </div>
    </footer>
  );
}

function TrustCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div 
      className="p-5 rounded-2xl relative overflow-hidden group"
      style={{
        background: '#1a1a1a',
        border: '1px solid #222222',
        contain: 'layout paint',
      }}
    >
      {/* Top shine */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#F7C948] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity" />
      
      <div className="flex items-start gap-4">
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(247,201,72,0.15) 0%, rgba(247,201,72,0.05) 100%)',
            border: '1px solid rgba(247,201,72,0.2)',
          }}
        >
          <div className="text-[#F7C948]">{icon}</div>
        </div>
        <div>
          <h3 className="font-display text-white text-sm uppercase mb-1">{title}</h3>
          <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  )
}

function PaymentBadge({ children, highlight = false }: { children: React.ReactNode, highlight?: boolean }) {
  return (
    <span 
      className="px-2.5 py-1 rounded-md text-[10px] font-display uppercase"
      style={highlight ? {
        background: 'linear-gradient(135deg, rgba(247,201,72,0.15) 0%, rgba(247,201,72,0.05) 100%)',
        border: '1px solid rgba(247,201,72,0.25)',
        color: '#F7C948',
      } : {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: '#64748b',
      }}
    >
      {children}
    </span>
  )
}

function FooterLink({ children }: { children?: React.ReactNode }) {
  return (
    <a href="#" className="text-slate-500 hover:text-[#F7C948] text-sm transition-colors">
      {children}
    </a>
  )
}

function SocialButton({ icon }: { icon: React.ReactNode }) {
  return (
    <a 
      href="#" 
      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#F7C948] transition-all relative overflow-hidden group"
      style={{
        background: '#1a1a1a',
        border: '1px solid #222222',
      }}
    >
      <div className="absolute inset-0 bg-[#F7C948] opacity-0 group-hover:opacity-10 transition-opacity" />
      <div className="relative z-10">{icon}</div>
    </a>
  )
}

export default memo(Footer);