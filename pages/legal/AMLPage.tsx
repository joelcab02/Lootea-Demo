/**
 * AMLPage - Política AML/KYC
 * 
 * Política de Prevención de Lavado de Dinero y
 * Conoce a Tu Cliente (Know Your Customer)
 */

import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const AMLPage: React.FC = () => {
  return (
    <LegalLayout title="Politica AML/KYC" lastUpdated="4 de Diciembre, 2025">
      <p>
        <strong>Lootea</strong> esta comprometido con la prevencion del lavado de dinero, 
        financiamiento al terrorismo y otras actividades financieras ilicitas. Esta 
        politica describe nuestros procedimientos de cumplimiento de acuerdo con las 
        leyes mexicanas aplicables.
      </p>

      <div className="highlight-box">
        <p>
          <strong>Marco Legal:</strong> Esta politica cumple con la Ley Federal para la 
          Prevencion e Identificacion de Operaciones con Recursos de Procedencia Ilicita 
          (LFPIORPI) y regulaciones de la UIF (Unidad de Inteligencia Financiera).
        </p>
      </div>

      <h2>1. Que es AML/KYC</h2>
      
      <h3>1.1 AML (Anti-Money Laundering)</h3>
      <p>
        Conjunto de procedimientos, leyes y regulaciones disenados para detener la 
        practica de generar ingresos a traves de acciones ilegales. El lavado de dinero 
        implica hacer que fondos obtenidos ilegalmente parezcan legitimos.
      </p>

      <h3>1.2 KYC (Know Your Customer)</h3>
      <p>
        Proceso de verificacion de identidad que nos permite conocer a nuestros usuarios, 
        evaluar riesgos potenciales y cumplir con requisitos regulatorios.
      </p>

      <h2>2. Verificacion de Identidad</h2>
      
      <h3>2.1 Niveles de Verificacion</h3>
      <table>
        <thead>
          <tr>
            <th>Nivel</th>
            <th>Requisitos</th>
            <th>Limites</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Basico</strong></td>
            <td>Email verificado, telefono</td>
            <td>Depositos hasta $5,000 MXN/mes</td>
          </tr>
          <tr>
            <td><strong>Intermedio</strong></td>
            <td>INE/Pasaporte, selfie</td>
            <td>Depositos hasta $50,000 MXN/mes</td>
          </tr>
          <tr>
            <td><strong>Completo</strong></td>
            <td>Comprobante de domicilio, origen de fondos</td>
            <td>Sin limite</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Documentos Aceptados</h3>
      <p><strong>Identificacion oficial:</strong></p>
      <ul>
        <li>INE/IFE vigente</li>
        <li>Pasaporte mexicano vigente</li>
        <li>Cedula profesional</li>
        <li>Licencia de conducir (solo como documento secundario)</li>
      </ul>

      <p><strong>Comprobante de domicilio (no mayor a 3 meses):</strong></p>
      <ul>
        <li>Recibo de luz (CFE)</li>
        <li>Recibo de agua</li>
        <li>Estado de cuenta bancario</li>
        <li>Recibo de telefono fijo o internet</li>
      </ul>

      <h3>2.3 Proceso de Verificacion</h3>
      <ol>
        <li>Sube los documentos requeridos en la seccion "Mi Cuenta"</li>
        <li>Toma una selfie sosteniendo tu identificacion</li>
        <li>Nuestro equipo revisara tu solicitud en 24-48 horas</li>
        <li>Recibiras una notificacion con el resultado</li>
      </ol>

      <div className="info-box">
        <p>
          La verificacion es un proceso unico. Una vez aprobado, no necesitas 
          repetirlo a menos que actualices tus documentos.
        </p>
      </div>

      <h2>3. Limites de Transaccion</h2>
      
      <h3>3.1 Depositos</h3>
      <table>
        <thead>
          <tr>
            <th>Metodo</th>
            <th>Minimo</th>
            <th>Maximo por transaccion</th>
            <th>Maximo mensual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tarjeta de credito/debito</td>
            <td>$100 MXN</td>
            <td>$20,000 MXN</td>
            <td>Segun nivel KYC</td>
          </tr>
          <tr>
            <td>OXXO</td>
            <td>$100 MXN</td>
            <td>$10,000 MXN</td>
            <td>Segun nivel KYC</td>
          </tr>
          <tr>
            <td>SPEI</td>
            <td>$100 MXN</td>
            <td>$100,000 MXN</td>
            <td>Segun nivel KYC</td>
          </tr>
          <tr>
            <td>Criptomonedas</td>
            <td>$500 MXN equiv.</td>
            <td>Sin limite</td>
            <td>Segun nivel KYC</td>
          </tr>
        </tbody>
      </table>

      <h3>3.2 Retiros/Envios</h3>
      <p>
        Para solicitar el envio de productos o conversion a saldo, debes tener 
        verificacion de nivel Intermedio como minimo.
      </p>

      <h2>4. Monitoreo de Transacciones</h2>
      <p>
        Implementamos sistemas automatizados para detectar actividades sospechosas:
      </p>
      <ul>
        <li>Patrones inusuales de deposito o juego</li>
        <li>Transacciones que exceden los limites establecidos</li>
        <li>Multiples cuentas desde la misma direccion IP</li>
        <li>Intentos de evadir verificacion</li>
        <li>Uso de VPN o proxies para ocultar ubicacion</li>
        <li>Transacciones con jurisdicciones de alto riesgo</li>
      </ul>

      <div className="warning-box">
        <p>
          Las actividades sospechosas seran reportadas a las autoridades competentes 
          segun lo requiere la ley mexicana.
        </p>
      </div>

      <h2>5. Origen de Fondos</h2>
      <p>
        Para depositos significativos o cuando sea requerido, podemos solicitar 
        documentacion sobre el origen de tus fondos:
      </p>
      <ul>
        <li>Recibos de nomina</li>
        <li>Declaraciones de impuestos</li>
        <li>Documentos de venta de propiedades</li>
        <li>Herencias documentadas</li>
        <li>Estados de cuenta que muestren el origen</li>
      </ul>

      <h2>6. Personas Politicamente Expuestas (PEPs)</h2>
      <p>
        Si eres o has sido una Persona Politicamente Expuesta, o tienes relacion 
        cercana con una, debes declararlo durante el proceso de verificacion. 
        Esto incluye:
      </p>
      <ul>
        <li>Funcionarios publicos de alto nivel</li>
        <li>Ejecutivos de empresas estatales</li>
        <li>Oficiales militares de alto rango</li>
        <li>Miembros de partidos politicos</li>
        <li>Familiares directos de los anteriores</li>
      </ul>

      <h2>7. Paises Restringidos</h2>
      <p>
        No aceptamos usuarios de paises sujetos a sanciones internacionales o 
        con alto riesgo de lavado de dinero, incluyendo pero no limitado a:
      </p>
      <ul>
        <li>Corea del Norte</li>
        <li>Iran</li>
        <li>Siria</li>
        <li>Cuba</li>
        <li>Crimea</li>
        <li>Paises en lista GAFI de alto riesgo</li>
      </ul>

      <h2>8. Reporte de Actividades Sospechosas</h2>
      <p>
        De acuerdo con la LFPIORPI, estamos obligados a reportar a la UIF:
      </p>
      <ul>
        <li>Operaciones relevantes que superen umbrales establecidos</li>
        <li>Operaciones inusuales que no tengan justificacion economica</li>
        <li>Operaciones preocupantes vinculadas a posibles delitos</li>
      </ul>

      <h2>9. Consecuencias del Incumplimiento</h2>
      <p>
        El incumplimiento de esta politica puede resultar en:
      </p>
      <ul>
        <li>Suspension temporal de la cuenta</li>
        <li>Retencion de fondos pendiente investigacion</li>
        <li>Cierre permanente de la cuenta</li>
        <li>Reporte a autoridades competentes</li>
        <li>Acciones legales si corresponde</li>
      </ul>

      <h2>10. Tus Responsabilidades</h2>
      <p>Como usuario de Lootea, te comprometes a:</p>
      <ul>
        <li>Proporcionar informacion veraz y actualizada</li>
        <li>Usar unicamente fondos de origen licito</li>
        <li>No permitir que terceros usen tu cuenta</li>
        <li>Notificar cambios en tu informacion personal</li>
        <li>Cooperar con solicitudes de verificacion</li>
      </ul>

      <h2>11. Proteccion de Datos en KYC</h2>
      <p>
        Los documentos y datos recopilados para verificacion KYC son tratados 
        con la maxima confidencialidad:
      </p>
      <ul>
        <li>Almacenamiento encriptado</li>
        <li>Acceso restringido solo a personal autorizado</li>
        <li>Retencion por el periodo legalmente requerido (10 anos)</li>
        <li>No compartimos con terceros excepto autoridades cuando sea requerido</li>
      </ul>

      <h2>12. Contacto</h2>
      <p>
        Para preguntas sobre verificacion o cumplimiento:
      </p>
      <ul>
        <li><strong>Email:</strong> compliance@lootea.mx</li>
        <li><strong>Soporte:</strong> soporte@lootea.mx</li>
      </ul>

      <div className="info-box">
        <p>
          Nuestro equipo de cumplimiento esta disponible para ayudarte con el 
          proceso de verificacion. No dudes en contactarnos si tienes dudas.
        </p>
      </div>
    </LegalLayout>
  );
};

export default AMLPage;
