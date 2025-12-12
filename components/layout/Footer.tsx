/**
 * Footer - Stake style exact
 * Multi-column layout with social icons
 */

import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const Icons = {
  Blog: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  ),
  Discord: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  ),
  Facebook: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Instagram: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  YouTube: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
};

function Footer() {
  return (
    <footer className="bg-[#0f212e] border-t border-[#2f4553]" style={{ fontFamily: "'Proxima Nova', 'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        
        {/* Links Grid - 6 columns like Stake */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Cajas */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Cajas</h5>
            <div className="flex flex-col gap-2">
              <FooterLink to="/">Mystery Boxes</FooterLink>
              <FooterLink to="/">Apple</FooterLink>
              <FooterLink to="/">Amazon</FooterLink>
              <FooterLink to="/">Android</FooterLink>
              <FooterLink to="/">Deluxe</FooterLink>
            </div>
          </div>

          {/* Cuenta */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Cuenta</h5>
            <div className="flex flex-col gap-2">
              <FooterLink to="/deposit">Depositar</FooterLink>
              <FooterLink to="/inventory">Inventario</FooterLink>
              <FooterLink to="/profile">Mi Perfil</FooterLink>
              <FooterLink to="/rewards">Recompensas</FooterLink>
            </div>
          </div>

          {/* Soporte */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Soporte</h5>
            <div className="flex flex-col gap-2">
              <FooterLink to="/faq">Centro de Ayuda</FooterLink>
              <FooterLink to="/provably-fair">Provably Fair</FooterLink>
              <FooterLink to="/faq">Juego Responsable</FooterLink>
              <FooterLink to="/faq">Soporte en Vivo</FooterLink>
            </div>
          </div>

          {/* Nosotros */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Nosotros</h5>
            <div className="flex flex-col gap-2">
              <FooterLink to="/privacidad">Privacidad</FooterLink>
              <FooterLink to="/aml">Politica AML</FooterLink>
              <FooterLink to="/terminos">Terminos de Servicio</FooterLink>
            </div>
          </div>

          {/* Pagos */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Pagos</h5>
            <div className="flex flex-col gap-2">
              <FooterLink to="/deposit">Depositos</FooterLink>
              <FooterLink to="/profile">Retiros</FooterLink>
              <FooterLink to="/faq">Metodos de Pago</FooterLink>
              <FooterLink to="/faq">Crypto</FooterLink>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4">FAQ</h5>
            <div className="flex flex-col gap-2">
              <FooterLink to="/faq">Como Jugar</FooterLink>
              <FooterLink to="/faq">Probabilidades</FooterLink>
              <FooterLink to="/envios">Envios</FooterLink>
              <FooterLink to="/faq">Guia VIP</FooterLink>
            </div>
          </div>
        </div>

        {/* Social Icons - centered */}
        <div className="flex justify-center gap-4 mb-10">
          <SocialIcon icon={<Icons.Blog />} href="#" />
          <SocialIcon icon={<Icons.Discord />} href="#" />
          <SocialIcon icon={<Icons.Facebook />} href="#" />
          <SocialIcon icon={<Icons.X />} href="#" />
          <SocialIcon icon={<Icons.Instagram />} href="#" />
          <SocialIcon icon={<Icons.YouTube />} href="#" />
        </div>

        {/* Divider */}
        <div className="border-t border-[#2f4553] pt-8">
          
          {/* Copyright */}
          <p className="text-[#b1bad3] text-sm mb-4">
            © 2025 Lootea.mx | Todos los derechos reservados.
          </p>
          
          {/* Legal text */}
          <p className="text-[#5f6c7b] text-xs leading-relaxed mb-4">
            Lootea es operado por Lootea México S.A. de C.V. Los premios mostrados son ilustrativos. 
            Las probabilidades de cada caja están disponibles antes de jugar. 
            Contacto: soporte@lootea.mx
          </p>
          
          <p className="text-[#5f6c7b] text-xs leading-relaxed">
            Lootea promueve el juego responsable. Si necesitas ayuda, visita{' '}
            <a href="https://www.jugarbien.es" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#b1bad3]">
              jugarbien.es
            </a>
          </p>
          
          {/* Currency conversion */}
          <div className="mt-6 text-right">
            <span className="text-[#5f6c7b] text-xs">1 MXN = $0.06 USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ children, to }: { children: React.ReactNode; to: string }) {
  return (
    <Link to={to} className="text-[#b1bad3] hover:text-white text-sm transition-colors">
      {children}
    </Link>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#b1bad3] hover:text-white transition-colors"
    >
      {icon}
    </a>
  );
}

export default memo(Footer);
