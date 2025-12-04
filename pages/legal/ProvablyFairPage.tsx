/**
 * ProvablyFairPage - Sistema de Probabilidad Verificable
 * 
 * Explicación técnica del sistema Provably Fair:
 * - Cómo funciona el algoritmo
 * - Cómo verificar resultados
 * - Seeds y hashes
 * - Transparencia
 */

import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const ProvablyFairPage: React.FC = () => {
  return (
    <LegalLayout title="Provably Fair" lastUpdated="4 de Diciembre, 2025">
      <p>
        En <strong>Lootea</strong>, la transparencia y la justicia son fundamentales. 
        Nuestro sistema <strong>Provably Fair</strong> te permite verificar que cada 
        resultado es completamente aleatorio y no ha sido manipulado.
      </p>

      <div className="highlight-box">
        <p>
          <strong>Que significa Provably Fair?</strong> Es un sistema criptografico que 
          permite a los usuarios verificar matematicamente que los resultados son justos 
          y aleatorios, sin necesidad de confiar ciegamente en la plataforma.
        </p>
      </div>

      <h2>1. Como Funciona</h2>
      
      <h3>1.1 El Proceso en 4 Pasos</h3>
      <ol>
        <li>
          <strong>Server Seed (Semilla del Servidor):</strong> Antes de cada apertura, 
          generamos una semilla secreta y te mostramos su hash (huella digital encriptada).
        </li>
        <li>
          <strong>Client Seed (Tu Semilla):</strong> Tu proporcionas tu propia semilla 
          o usamos una generada automaticamente. Esta semilla es visible para ti.
        </li>
        <li>
          <strong>Combinacion:</strong> Ambas semillas se combinan usando un algoritmo 
          criptografico (SHA-256) para generar el resultado.
        </li>
        <li>
          <strong>Revelacion:</strong> Despues de la apertura, revelamos el Server Seed 
          original para que puedas verificar el resultado.
        </li>
      </ol>

      <h3>1.2 Por Que Es Justo</h3>
      <ul>
        <li>
          <strong>No podemos predecir tu semilla:</strong> Tu Client Seed es desconocido 
          para nosotros hasta que abres la caja.
        </li>
        <li>
          <strong>No podemos cambiar nuestra semilla:</strong> El hash del Server Seed 
          se muestra ANTES de la apertura. Cualquier cambio generaria un hash diferente.
        </li>
        <li>
          <strong>Verificable matematicamente:</strong> Puedes recalcular el resultado 
          usando las semillas y verificar que coincide.
        </li>
      </ul>

      <h2>2. Componentes del Sistema</h2>
      
      <h3>2.1 Server Seed</h3>
      <p>
        Una cadena aleatoria de 64 caracteres hexadecimales generada por nuestro servidor 
        usando un generador de numeros aleatorios criptograficamente seguro (CSPRNG).
      </p>
      <p><strong>Ejemplo:</strong></p>
      <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
        <code style={{ color: '#F7C948' }}>
          a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678
        </code>
      </pre>

      <h3>2.2 Server Seed Hash</h3>
      <p>
        El hash SHA-256 del Server Seed. Este hash se te muestra ANTES de abrir la caja. 
        Es imposible revertir el hash para obtener el seed original.
      </p>
      <p><strong>Ejemplo de hash:</strong></p>
      <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
        <code style={{ color: '#60a5fa' }}>
          e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        </code>
      </pre>

      <h3>2.3 Client Seed</h3>
      <p>
        Tu semilla personal. Puedes usar la generada automaticamente o crear la tuya propia. 
        Recomendamos cambiarla periodicamente.
      </p>

      <h3>2.4 Nonce</h3>
      <p>
        Un contador que incrementa con cada apertura. Esto asegura que incluso con las 
        mismas semillas, cada resultado sea diferente.
      </p>

      <h2>3. El Algoritmo</h2>
      
      <h3>3.1 Generacion del Resultado</h3>
      <p>El resultado se calcula de la siguiente manera:</p>
      <ol>
        <li>Concatenamos: <code>server_seed + client_seed + nonce</code></li>
        <li>Aplicamos SHA-256 para obtener un hash</li>
        <li>Tomamos los primeros 8 caracteres del hash</li>
        <li>Convertimos a numero decimal</li>
        <li>Dividimos entre el maximo posible para obtener un valor entre 0 y 1</li>
        <li>Multiplicamos por el total de probabilidades para determinar el item ganado</li>
      </ol>

      <h3>3.2 Ejemplo de Calculo</h3>
      <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
        <code style={{ color: '#94a3b8' }}>{`// Datos de entrada
server_seed = "a1b2c3d4..."
client_seed = "mi_semilla_personal"
nonce = 42

// Paso 1: Concatenar
combined = "a1b2c3d4...mi_semilla_personal42"

// Paso 2: Hash SHA-256
hash = SHA256(combined)
// Resultado: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"

// Paso 3: Tomar primeros 8 caracteres
hex_value = "7f83b165"

// Paso 4: Convertir a decimal
decimal = 2139701605

// Paso 5: Normalizar (dividir entre 0xFFFFFFFF)
roll = 2139701605 / 4294967295 = 0.4981...

// Paso 6: Determinar item basado en probabilidades
// Si la caja tiene items con probabilidades acumuladas:
// Item A: 0.00 - 0.50 (50%)
// Item B: 0.50 - 0.80 (30%)
// Item C: 0.80 - 1.00 (20%)
// Con roll = 0.4981, el resultado es Item A`}</code>
      </pre>

      <h2>4. Como Verificar tus Resultados</h2>
      
      <h3>4.1 Verificacion Manual</h3>
      <ol>
        <li>Ve a tu historial de aperturas</li>
        <li>Selecciona la apertura que deseas verificar</li>
        <li>Copia el Server Seed (revelado), Client Seed y Nonce</li>
        <li>Usa una herramienta SHA-256 online o nuestra calculadora</li>
        <li>Verifica que el resultado coincide</li>
      </ol>

      <h3>4.2 Nuestra Herramienta de Verificacion</h3>
      <p>
        Proporcionamos una herramienta integrada en la plataforma donde puedes:
      </p>
      <ul>
        <li>Ingresar las semillas y nonce</li>
        <li>Ver el calculo paso a paso</li>
        <li>Verificar que el resultado mostrado es correcto</li>
      </ul>

      <div className="info-box">
        <p>
          Puedes usar herramientas externas de terceros para verificar. El algoritmo 
          es estandar y cualquier calculadora SHA-256 dara el mismo resultado.
        </p>
      </div>

      <h2>5. Probabilidades de las Cajas</h2>
      
      <h3>5.1 Transparencia Total</h3>
      <p>
        Las probabilidades de cada item en cada caja son publicas y visibles antes 
        de abrir. Mostramos:
      </p>
      <ul>
        <li>Probabilidad exacta de cada item (porcentaje)</li>
        <li>Valor de mercado de cada item</li>
        <li>Rareza del item (Common, Rare, Epic, Legendary)</li>
      </ul>

      <h3>5.2 Ejemplo de Probabilidades</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Probabilidad</th>
            <th>Rango</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>iPhone 16 Pro</td>
            <td>1%</td>
            <td>0.00 - 0.01</td>
          </tr>
          <tr>
            <td>AirPods Pro</td>
            <td>5%</td>
            <td>0.01 - 0.06</td>
          </tr>
          <tr>
            <td>Apple Watch</td>
            <td>10%</td>
            <td>0.06 - 0.16</td>
          </tr>
          <tr>
            <td>Funda Premium</td>
            <td>34%</td>
            <td>0.16 - 0.50</td>
          </tr>
          <tr>
            <td>Accesorios</td>
            <td>50%</td>
            <td>0.50 - 1.00</td>
          </tr>
        </tbody>
      </table>

      <h2>6. Seguridad del Sistema</h2>
      
      <h3>6.1 Generacion de Semillas</h3>
      <ul>
        <li>Usamos CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)</li>
        <li>Las semillas se generan en servidores seguros aislados</li>
        <li>Cada semilla se usa una sola vez</li>
      </ul>

      <h3>6.2 Almacenamiento</h3>
      <ul>
        <li>Los Server Seeds se almacenan encriptados hasta su revelacion</li>
        <li>Los hashes se generan y muestran en tiempo real</li>
        <li>Todo el historial es inmutable y auditable</li>
      </ul>

      <h2>7. Preguntas Frecuentes</h2>
      
      <h3>Pueden manipular los resultados?</h3>
      <p>
        No. El hash del Server Seed se muestra ANTES de que proporciones tu Client Seed. 
        Cualquier cambio en el Server Seed generaria un hash diferente, lo cual seria 
        detectable al verificar.
      </p>

      <h3>Por que debo confiar en el hash?</h3>
      <p>
        SHA-256 es un algoritmo criptografico probado y usado mundialmente (incluyendo 
        Bitcoin). Es matematicamente imposible encontrar dos inputs diferentes que 
        generen el mismo hash.
      </p>

      <h3>Puedo cambiar mi Client Seed?</h3>
      <p>
        Si, puedes cambiarlo en cualquier momento desde tu configuracion de cuenta. 
        Recomendamos hacerlo periodicamente para mayor seguridad.
      </p>

      <h3>Que pasa si no verifico mis resultados?</h3>
      <p>
        El sistema funciona igual. La verificacion es opcional pero disponible para 
        cualquier usuario que desee comprobar la justicia de los resultados.
      </p>

      <h2>8. Auditorias Externas</h2>
      <p>
        Nuestro sistema Provably Fair ha sido auditado por terceros independientes. 
        Los reportes de auditoria estan disponibles bajo solicitud.
      </p>

      <h2>9. Recursos Adicionales</h2>
      <ul>
        <li><a href="#">Calculadora de Verificacion</a></li>
        <li><a href="#">Documentacion Tecnica Completa</a></li>
        <li><a href="#">Codigo Fuente del Algoritmo (GitHub)</a></li>
        <li><a href="#">Reportes de Auditoria</a></li>
      </ul>

      <h2>10. Contacto</h2>
      <p>
        Para preguntas tecnicas sobre Provably Fair:
      </p>
      <ul>
        <li><strong>Email:</strong> tech@lootea.mx</li>
        <li><strong>Discord:</strong> discord.gg/lootea</li>
      </ul>

      <div className="highlight-box">
        <p>
          <strong>Compromiso:</strong> Nunca manipulamos resultados. Nuestro negocio 
          se basa en la confianza, y el sistema Provably Fair es nuestra garantia 
          de transparencia total.
        </p>
      </div>
    </LegalLayout>
  );
};

export default ProvablyFairPage;
