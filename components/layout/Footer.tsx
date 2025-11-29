import React, { memo } from 'react';

const Icons = {
    ShieldCheck: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
    RefreshCW: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
    Truck: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
    Logo: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFC800" stroke="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    Social: {
        X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
        Insta: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
        Face: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    }
};

function Footer() {
  return (
    <footer className="relative border-t border-[#1e2330]/50 pt-16 pb-8 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0c10 0%, #080a0e 100%)' }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#FFC800]/30 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FFC800]/[0.02] to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 relative z-10">
            
        {/* Features Section - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          <FeatureCard 
            icon={<Icons.ShieldCheck />}
            title="100% Items Auténticos"
            desc="Cada ítem que recibes es verificado auténtico de StockX o retailers oficiales."
          />
          <FeatureCard 
            icon={<Icons.RefreshCW />}
            title="Intercambio de Items"
            desc="Cambia los ítems que no quieras por saldo instantáneo en Lootea sin comisiones."
          />
          <FeatureCard 
            icon={<Icons.Truck />}
            title="Envíos a Todo México"
            desc="Reclama tu premio y recíbelo en la puerta de tu casa asegurado."
          />
        </div>

        {/* Payment Methods - Premium */}
        <div 
          className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-14 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,200,0,0.08) 0%, rgba(255,200,0,0.02) 100%)',
            border: '1px solid rgba(255,200,0,0.15)',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFC800] opacity-5 blur-3xl"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-black"
              style={{
                background: 'linear-gradient(135deg, #FFE566 0%, #FFC800 50%, #E6A800 100%)',
                boxShadow: '0 4px 15px rgba(255,200,0,0.3)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <div>
              <h4 className="font-display text-white uppercase">Métodos de Pago</h4>
              <p className="text-[#FFC800]/60 text-xs">Seguros y Encriptados</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 relative z-10">
            <PaymentIcon label="VISA" />
            <PaymentIcon label="MASTERCARD" />
            <PaymentIcon label="OXXO" />
            <PaymentIcon label="SPEI" />
            <PaymentIcon label="BITCOIN" />
            <PaymentIcon label="USDT" />
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            {/* Logo with glow */}
            <div className="flex items-center gap-3 mb-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FFC800] blur-lg opacity-40"></div>
                <div className="relative" style={{ filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.6))' }}>
                  <Icons.Logo />
                </div>
              </div>
              <span 
                className="font-display text-2xl uppercase"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FFC800 60%, #E6A800 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                LOOTEA
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
              La experiencia premium de Mystery Boxes en México. Abre cajas con probabilidad justa verificable y gana productos reales.
            </p>
            <div className="flex gap-2">
              <SocialButton icon={<Icons.Social.X />} />
              <SocialButton icon={<Icons.Social.Insta />} />
              <SocialButton icon={<Icons.Social.Face />} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="font-display text-white uppercase mb-1 text-sm" style={{ textShadow: '0 0 20px rgba(255,200,0,0.3)' }}>Legal</h5>
            <FooterLink>Términos de Servicio</FooterLink>
            <FooterLink>Privacidad</FooterLink>
            <FooterLink>Política AML</FooterLink>
            <FooterLink>Envíos y Devoluciones</FooterLink>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="font-display text-white uppercase mb-1 text-sm" style={{ textShadow: '0 0 20px rgba(255,200,0,0.3)' }}>Juegos</h5>
            <FooterLink>Cajas Misteriosas</FooterLink>
            <FooterLink>Batallas de Cajas</FooterLink>
            <FooterLink>Mejoras (Upgrader)</FooterLink>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="font-display text-white uppercase mb-1 text-sm" style={{ textShadow: '0 0 20px rgba(255,200,0,0.3)' }}>Ayuda</h5>
            <FooterLink>Soporte 24/7</FooterLink>
            <FooterLink>Preguntas Frecuentes</FooterLink>
            <FooterLink>Provably Fair</FooterLink>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-[#1e2330]/50 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#FFC800]/20 to-transparent"></div>
          <p className="font-display text-slate-600 text-xs uppercase tracking-wider">
            &copy; 2025 LOOTEA MÉXICO. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div 
      className="p-6 rounded-2xl relative overflow-hidden group transition-all hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC800] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity"></div>
      
      {/* Icon with metallic gold */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-black mb-4 relative"
        style={{
          background: 'linear-gradient(135deg, #FFE566 0%, #FFC800 50%, #E6A800 100%)',
          boxShadow: '0 4px 15px rgba(255,200,0,0.3)',
        }}
      >
        <div className="absolute inset-0 rounded-xl opacity-40" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)' }}></div>
        <div className="relative">{icon}</div>
      </div>
      <h3 className="font-display text-white text-base mb-2 uppercase">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function PaymentIcon({ label }: { label: string }) {
  return (
    <div 
      className="h-9 px-4 rounded-lg flex items-center justify-center text-[10px] font-display text-slate-400 select-none uppercase transition-all hover:text-[#FFC800] hover:border-[#FFC800]/30"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {label}
    </div>
  )
}

function FooterLink({ children }: { children?: React.ReactNode }) {
  return (
    <a href="#" className="text-slate-500 hover:text-[#FFC800] text-sm transition-colors group flex items-center gap-1">
      <span className="w-0 group-hover:w-2 h-[1px] bg-[#FFC800] transition-all"></span>
      {children}
    </a>
  )
}

function SocialButton({ icon }: { icon: React.ReactNode }) {
  return (
    <a 
      href="#" 
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-slate-500 hover:text-black relative overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #FFE566 0%, #FFC800 50%, #E6A800 100%)' }}
      ></div>
      <div className="relative z-10">{icon}</div>
    </a>
  )
}

export default memo(Footer);