/**
 * FAQPage - Preguntas Frecuentes
 * 
 * Organizado por categorías:
 * - Cuenta y Registro
 * - Pagos y Saldo
 * - Juego y Cajas
 * - Envíos y Premios
 * - Seguridad
 */

import React, { useState } from 'react';
import LegalLayout from '../../layouts/LegalLayout';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-[#2f4553] last:border-0">
      <button
        onClick={onClick}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <span className={`font-medium transition-colors ${isOpen ? 'text-[#3b82f6]' : 'text-white group-hover:text-[#3b82f6]'}`}>
          {question}
        </span>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`text-[#5f6c7b] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-[#b1bad3] leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: { question: string; answer: React.ReactNode }[];
}

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories: FAQCategory[] = [
    {
      title: "Cuenta y Registro",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      items: [
        {
          question: "Como creo una cuenta en Lootea?",
          answer: (
            <>
              <p>Crear una cuenta es rapido y sencillo:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Haz clic en "Crear Cuenta" en la esquina superior derecha</li>
                <li>Ingresa tu correo electronico y crea una contrasena</li>
                <li>Verifica tu correo haciendo clic en el enlace que te enviamos</li>
                <li>Listo! Ya puedes empezar a jugar</li>
              </ol>
            </>
          )
        },
        {
          question: "Cual es la edad minima para usar Lootea?",
          answer: "Debes tener al menos 18 anos de edad para crear una cuenta y usar nuestros servicios. Nos reservamos el derecho de solicitar verificacion de edad en cualquier momento."
        },
        {
          question: "Olvide mi contrasena, como la recupero?",
          answer: (
            <>
              <p>Para recuperar tu contrasena:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Haz clic en "Entrar" y luego en "Olvide mi contrasena"</li>
                <li>Ingresa el correo asociado a tu cuenta</li>
                <li>Revisa tu bandeja de entrada (y spam) para el enlace de recuperacion</li>
                <li>Crea una nueva contrasena segura</li>
              </ol>
            </>
          )
        },
        {
          question: "Puedo tener mas de una cuenta?",
          answer: "No. Cada usuario puede tener solo una cuenta. Las cuentas multiples seran suspendidas y cualquier saldo o premio sera confiscado. Si tienes problemas con tu cuenta, contacta a soporte."
        },
        {
          question: "Como verifico mi cuenta?",
          answer: (
            <>
              <p>La verificacion se realiza en niveles:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Basico:</strong> Solo necesitas verificar tu email</li>
                <li><strong>Intermedio:</strong> Sube tu INE/Pasaporte y una selfie</li>
                <li><strong>Completo:</strong> Agrega comprobante de domicilio</li>
              </ul>
              <p className="mt-2">Ve a "Mi Cuenta" - "Verificacion" para iniciar el proceso.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Pagos y Saldo",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      ),
      items: [
        {
          question: "Que metodos de pago aceptan?",
          answer: (
            <>
              <p>Aceptamos multiples metodos de pago:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Tarjetas:</strong> Visa, Mastercard (credito y debito)</li>
                <li><strong>Efectivo:</strong> OXXO Pay</li>
                <li><strong>Transferencia:</strong> SPEI</li>
                <li><strong>Cripto:</strong> Bitcoin (BTC), USDT (Tether)</li>
              </ul>
            </>
          )
        },
        {
          question: "Cuanto tiempo tarda en reflejarse mi deposito?",
          answer: (
            <>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Tarjeta:</strong> Instantaneo</li>
                <li><strong>OXXO:</strong> 15-30 minutos despues del pago</li>
                <li><strong>SPEI:</strong> 5-15 minutos</li>
                <li><strong>Cripto:</strong> Despues de 1-3 confirmaciones en la red</li>
              </ul>
            </>
          )
        },
        {
          question: "Hay comisiones por depositar?",
          answer: "No cobramos comisiones por depositos. Sin embargo, tu banco o procesador de pago podria aplicar cargos propios. Los depositos en cripto no tienen comision de nuestra parte, pero pagas el fee de la red."
        },
        {
          question: "Puedo retirar mi saldo como dinero?",
          answer: "El saldo en Lootea es para uso exclusivo en la plataforma y no puede retirarse como efectivo. Sin embargo, puedes usar tu saldo para abrir cajas y solicitar el envio de los productos que ganes."
        },
        {
          question: "Mi pago fue rechazado, que hago?",
          answer: (
            <>
              <p>Si tu pago fue rechazado:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Verifica que los datos de tu tarjeta sean correctos</li>
                <li>Asegurate de tener fondos suficientes</li>
                <li>Contacta a tu banco para verificar que no hayan bloqueado la transaccion</li>
                <li>Intenta con otro metodo de pago</li>
                <li>Si el problema persiste, contacta a soporte</li>
              </ol>
            </>
          )
        }
      ]
    },
    {
      title: "Juego y Cajas",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
      ),
      items: [
        {
          question: "Como funcionan las cajas misteriosas?",
          answer: (
            <>
              <p>Las cajas misteriosas contienen productos reales con probabilidades publicadas:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Elige una caja que te interese</li>
                <li>Revisa los items y sus probabilidades</li>
                <li>Paga el precio de la caja</li>
                <li>El sistema selecciona aleatoriamente tu premio</li>
                <li>Puedes solicitar el envio o intercambiar por saldo</li>
              </ol>
            </>
          )
        },
        {
          question: "Las probabilidades son reales?",
          answer: "Si, 100%. Usamos un sistema Provably Fair que te permite verificar matematicamente cada resultado. Las probabilidades mostradas son exactas y no pueden ser manipuladas. Puedes verificar cualquier apertura en tu historial."
        },
        {
          question: "Que es el modo Demo?",
          answer: "El modo Demo te permite probar las cajas sin gastar dinero real. Los resultados son simulados y no puedes ganar premios reales, pero es perfecto para conocer como funciona la plataforma antes de jugar."
        },
        {
          question: "Que son las Batallas de Cajas?",
          answer: "Las Batallas son competencias donde varios jugadores abren la misma caja simultaneamente. El jugador con el item de mayor valor gana todos los premios. Es una forma emocionante de multiplicar tus ganancias."
        },
        {
          question: "Que es el Upgrader?",
          answer: "El Upgrader te permite apostar un item de tu inventario por la oportunidad de ganar uno de mayor valor. Eliges el multiplicador y si ganas, obtienes el item mejorado. Si pierdes, pierdes tu item original."
        },
        {
          question: "Puedo cancelar una apertura?",
          answer: "No. Una vez que inicias la apertura de una caja, el proceso no puede cancelarse y el resultado es final. Asegurate de querer abrir la caja antes de hacer clic."
        }
      ]
    },
    {
      title: "Envios y Premios",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ),
      items: [
        {
          question: "Como solicito el envio de mi premio?",
          answer: (
            <>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Ve a tu Inventario en "Mi Cuenta"</li>
                <li>Selecciona el item que quieres recibir</li>
                <li>Haz clic en "Solicitar Envio"</li>
                <li>Confirma tu direccion de envio</li>
                <li>Recibiras un correo con el numero de seguimiento</li>
              </ol>
            </>
          )
        },
        {
          question: "Cuanto cuesta el envio?",
          answer: "El envio es GRATIS a todo Mexico. No importa el valor del producto ni tu ubicacion, nosotros cubrimos el costo del envio."
        },
        {
          question: "Cuanto tarda en llegar mi premio?",
          answer: (
            <>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>CDMX:</strong> 3-5 dias habiles</li>
                <li><strong>Ciudades principales:</strong> 5-7 dias habiles</li>
                <li><strong>Resto del pais:</strong> 7-10 dias habiles</li>
                <li><strong>Zonas remotas:</strong> 10-15 dias habiles</li>
              </ul>
            </>
          )
        },
        {
          question: "Que es el intercambio por saldo?",
          answer: "En lugar de recibir el producto fisico, puedes convertirlo instantaneamente en saldo para seguir jugando. El valor de intercambio se muestra antes de confirmar. Es irreversible una vez confirmado."
        },
        {
          question: "Los productos son originales?",
          answer: "Si, 100% autenticos. Todos nuestros productos son verificados por StockX y provienen de retailers oficiales. Cada item incluye certificado de autenticidad cuando aplica."
        },
        {
          question: "Que pasa si mi producto llega danado?",
          answer: "Contacta a soporte dentro de 7 dias con fotos del dano. Evaluaremos tu caso y te ofreceremos un reemplazo o credito en tu cuenta. Conserva el empaque original."
        }
      ]
    },
    {
      title: "Seguridad",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      items: [
        {
          question: "Es seguro usar Lootea?",
          answer: "Si. Usamos encriptacion SSL/TLS en todas las comunicaciones, procesamos pagos a traves de proveedores certificados PCI-DSS, y nunca almacenamos datos completos de tarjetas. Tu informacion esta protegida."
        },
        {
          question: "Como protegen mis datos personales?",
          answer: "Cumplimos con la LFPDPPP (Ley de Proteccion de Datos de Mexico). Tus datos se almacenan encriptados, el acceso es restringido, y nunca vendemos tu informacion a terceros. Consulta nuestra Politica de Privacidad para mas detalles."
        },
        {
          question: "Que es la verificacion en dos pasos?",
          answer: "Es una capa adicional de seguridad. Ademas de tu contrasena, necesitas un codigo temporal de tu telefono para iniciar sesion. Puedes activarla en Configuracion - Seguridad."
        },
        {
          question: "Detectaron actividad sospechosa en mi cuenta, que hago?",
          answer: (
            <>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Cambia tu contrasena inmediatamente</li>
                <li>Activa la verificacion en dos pasos</li>
                <li>Revisa tu historial de actividad</li>
                <li>Contacta a soporte si ves transacciones que no reconoces</li>
              </ol>
            </>
          )
        },
        {
          question: "Lootea es legal en Mexico?",
          answer: "Si. Lootea opera como una plataforma de entretenimiento con productos fisicos, no como un casino tradicional. Cumplimos con todas las regulaciones aplicables incluyendo LFPIORPI (prevencion de lavado de dinero)."
        }
      ]
    }
  ];

  return (
    <LegalLayout title="Preguntas Frecuentes" lastUpdated="4 de Diciembre, 2025">
      <p>
        Encuentra respuestas a las preguntas mas comunes sobre <strong>Lootea</strong>. 
        Si no encuentras lo que buscas, no dudes en contactar a nuestro equipo de soporte.
      </p>

      <div className="highlight-box">
        <p>
          <strong>Soporte 24/7:</strong> Nuestro equipo esta disponible las 24 horas 
          para ayudarte. Escribe a soporte@lootea.mx o usa el chat en vivo.
        </p>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2 my-6">
        {categories.map((category, idx) => (
          <a
            key={idx}
            href={`#faq-${idx}`}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2c38] border border-[#2f4553] rounded-lg text-[#b1bad3] hover:text-white hover:border-[#3b82f6]/50 transition-all text-sm"
          >
            <span className="text-[#3b82f6]">{category.icon}</span>
            {category.title}
          </a>
        ))}
      </div>

      {/* FAQ Categories */}
      {categories.map((category, categoryIdx) => (
        <div key={categoryIdx} id={`faq-${categoryIdx}`} className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/25 flex items-center justify-center text-[#3b82f6]">
              {category.icon}
            </div>
            <h2 className="font-bold text-xl text-white m-0 border-0 p-0">
              {category.title}
            </h2>
          </div>
          
          <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl px-5">
            {category.items.map((item, itemIdx) => {
              const itemId = `${categoryIdx}-${itemIdx}`;
              return (
                <FAQItem
                  key={itemIdx}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openItems[itemId] || false}
                  onClick={() => toggleItem(itemId)}
                />
              );
            })}
          </div>
        </div>
      ))}

      <h2>Aun tienes dudas?</h2>
      <p>
        Nuestro equipo de soporte esta listo para ayudarte:
      </p>
      <ul>
        <li><strong>Email:</strong> soporte@lootea.mx</li>
        <li><strong>Chat en vivo:</strong> Disponible en la esquina inferior derecha</li>
        <li><strong>WhatsApp:</strong> +52 55 1234 5678</li>
        <li><strong>Discord:</strong> discord.gg/lootea</li>
        <li><strong>Horario:</strong> 24/7, los 365 dias del ano</li>
      </ul>
    </LegalLayout>
  );
};

export default FAQPage;
