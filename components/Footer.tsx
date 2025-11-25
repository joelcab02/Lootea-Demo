import React, { memo } from 'react';

const Icons = {
    ShieldCheck: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
    RefreshCW: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
    Truck: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
    Logo: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFC800" stroke="none"><path d="M2 9l10-5 10 5v10l-10 5-10-5V9z" /></svg>,
    Social: {
        X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>,
        Insta: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
        Face: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>,
    }
};

function Footer() {
  return (
    <footer className="bg-[#0a0c10] border-t border-[#1e2330] pt-12 pb-8">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6">
            
            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

            {/* Payment Methods */}
            <div className="bg-[#13151b] border border-[#1e2330] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFC800] rounded-lg flex items-center justify-center text-black">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-white uppercase tracking-tight">Métodos de Pago</h4>
                        <p className="text-slate-500 text-xs">Seguros y Encriptados</p>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
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
                    <div className="flex items-center gap-2 mb-4">
                        <Icons.Logo />
                        <span className="text-2xl font-black italic text-white tracking-tighter">LOOTEA</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
                        La experiencia premium de Mystery Boxes en México. Abre cajas con probabilidad justa verificable y gana productos reales.
                    </p>
                    <div className="flex gap-3">
                        <SocialButton icon={<Icons.Social.X />} />
                        <SocialButton icon={<Icons.Social.Insta />} />
                        <SocialButton icon={<Icons.Social.Face />} />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h5 className="font-bold text-white uppercase mb-1 tracking-tight">Legal</h5>
                    <FooterLink>Términos de Servicio</FooterLink>
                    <FooterLink>Privacidad</FooterLink>
                    <FooterLink>Política AML</FooterLink>
                    <FooterLink>Envíos y Devoluciones</FooterLink>
                </div>

                <div className="flex flex-col gap-3">
                    <h5 className="font-bold text-white uppercase mb-1 tracking-tight">Juegos</h5>
                    <FooterLink>Cajas Misteriosas</FooterLink>
                    <FooterLink>Batallas de Cajas</FooterLink>
                    <FooterLink>Mejoras (Upgrader)</FooterLink>
                </div>

                <div className="flex flex-col gap-3">
                    <h5 className="font-bold text-white uppercase mb-1 tracking-tight">Ayuda</h5>
                    <FooterLink>Soporte 24/7</FooterLink>
                    <FooterLink>Preguntas Frecuentes</FooterLink>
                    <FooterLink>Provably Fair</FooterLink>
                </div>
            </div>

            <div className="text-center pt-8 border-t border-[#1e2330]">
                <p className="text-slate-600 text-xs font-black italic uppercase tracking-tighter">
                    &copy; 2025 LOOTEA MÉXICO. TODOS LOS DERECHOS RESERVADOS.
                </p>
            </div>
        </div>
    </footer>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-[#13151b] border border-[#1e2330] p-6 rounded-2xl">
            <div className="w-12 h-12 bg-[#FFC800] rounded-xl flex items-center justify-center text-black mb-4 shadow-[0_0_15px_rgba(255,200,0,0.2)]">
                {icon}
            </div>
            <h3 className="text-white font-black italic text-lg mb-2 tracking-tighter">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}

function PaymentIcon({ label }: { label: string }) {
    return (
        <div className="h-10 px-4 bg-[#1e2330] rounded border border-[#2a3040] flex items-center justify-center text-[10px] font-black italic text-slate-400 select-none tracking-tighter">
            {label}
        </div>
    )
}

function FooterLink({ children }: { children?: React.ReactNode }) {
    return (
        <a href="#" className="text-slate-500 hover:text-[#FFC800] text-sm transition-colors font-medium">
            {children}
        </a>
    )
}

function SocialButton({ icon }: { icon: React.ReactNode }) {
    return (
        <a href="#" className="w-10 h-10 bg-[#1e2330] hover:bg-[#FFC800] hover:text-black text-slate-400 rounded-lg flex items-center justify-center transition-all">
            {icon}
        </a>
    )
}

export default memo(Footer);