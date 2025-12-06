import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const Icons = {
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
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 pb-12 border-b border-white/5">
          
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://tmikqlakdnkjhdbhkjru.supabase.co/storage/v1/object/public/assets/download__3___1_-removebg-preview.png"
                alt="Lootea"
                className="h-10 w-auto"
              />
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
              <FooterLink to="/terminos">Terminos de Servicio</FooterLink>
              <FooterLink to="/privacidad">Privacidad</FooterLink>
              <FooterLink to="/aml">Politica AML</FooterLink>
              <FooterLink to="/envios">Envios y Devoluciones</FooterLink>
            </div>
          </div>

          {/* Ayuda */}
          <div>
            <h5 className="font-display text-white uppercase text-sm mb-4 tracking-wide">Ayuda</h5>
            <div className="flex flex-col gap-2.5">
              <FooterLink to="/faq">Soporte 24/7</FooterLink>
              <FooterLink to="/faq">Preguntas Frecuentes</FooterLink>
              <FooterLink to="/provably-fair">Provably Fair</FooterLink>
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

function FooterLink({ children, to }: { children?: React.ReactNode; to: string }) {
  return (
    <Link to={to} className="text-slate-500 hover:text-[#F7C948] text-sm transition-colors">
      {children}
    </Link>
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