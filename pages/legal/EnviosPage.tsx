/**
 * EnviosPage - Política de Envíos y Devoluciones
 * 
 * Información sobre:
 * - Tiempos y costos de envío
 * - Proceso de intercambio por saldo
 * - Política de devoluciones
 * - Garantía de autenticidad
 */

import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const EnviosPage: React.FC = () => {
  return (
    <LegalLayout title="Envios y Devoluciones" lastUpdated="4 de Diciembre, 2025">
      <p>
        En <strong>Lootea</strong>, nos aseguramos de que recibas tus premios de manera 
        segura y rapida. Aqui encontraras toda la informacion sobre envios, intercambios 
        y nuestra politica de devoluciones.
      </p>

      <div className="highlight-box">
        <p>
          <strong>Envio Gratis:</strong> Todos los envios dentro de Mexico son 
          completamente gratuitos, sin importar el valor del producto.
        </p>
      </div>

      <h2>1. Opciones al Ganar un Premio</h2>
      <p>
        Cuando ganas un item en Lootea, tienes dos opciones:
      </p>
      
      <h3>1.1 Solicitar Envio</h3>
      <ul>
        <li>Recibe el producto fisico en tu domicilio</li>
        <li>Envio gratuito a todo Mexico</li>
        <li>Seguimiento en tiempo real</li>
        <li>Seguro incluido</li>
      </ul>

      <h3>1.2 Intercambiar por Saldo</h3>
      <ul>
        <li>Convierte el premio en saldo instantaneamente</li>
        <li>Sin comisiones ni cargos</li>
        <li>Usa el saldo para abrir mas cajas</li>
        <li>Valor de intercambio mostrado antes de confirmar</li>
      </ul>

      <div className="info-box">
        <p>
          El valor de intercambio se calcula basado en el precio de mercado del 
          producto. Puedes ver el valor exacto antes de confirmar la conversion.
        </p>
      </div>

      <h2>2. Proceso de Envio</h2>
      
      <h3>2.1 Pasos para Solicitar Envio</h3>
      <ol>
        <li>Ve a tu <strong>Inventario</strong> en tu perfil</li>
        <li>Selecciona el item que deseas recibir</li>
        <li>Haz clic en "Solicitar Envio"</li>
        <li>Confirma o actualiza tu direccion de envio</li>
        <li>Revisa y confirma la solicitud</li>
        <li>Recibiras un correo con el numero de seguimiento</li>
      </ol>

      <h3>2.2 Requisitos para Envio</h3>
      <ul>
        <li>Cuenta verificada (nivel Intermedio minimo)</li>
        <li>Direccion de envio completa y valida</li>
        <li>Telefono de contacto activo</li>
      </ul>

      <h2>3. Tiempos de Entrega</h2>
      
      <table>
        <thead>
          <tr>
            <th>Zona</th>
            <th>Tiempo Estimado</th>
            <th>Paqueteria</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CDMX y Area Metropolitana</td>
            <td>3-5 dias habiles</td>
            <td>DHL, FedEx, Estafeta</td>
          </tr>
          <tr>
            <td>Ciudades Principales</td>
            <td>5-7 dias habiles</td>
            <td>DHL, FedEx, Estafeta</td>
          </tr>
          <tr>
            <td>Resto del Pais</td>
            <td>7-10 dias habiles</td>
            <td>FedEx, Estafeta</td>
          </tr>
          <tr>
            <td>Zonas Remotas</td>
            <td>10-15 dias habiles</td>
            <td>Estafeta, Correos de Mexico</td>
          </tr>
        </tbody>
      </table>

      <div className="warning-box">
        <p>
          Los tiempos son estimados y pueden variar por factores externos como 
          condiciones climaticas, dias festivos o situaciones de la paqueteria.
        </p>
      </div>

      <h2>4. Seguimiento de Envio</h2>
      <p>
        Una vez que tu paquete sea enviado:
      </p>
      <ul>
        <li>Recibiras un correo con el numero de guia</li>
        <li>Podras rastrear tu paquete en tiempo real desde tu cuenta</li>
        <li>Recibiras notificaciones de actualizacion de estado</li>
        <li>Te avisaremos cuando este proximo a llegar</li>
      </ul>

      <h2>5. Recepcion del Paquete</h2>
      
      <h3>5.1 Al Recibir</h3>
      <ul>
        <li>Verifica que el paquete no tenga danos visibles</li>
        <li>Si hay danos, reportalo inmediatamente a la paqueteria y a nosotros</li>
        <li>Abre el paquete y verifica el contenido</li>
        <li>Conserva el empaque original por si necesitas hacer una devolucion</li>
      </ul>

      <h3>5.2 Problemas con la Entrega</h3>
      <p>Si tienes problemas con tu envio:</p>
      <ul>
        <li><strong>Paquete no recibido:</strong> Contacta a soporte con tu numero de guia</li>
        <li><strong>Paquete danado:</strong> Toma fotos y reporta en 24 horas</li>
        <li><strong>Producto incorrecto:</strong> Contactanos para solucionarlo</li>
        <li><strong>Direccion incorrecta:</strong> Notificanos antes del envio para corregir</li>
      </ul>

      <h2>6. Garantia de Autenticidad</h2>
      
      <div className="highlight-box">
        <p>
          <strong>100% Autentico:</strong> Todos nuestros productos son originales y 
          verificados. Trabajamos con StockX y retailers oficiales para garantizar 
          la autenticidad de cada item.
        </p>
      </div>

      <p>Cada producto incluye:</p>
      <ul>
        <li>Certificado de autenticidad (cuando aplica)</li>
        <li>Empaque original de la marca</li>
        <li>Etiquetas y accesorios originales</li>
        <li>Factura de compra de Lootea</li>
      </ul>

      <h2>7. Politica de Devoluciones</h2>
      
      <h3>7.1 Casos Aceptados</h3>
      <p>Aceptamos devoluciones en los siguientes casos:</p>
      <ul>
        <li><strong>Producto defectuoso:</strong> Defectos de fabrica no causados por el usuario</li>
        <li><strong>Producto incorrecto:</strong> Recibiste un item diferente al ganado</li>
        <li><strong>Dano en transito:</strong> El producto llego danado por la paqueteria</li>
      </ul>

      <h3>7.2 Casos NO Aceptados</h3>
      <ul>
        <li>Cambio de opinion o arrepentimiento</li>
        <li>Danos causados por el usuario</li>
        <li>Productos usados o sin empaque original</li>
        <li>Solicitudes fuera del plazo (mas de 7 dias)</li>
      </ul>

      <h3>7.3 Proceso de Devolucion</h3>
      <ol>
        <li>Contacta a soporte dentro de los 7 dias posteriores a la recepcion</li>
        <li>Proporciona fotos del producto y descripcion del problema</li>
        <li>Nuestro equipo evaluara tu caso en 48 horas</li>
        <li>Si es aprobado, te enviaremos una guia de devolucion prepagada</li>
        <li>Una vez recibido y verificado, procesaremos el reemplazo o reembolso</li>
      </ol>

      <h3>7.4 Opciones de Resolucion</h3>
      <ul>
        <li><strong>Reemplazo:</strong> Te enviamos el mismo producto nuevo</li>
        <li><strong>Saldo:</strong> Acreditamos el valor a tu cuenta</li>
        <li><strong>Reembolso:</strong> Solo en casos excepcionales y al metodo de pago original</li>
      </ul>

      <h2>8. Intercambio por Saldo</h2>
      
      <h3>8.1 Como Funciona</h3>
      <ol>
        <li>Ve a tu Inventario</li>
        <li>Selecciona el item a intercambiar</li>
        <li>Haz clic en "Intercambiar por Saldo"</li>
        <li>Revisa el valor ofrecido</li>
        <li>Confirma el intercambio</li>
        <li>El saldo se acredita instantaneamente</li>
      </ol>

      <h3>8.2 Valor de Intercambio</h3>
      <p>
        El valor de intercambio se calcula basado en:
      </p>
      <ul>
        <li>Precio de mercado actual del producto</li>
        <li>Disponibilidad y demanda</li>
        <li>Condicion (siempre nuevo/sin abrir)</li>
      </ul>

      <div className="info-box">
        <p>
          El intercambio es instantaneo e irreversible. Asegurate de revisar 
          el valor antes de confirmar.
        </p>
      </div>

      <h2>9. Preguntas Frecuentes sobre Envios</h2>
      
      <h3>Puedo cambiar mi direccion despues de solicitar el envio?</h3>
      <p>
        Si el paquete aun no ha sido enviado, si. Contacta a soporte inmediatamente. 
        Una vez en transito, no es posible modificar la direccion.
      </p>

      <h3>Que pasa si no estoy en casa cuando llegue el paquete?</h3>
      <p>
        La paqueteria intentara la entrega hasta 3 veces. Tambien puedes coordinar 
        con ellos para recoger en sucursal o reprogramar la entrega.
      </p>

      <h3>Hacen envios internacionales?</h3>
      <p>
        Actualmente solo enviamos dentro de Mexico. Estamos trabajando para 
        expandir a otros paises de Latinoamerica proximamente.
      </p>

      <h3>Puedo combinar varios items en un solo envio?</h3>
      <p>
        Si, puedes solicitar el envio de multiples items juntos. Esto no afecta 
        el costo (sigue siendo gratuito) y puede reducir el tiempo de espera.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para cualquier duda sobre envios o devoluciones:
      </p>
      <ul>
        <li><strong>Email:</strong> envios@lootea.mx</li>
        <li><strong>Soporte:</strong> soporte@lootea.mx</li>
        <li><strong>WhatsApp:</strong> +52 55 1234 5678</li>
        <li><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 (hora CDMX)</li>
      </ul>
    </LegalLayout>
  );
};

export default EnviosPage;
