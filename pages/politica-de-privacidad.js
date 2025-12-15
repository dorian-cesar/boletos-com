import axios from "axios";
import Layout from "components/Layout";
import { useState } from "react";

import Head from "next/head";

export default function Politica(props) {
  const [stage, setStage] = useState(0);
  return (
    <Layout>
      <Head>
        <title>Boletos.com | Bases Legales</title>
      </Head>
      <div className="pullman-mas mb-5">
        <div className="container">
          <div className="row py-4">
            <div className="col-12">
              <span>Home &gt; Bases Legales </span>
            </div>
          </div>
          <div className="row pb-5">
            <div className="col-md-12 col-12 d-flex align-items-center bloque flex-column">
              <h1>Politica de Privacidad</h1>
              <p>
                Para utilizar a plenitud todos los servicios del sitio debe ser
                necesario registrarse y proveer cierta información personal que
                servirá para dar respuesta y otorgar un mejor servicio. Al
                aceptar los Términos y Condiciones, el usuario accede a proveer
                los datos para registro y las actualizaciones necesarias para
                mantener actualizado dicho registro. La institución utilizará
                los datos de registro de acuerdo con las disposiciones legales
                vigentes contenidas en la Ley N° 19.628 y sus modificaciones.
              </p>
              <p>
                Estas políticas de privacidad rigen el uso que toda persona
                natural o jurídica que denominaremos “Cliente” le da a la
                plataforma y las condiciones de seguridad y tratamiento que se
                le da a los datos recopilados.
              </p>
              <p>
                Establece las condiciones de recopilación, utilización y
                situación donde es compartida dicha información y los derechos
                que tiene el “Cliente” sobre la misma, sin hacer diferencia si
                ha sido usado a través de aplicación web de escritorio o móvil.
              </p>
              <p>
                Para los efectos de la presente Política de Privacidad, el
                Cliente expresa su aceptación plena de las cláusulas aquí
                descritas, por tanto, constituye un acuerdo válido y obligatorio
                entre Cliente y Boletos.com.
              </p>
              <p>
                En caso de que el Usuario no acepte las condiciones o no esté de
                total acuerdo con las Política de Privacidad, deberá dejar de
                usar la Plataforma y abstenerse de descargar o usar ya sea
                directa o indirectamente, y de utilizar cualquier servicio
                provisto por la misma. Constituye igualmente responsabilidad del
                Cliente revisar periódicamente la Política de Privacidad de la
                Plataforma y ver sus actualizaciones o modificaciones.
              </p>
              <p>
                Para el funcionamiento de la Plataforma, la Empresa puede
                recopilar información web, así como grabar las llamadas
                telefónicas que se estimen conveniente especialmente en caso de
                gestión de reclamos. También se podrá almacenar información de
                los Usuarios, por medio de cookies o tag, por medio de la
                información proporcionada por el propio Cliente. Dicha
                información comprende datos referentes como nombre, direcciones,
                correo electrónico, direcciones IP, navegador o búsquedas
                realizadas en nuestra Plataforma. El Cliente podrá optar a su
                libre elección, restringir o deshabilitar el uso de cookies
                configurando su navegador web de preferencia, habilitando su
                navegador web para que rechace cookies teniendo en cuenta que al
                negarse a aceptar una cookie no podrá obtener acceso a muchos
                servicios de viaje y herramientas de planificación ofrecidos por
                este Sitio Web.
              </p>
              <p>
                La información y datos que se recopila se le da el siguiente
                uso:
              </p>
              <ul>
                <li>
                  Tramitar su compra de pasaje incluyendo las transacciones.
                </li>
                <li>
                  Ofrecerle productos, descuentos o promociones a través de
                  medios como correo electrónico o teléfono.
                </li>
                <li>
                  Responder preguntas y gestionar reclamos, realizar encuestas
                  de satisfacción, o consultar preferencia de ofertas o
                  destinos.
                </li>
                <li>
                  Remitirle confirmación y actualizaciones sobre su compra vía
                  correo electrónico, teléfono, SMS o WhatsApp.
                </li>
                <li>
                  Realizar análisis y estudios internos de Boletos.com, sobre
                  intereses, gustos y necesidades del cliente, con el fin de
                  mejorar nuestras propuestas comerciales, publicitarias y
                  promocionales.
                </li>
              </ul>
              <p>
                Queda entendido y es de su conocimiento que Boletos.com podrá
                compartir los datos relevantes de sus usuarios con Prestadoras
                de Servicio de transporte, aliados comerciales y proveedores
                para la gestión de sus reservas, incluyendo tarjetas de crédito
                usadas en la compra, analítica comercial y servicio de atención
                al cliente.
              </p>
              <p>
                Boletos.com mantiene mecanismos de seguridad para protección de
                sus datos, haciendo uso de un título digital que autentifica la
                identidad de un sitio web y cifrado de datos con el protocolo
                SSL (Secure Socket Layer), por lo que la información que se
                envía al servidor será estrictamente confidencial para el uso de
                terceros. Los datos serán de uso exclusivo para aquellos
                empleados, contratistas, representantes y agentes de la Empresa
                que necesitan conocer tales datos para el desempeño sus
                funciones y exigiendo a proveedores y aliados comerciales las
                mismas condiciones de confidencialidad incluyendo a empresas.
                Sin embargo y sin perjuicio de lo anterior, no garantiza
                eventuales vulneraciones por ataques web o intromisión de
                terceros no autorizados, aun cuando utilicen la información de
                los Clientes en forma indebida. Boletos.com se reserva el
                derecho de transferir la información recolectada en caso de
                venta de todo o parte de la compañía o transferencia de la
                Plataforma a otro administrador.
              </p>
              <p>
                Los datos personales correspondientes al Cliente serán
                almacenados en servidores ubicados en Chile, sin embargo, podrá
                almacenar dichos datos en otras ubicaciones fuera de Chile, a
                efecto de respaldos o redundancia de almacenamiento.
              </p>
              <p>
                El cliente al momento de registrarse o hacer transacciones
                bancarias podrá optar por aceptar o denegar la recepción en su
                correo electrónico de circulares promocionales, mensajes o
                alertas de ofertas, teniendo la posibilidad de cancelar
                suscripción a través de enlace que será enviado en cada correo
                electrónico. En caso de cancelación de suscripción dejará de
                recibir alertas de ofertas, mensajes promocionales o descuentos
                especiales, pero continuará recibiendo comunicaciones referidas
                al estatus de sus reservas activas. El usuario podrá solicitar
                la cancelación, rectificación, o supresión total de su
                información personal, a través de carta certificada enviada a
                WIT dirección Los Conquistadores 2440, Providencia, Santiago de
                Chile, lo cual deberá ser atendido en un plazo no mayor a 20
                días hábiles para proceder a la eliminación total de los datos.
              </p>
              <h5>
                EL USUARIO DECLARA FORMALMENTE CONOCER Y ACEPTAR ESTA POLÍTICA
                DE PRIVACIDAD Y LOS DERECHOS QUE OTORGA A Boletos.com.
              </h5>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
