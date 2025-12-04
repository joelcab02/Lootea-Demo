/**
 * TerminosPage - Términos de Servicio
 * 
 * Contenido legal que cubre:
 * - Elegibilidad y restricciones de edad
 * - Naturaleza del servicio
 * - Reglas de uso
 * - Propiedad intelectual
 * - Limitación de responsabilidad
 */

import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const TerminosPage: React.FC = () => {
  return (
    <LegalLayout title="Terminos de Servicio" lastUpdated="4 de Diciembre, 2025">
      <p>
        Bienvenido a <strong>Lootea</strong>. Al acceder y utilizar nuestra plataforma, 
        aceptas cumplir con estos Terminos de Servicio. Por favor, leelos detenidamente 
        antes de usar nuestros servicios.
      </p>

      <div className="highlight-box">
        <p>
          <strong>Importante:</strong> Lootea es una plataforma de entretenimiento con 
          cajas misteriosas que contienen productos fisicos verificados. No somos un 
          casino ni ofrecemos apuestas tradicionales.
        </p>
      </div>

      <h2>1. Elegibilidad</h2>
      <p>Para utilizar Lootea, debes cumplir con los siguientes requisitos:</p>
      <ul>
        <li>Tener al menos <strong>18 anos de edad</strong></li>
        <li>Ser residente de Mexico o tener capacidad legal para usar el servicio en tu jurisdiccion</li>
        <li>No estar en la lista de personas prohibidas o sancionadas</li>
        <li>Proporcionar informacion veraz y actualizada durante el registro</li>
      </ul>

      <div className="warning-box">
        <p>
          Nos reservamos el derecho de solicitar verificacion de identidad en cualquier 
          momento. El incumplimiento puede resultar en la suspension de tu cuenta.
        </p>
      </div>

      <h2>2. Descripcion del Servicio</h2>
      <p>
        Lootea ofrece una experiencia de entretenimiento basada en cajas misteriosas 
        (Mystery Boxes) que contienen productos fisicos de marcas reconocidas. 
        Nuestro servicio incluye:
      </p>
      <ul>
        <li><strong>Cajas Misteriosas:</strong> Cada caja contiene una seleccion de productos con probabilidades publicadas y verificables</li>
        <li><strong>Sistema Provably Fair:</strong> Algoritmo de probabilidad verificable que garantiza resultados justos</li>
        <li><strong>Productos Autenticos:</strong> Todos los items son 100% originales, verificados por StockX y retailers oficiales</li>
        <li><strong>Intercambio por Saldo:</strong> Opcion de convertir premios en saldo de cuenta sin comisiones</li>
        <li><strong>Envio a Domicilio:</strong> Entrega gratuita en todo Mexico para productos fisicos</li>
      </ul>

      <h2>3. Cuenta de Usuario</h2>
      <h3>3.1 Registro</h3>
      <p>
        Para acceder a todas las funciones de Lootea, necesitas crear una cuenta. 
        Al registrarte, te comprometes a:
      </p>
      <ul>
        <li>Proporcionar informacion precisa y completa</li>
        <li>Mantener la confidencialidad de tus credenciales</li>
        <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
        <li>No crear multiples cuentas</li>
      </ul>

      <h3>3.2 Saldo de Cuenta</h3>
      <p>
        Tu saldo en Lootea representa creditos para usar en la plataforma. 
        El saldo no es dinero real y no puede ser retirado directamente como efectivo, 
        pero puede usarse para:
      </p>
      <ul>
        <li>Abrir cajas misteriosas</li>
        <li>Participar en batallas de cajas</li>
        <li>Usar el Upgrader</li>
      </ul>

      <h2>4. Compras y Pagos</h2>
      <h3>4.1 Metodos de Pago</h3>
      <p>Aceptamos los siguientes metodos de pago:</p>
      <ul>
        <li>Tarjetas de credito y debito (Visa, Mastercard)</li>
        <li>OXXO Pay</li>
        <li>Transferencia SPEI</li>
        <li>Criptomonedas (Bitcoin, USDT)</li>
      </ul>

      <h3>4.2 Precios</h3>
      <p>
        Todos los precios estan expresados en Pesos Mexicanos (MXN) e incluyen IVA. 
        Nos reservamos el derecho de modificar precios sin previo aviso.
      </p>

      <h2>5. Probabilidades y Resultados</h2>
      <p>
        Las probabilidades de cada item en nuestras cajas son publicas y verificables. 
        Utilizamos un sistema <strong>Provably Fair</strong> que permite a los usuarios 
        verificar la legitimidad de cada resultado.
      </p>
      <ul>
        <li>Las probabilidades se muestran antes de cada apertura</li>
        <li>Los resultados son generados por un algoritmo criptografico verificable</li>
        <li>No manipulamos resultados bajo ninguna circunstancia</li>
        <li>Puedes verificar cualquier resultado usando nuestra herramienta de verificacion</li>
      </ul>

      <h2>6. Envios y Entregas</h2>
      <p>
        Los productos ganados pueden ser enviados a tu domicilio o intercambiados por saldo. 
        Para envios:
      </p>
      <ul>
        <li>Envio gratuito a todo Mexico</li>
        <li>Tiempo estimado de entrega: 5-10 dias habiles</li>
        <li>Seguimiento en tiempo real disponible</li>
        <li>Seguro incluido en todos los envios</li>
      </ul>

      <h2>7. Conducta del Usuario</h2>
      <p>Al usar Lootea, te comprometes a NO:</p>
      <ul>
        <li>Usar la plataforma para actividades ilegales</li>
        <li>Intentar manipular o hackear el sistema</li>
        <li>Crear multiples cuentas para obtener ventajas</li>
        <li>Usar bots o software automatizado</li>
        <li>Acosar a otros usuarios o al personal de soporte</li>
        <li>Proporcionar informacion falsa</li>
      </ul>

      <h2>8. Propiedad Intelectual</h2>
      <p>
        Todo el contenido de Lootea, incluyendo pero no limitado a logos, disenos, 
        textos, graficos, software y codigo, es propiedad de Lootea Mexico o sus 
        licenciantes y esta protegido por leyes de propiedad intelectual.
      </p>

      <h2>9. Limitacion de Responsabilidad</h2>
      <p>
        Lootea proporciona el servicio "tal cual" y no garantiza resultados especificos. 
        No somos responsables por:
      </p>
      <ul>
        <li>Perdidas derivadas del uso de la plataforma</li>
        <li>Interrupciones del servicio por causas ajenas a nuestro control</li>
        <li>Danos indirectos o consecuentes</li>
        <li>Acciones de terceros</li>
      </ul>

      <h2>10. Suspension y Terminacion</h2>
      <p>
        Nos reservamos el derecho de suspender o terminar tu cuenta si:
      </p>
      <ul>
        <li>Violas estos terminos de servicio</li>
        <li>Proporcionas informacion falsa</li>
        <li>Participas en actividades fraudulentas</li>
        <li>No completas la verificacion de identidad cuando se solicita</li>
      </ul>

      <h2>11. Modificaciones</h2>
      <p>
        Podemos modificar estos terminos en cualquier momento. Los cambios seran 
        efectivos al publicarse en la plataforma. El uso continuado del servicio 
        despues de cambios constituye aceptacion de los nuevos terminos.
      </p>

      <h2>12. Ley Aplicable</h2>
      <p>
        Estos terminos se rigen por las leyes de los Estados Unidos Mexicanos. 
        Cualquier disputa sera resuelta en los tribunales competentes de la 
        Ciudad de Mexico.
      </p>

      <h2>13. Contacto</h2>
      <p>
        Para preguntas sobre estos terminos, contactanos en:
      </p>
      <ul>
        <li><strong>Email:</strong> legal@lootea.mx</li>
        <li><strong>Soporte:</strong> soporte@lootea.mx</li>
      </ul>

      <div className="info-box">
        <p>
          Al crear una cuenta o usar nuestros servicios, confirmas que has leido, 
          entendido y aceptado estos Terminos de Servicio.
        </p>
      </div>
    </LegalLayout>
  );
};

export default TerminosPage;
