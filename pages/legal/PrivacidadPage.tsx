/**
 * PrivacidadPage - Política de Privacidad
 * 
 * Cumplimiento con LFPDPPP (Ley Federal de Protección de Datos Personales
 * en Posesión de los Particulares) de México
 */

import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const PrivacidadPage: React.FC = () => {
  return (
    <LegalLayout title="Politica de Privacidad" lastUpdated="4 de Diciembre, 2025">
      <p>
        En <strong>Lootea</strong>, nos comprometemos a proteger tu privacidad y datos 
        personales. Esta politica describe como recopilamos, usamos, almacenamos y 
        protegemos tu informacion de acuerdo con la Ley Federal de Proteccion de 
        Datos Personales en Posesion de los Particulares (LFPDPPP).
      </p>

      <div className="highlight-box">
        <p>
          <strong>Responsable:</strong> Lootea Mexico S.A. de C.V., con domicilio en 
          Ciudad de Mexico, Mexico, es responsable del tratamiento de tus datos personales.
        </p>
      </div>

      <h2>1. Datos que Recopilamos</h2>
      
      <h3>1.1 Datos de Identificacion</h3>
      <ul>
        <li>Nombre completo</li>
        <li>Fecha de nacimiento</li>
        <li>Correo electronico</li>
        <li>Numero de telefono</li>
        <li>Direccion de envio</li>
        <li>Identificacion oficial (para verificacion KYC)</li>
      </ul>

      <h3>1.2 Datos Financieros</h3>
      <ul>
        <li>Informacion de tarjetas de pago (procesada por proveedores certificados PCI-DSS)</li>
        <li>Historial de transacciones</li>
        <li>Direcciones de criptomonedas</li>
      </ul>

      <h3>1.3 Datos de Uso</h3>
      <ul>
        <li>Direccion IP</li>
        <li>Tipo de dispositivo y navegador</li>
        <li>Paginas visitadas y tiempo de sesion</li>
        <li>Historial de juego</li>
        <li>Preferencias de usuario</li>
      </ul>

      <h2>2. Finalidades del Tratamiento</h2>
      <p>Utilizamos tus datos personales para:</p>
      
      <h3>2.1 Finalidades Primarias (Necesarias)</h3>
      <ul>
        <li>Crear y administrar tu cuenta</li>
        <li>Procesar transacciones y pagos</li>
        <li>Enviar productos ganados</li>
        <li>Verificar tu identidad (KYC/AML)</li>
        <li>Proporcionar soporte al cliente</li>
        <li>Cumplir con obligaciones legales</li>
      </ul>

      <h3>2.2 Finalidades Secundarias (Opcionales)</h3>
      <ul>
        <li>Enviar promociones y ofertas personalizadas</li>
        <li>Realizar encuestas de satisfaccion</li>
        <li>Mejorar nuestros servicios mediante analisis</li>
        <li>Personalizar tu experiencia en la plataforma</li>
      </ul>

      <div className="info-box">
        <p>
          Puedes oponerte a las finalidades secundarias en cualquier momento 
          enviando un correo a privacidad@lootea.mx
        </p>
      </div>

      <h2>3. Cookies y Tecnologias de Rastreo</h2>
      <p>Utilizamos cookies y tecnologias similares para:</p>
      
      <table>
        <thead>
          <tr>
            <th>Tipo de Cookie</th>
            <th>Proposito</th>
            <th>Duracion</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Esenciales</strong></td>
            <td>Funcionamiento basico, autenticacion, seguridad</td>
            <td>Sesion</td>
          </tr>
          <tr>
            <td><strong>Funcionales</strong></td>
            <td>Recordar preferencias, idioma, configuracion</td>
            <td>1 ano</td>
          </tr>
          <tr>
            <td><strong>Analiticas</strong></td>
            <td>Estadisticas de uso, mejora del servicio</td>
            <td>2 anos</td>
          </tr>
          <tr>
            <td><strong>Marketing</strong></td>
            <td>Publicidad personalizada (con consentimiento)</td>
            <td>90 dias</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Comparticion de Datos</h2>
      <p>Podemos compartir tus datos con:</p>
      <ul>
        <li><strong>Procesadores de pago:</strong> Para completar transacciones (Stripe, Conekta)</li>
        <li><strong>Servicios de envio:</strong> Para entregar productos (DHL, FedEx, Estafeta)</li>
        <li><strong>Proveedores de verificacion:</strong> Para cumplir con KYC/AML</li>
        <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
        <li><strong>Servicios de analisis:</strong> De forma anonimizada</li>
      </ul>

      <div className="warning-box">
        <p>
          <strong>Nunca vendemos tus datos personales a terceros.</strong> Solo compartimos 
          informacion necesaria para proporcionar nuestros servicios.
        </p>
      </div>

      <h2>5. Derechos ARCO</h2>
      <p>
        De acuerdo con la LFPDPPP, tienes derecho a:
      </p>
      <ul>
        <li><strong>Acceso:</strong> Conocer que datos tenemos sobre ti</li>
        <li><strong>Rectificacion:</strong> Corregir datos inexactos o incompletos</li>
        <li><strong>Cancelacion:</strong> Solicitar la eliminacion de tus datos</li>
        <li><strong>Oposicion:</strong> Oponerte al tratamiento de tus datos</li>
      </ul>

      <h3>Como Ejercer tus Derechos</h3>
      <p>
        Para ejercer tus derechos ARCO, envia una solicitud a <strong>privacidad@lootea.mx</strong> 
        incluyendo:
      </p>
      <ol>
        <li>Nombre completo y correo electronico de tu cuenta</li>
        <li>Descripcion clara de tu solicitud</li>
        <li>Copia de identificacion oficial</li>
        <li>Documento que acredite representacion (si aplica)</li>
      </ol>
      <p>
        Responderemos en un plazo maximo de 20 dias habiles.
      </p>

      <h2>6. Seguridad de Datos</h2>
      <p>Implementamos medidas de seguridad tecnicas y organizativas:</p>
      <ul>
        <li>Encriptacion SSL/TLS en todas las comunicaciones</li>
        <li>Almacenamiento encriptado de datos sensibles</li>
        <li>Acceso restringido basado en roles</li>
        <li>Monitoreo continuo de seguridad</li>
        <li>Auditorias periodicas de seguridad</li>
        <li>Capacitacion del personal en proteccion de datos</li>
      </ul>

      <h2>7. Retencion de Datos</h2>
      <p>Conservamos tus datos personales durante:</p>
      <table>
        <thead>
          <tr>
            <th>Tipo de Dato</th>
            <th>Periodo de Retencion</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Datos de cuenta</td>
            <td>Mientras la cuenta este activa + 5 anos</td>
          </tr>
          <tr>
            <td>Transacciones</td>
            <td>10 anos (requisito fiscal)</td>
          </tr>
          <tr>
            <td>Documentos KYC</td>
            <td>10 anos (requisito AML)</td>
          </tr>
          <tr>
            <td>Logs de actividad</td>
            <td>2 anos</td>
          </tr>
          <tr>
            <td>Comunicaciones de soporte</td>
            <td>3 anos</td>
          </tr>
        </tbody>
      </table>

      <h2>8. Transferencias Internacionales</h2>
      <p>
        Algunos de nuestros proveedores de servicios pueden estar ubicados fuera de Mexico. 
        En estos casos, nos aseguramos de que existan garantias adecuadas para la 
        proteccion de tus datos, incluyendo clausulas contractuales tipo y 
        certificaciones de privacidad.
      </p>

      <h2>9. Menores de Edad</h2>
      <p>
        Lootea no esta dirigido a menores de 18 anos. No recopilamos intencionalmente 
        datos de menores. Si descubrimos que hemos recopilado datos de un menor, 
        los eliminaremos inmediatamente.
      </p>

      <h2>10. Cambios a esta Politica</h2>
      <p>
        Podemos actualizar esta politica periodicamente. Te notificaremos sobre 
        cambios significativos por correo electronico o mediante un aviso en la 
        plataforma. La fecha de ultima actualizacion se indica al inicio de este documento.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para cualquier consulta sobre privacidad o proteccion de datos:
      </p>
      <ul>
        <li><strong>Email:</strong> privacidad@lootea.mx</li>
        <li><strong>Oficial de Privacidad:</strong> dpo@lootea.mx</li>
        <li><strong>Direccion:</strong> Ciudad de Mexico, Mexico</li>
      </ul>

      <div className="info-box">
        <p>
          Si consideras que tus derechos no han sido respetados, puedes presentar 
          una queja ante el INAI (Instituto Nacional de Transparencia, Acceso a la 
          Informacion y Proteccion de Datos Personales).
        </p>
      </div>
    </LegalLayout>
  );
};

export default PrivacidadPage;
