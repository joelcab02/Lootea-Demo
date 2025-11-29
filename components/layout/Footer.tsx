import React, { memo } from 'react';

const Icons = {
    ShieldCheck: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
    RefreshCW: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
    Truck: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
    Card: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
    Logo: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFC800" stroke="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    Social: {
        X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
        Insta: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
        Face: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    }
};

function Footer() {
  return (
    <footer 
      className="relative pt-12 pb-6 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0c10 0%, #06080a 100%)' }}
    >
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFC800]/20 to-transparent"></div>
      
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 relative z-10">
        
        {/* Features Row - Compact Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <FeatureCard icon={<Icons.ShieldCheck />} title="100% Auténticos" />
          <FeatureCard icon={<Icons.RefreshCW />} title="Intercambio Instantáneo" />
          <FeatureCard icon={<Icons.Truck />} title="Envío Gratis México" />
          <FeatureCard icon={<Icons.Card />} title="Pagos Seguros" highlight />
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 pb-8 border-b border-white/5">
          
          {/* Brand - Takes 2 cols on lg */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative">
                <Icons.Logo />
              </div>
              <span 
                className="font-display text-xl uppercase tracking-wide"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FFC800 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                LOOTEA
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed mb-4 max-w-[280px]">
              La experiencia premium de Mystery Boxes en México. Probabilidad justa verificable.
            </p>
            <div className="flex gap-1.5">
              <SocialButton icon={<Icons.Social.X />} />
              <SocialButton icon={<Icons.Social.Insta />} />
              <SocialButton icon={<Icons.Social.Face />} />
            </div>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-display text-[#FFC800] uppercase text-xs mb-3 tracking-wider">Legal</h5>
            <div className="flex flex-col gap-2">
              <FooterLink>Términos de Servicio</FooterLink>
              <FooterLink>Privacidad</FooterLink>
              <FooterLink>Política AML</FooterLink>
              <FooterLink>Envíos</FooterLink>
            </div>
          </div>

          {/* Juegos */}
          <div>
            <h5 className="font-display text-[#FFC800] uppercase text-xs mb-3 tracking-wider">Juegos</h5>
            <div className="flex flex-col gap-2">
              <FooterLink>Cajas Misteriosas</FooterLink>
              <FooterLink>Batallas</FooterLink>
              <FooterLink>Upgrader</FooterLink>
            </div>
          </div>

          {/* Ayuda */}
          <div>
            <h5 className="font-display text-[#FFC800] uppercase text-xs mb-3 tracking-wider">Ayuda</h5>
            <div className="flex flex-col gap-2">
              <FooterLink>Soporte 24/7</FooterLink>
              <FooterLink>FAQ</FooterLink>
              <FooterLink>Provably Fair</FooterLink>
            </div>
          </div>

          {/* Pagos */}
          <div>
            <h5 className="font-display text-[#FFC800] uppercase text-xs mb-3 tracking-wider">Pagos</h5>
            <div className="flex flex-wrap gap-1">
              <PaymentBadge>VISA</PaymentBadge>
              <PaymentBadge>MC</PaymentBadge>
              <PaymentBadge>OXXO</PaymentBadge>
              <PaymentBadge>SPEI</PaymentBadge>
              <PaymentBadge>BTC</PaymentBadge>
              <PaymentBadge>USDT</PaymentBadge>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-5 text-center">
          <p className="text-slate-700 text-[10px] uppercase tracking-widest font-display">
            © 2025 Lootea México • Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}

function FeatureCard({ icon, title, highlight = false }: { icon: React.ReactNode, title: string, highlight?: boolean }) {
  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
      style={highlight ? {
        background: 'linear-gradient(135deg, rgba(255,200,0,0.15) 0%, rgba(255,200,0,0.05) 100%)',
        border: '1px solid rgba(255,200,0,0.2)',
      } : {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div className={highlight ? 'text-[#FFC800]' : 'text-slate-500'}>
        {icon}
      </div>
      <span className={`font-display text-xs uppercase tracking-wide ${highlight ? 'text-[#FFC800]' : 'text-slate-400'}`}>
        {title}
      </span>
    </div>
  )
}

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded text-[9px] font-display text-slate-500 bg-white/[0.03] border border-white/5 uppercase">
      {children}
    </span>
  )
}

function FooterLink({ children }: { children?: React.ReactNode }) {
  return (
    <a href="#" className="text-slate-600 hover:text-white text-xs transition-colors">
      {children}
    </a>
  )
}

function SocialButton({ icon }: { icon: React.ReactNode }) {
  return (
    <a 
      href="#" 
      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#FFC800] transition-colors bg-white/[0.02] border border-white/5 hover:border-[#FFC800]/20"
    >
      {icon}
    </a>
  )
}

export default memo(Footer);