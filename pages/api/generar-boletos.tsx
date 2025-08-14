import { Buffer } from "buffer";
import QRCode from "qrcode";
import { createTransport } from "nodemailer";
import { NextApiRequest, NextApiResponse } from "next";
import Mail from "nodemailer/lib/mailer";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

interface TicketData {
  ticketData: any;
  email: string;
  authCode?: string;
  token?: string;
  tokenBoleto?: string;
  customerName?: string;
  bookingReference?: string;
}

interface TicketResponse {
  success: boolean;
  message: string;
  tickets: Array<{
    fileName: string;
    base64: string;
  }>;
  emailSent: string;
}

interface EmailTicket {
  fileName: string;
  buffer: Buffer;
  origin: string;
  destination: string;
  seat: string;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<TicketResponse>
) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método no permitido",
      tickets: [],
      emailSent: "",
    });
  }

  try {
    const {
      ticketData,
      email,
      authCode,
      token,
      tokenBoleto,
      customerName,
      bookingReference,
    }: TicketData = req.body;
    console.log("Datos recibidos:", { ticketData, email, tokenBoleto });

    if (!ticketData || !email) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos",
        tickets: [],
        emailSent: "",
      });
    }

    // 1. Generar los boletos en PDF
    const { generatedTickets } = await generateAllTicketsPDF(
      ticketData,
      authCode,
      token,
      tokenBoleto
    );

    // 2. Enviar por email
    const emailResult = await sendTicketsByEmail({
      customerEmail: email,
      tickets: generatedTickets.map((t) => ({
        fileName: t.fileName,
        buffer: t.buffer,
        origin: t.origin,
        destination: t.destination,
        seat: t.seat,
      })),
      customerName,
      bookingReference,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.message);
    }

    // 3. Preparar respuesta para el frontend
    const frontendTickets = generatedTickets.map((ticket) => ({
      fileName: ticket.fileName,
      base64: ticket.base64,
    }));

    res.status(200).json({
      success: true,
      message: "Boletos generados y enviados correctamente",
      tickets: frontendTickets,
      emailSent: email,
    });
  } catch (error) {
    console.error("Error en el endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud: " + error.message,
      tickets: [],
      emailSent: "",
    });
  }
};

// Función para generar todos los boletos (retorna base64)
async function generateAllTicketsPDF(
  ticketData: any,
  authCode?: string,
  token?: string,
  tokenBoleto?: string
): Promise<{
  generatedTickets: Array<{
    fileName: string;
    base64: string;
    buffer: Buffer;
    origin: string;
    destination: string;
    seat: string;
  }>;
}> {
  const generatedTickets = [];

  for (const ticketId of Object.keys(ticketData)) {
    const ticketInfo = ticketData[ticketId];
    if (!ticketInfo) continue;

    if (ticketInfo.ida) {
      await processTrips(
        ticketInfo.ida,
        "ida",
        generatedTickets,
        authCode,
        token,
        tokenBoleto
      );
    }

    if (ticketInfo.vuelta) {
      await processTrips(
        ticketInfo.vuelta,
        "vuelta",
        generatedTickets,
        authCode,
        token,
        tokenBoleto
      );
    }
  }

  return { generatedTickets };
}

// Procesar viajes y generar PDFs
async function processTrips(
  trips: any[],
  tripType: string,
  generatedTickets: any[],
  authCode?: string,
  token?: string,
  tokenBoleto?: string
): Promise<void> {
  for (const trip of trips) {
    if (!trip?.asientos?.length) continue;

    for (const seat of trip.asientos) {
      const ticket = await generateTicketPDF(
        trip,
        seat,
        tripType,
        authCode,
        token,
        tokenBoleto
      );
      generatedTickets.push(ticket);
    }
  }
}

export async function generateTicketPDF(
  trip: any,
  seat: any,
  tripType: string,
  authCode?: string,
  token?: string,
  tokenBoleto?: string
): Promise<{
  fileName: string;
  base64: string;
  buffer: Buffer;
  origin: string;
  destination: string;
  seat: string;
}> {
  const qrData = JSON.stringify({
    origin: trip.origin,
    destination: trip.destination,
    date: trip.date,
    departureTime: trip.departureTime,
    arrivalDate: trip.arrivalDate,
    arrivalTime: trip.arrivalTime,
    seat: seat.asiento,
    floor: seat.floor,
    tipo:
      seat.floor === "floor1"
        ? trip.seatLayout.tipo_Asiento_piso_1
        : trip.seatLayout.tipo_Asiento_piso_2,
    price: seat.valorAsiento,
    authCode: seat.authCode || authCode,
    token: token || null,
    tokenBoleto: tokenBoleto || null,
    type: tokenBoleto ? "boleto" : "transaction",
  });

  console.log(
    "Generando PDF para asiento",
    seat.asiento,
    "tokenBoleto:",
    tokenBoleto
  );

  const encoded = Buffer.from(qrData).toString("base64");
  const qrUrl = `https://boletos-com.netlify.app/ver-boleto?data=${encoded}`;
  const qrImage = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

      @page {
        size: A4;
        margin: 0;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Inter", sans-serif;
        font-size: 14px;
        background: white;
      }

      .ticket-container {
        width: 794px;
        /* height: 1123px; */
        height: 920px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 30px 40px;
      }

      .ticket-header {
        background: #1e293b;
        padding: 25px;
        color: white;
        text-align: center;
        border-radius: 8px;
      }

      .company-name {
        font-size: 30px;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .trip-type {
        font-size: 14px;
        text-transform: uppercase;
        color: #cbd5e1;
      }

      .ticket-body {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .route-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f1f5f9;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }

      .route-point {
        text-align: center;
        flex: 1;
      }

      .route-connector {
        flex: 0 0 100px;
        height: 4px;
        background: #334155;
        margin: 0 20px;
        position: relative;
      }

      .location-label {
        font-size: 11px;
        color: #64748b;
        margin-bottom: 4px;
        text-transform: uppercase;
      }

      .location-name {
        font-size: 22px;
        font-weight: 600;
      }

      .terminal-name {
        font-size: 12px;
        color: #64748b;
      }

      .date-hour {
        display: flex;
        flex-direction: column;
        font-weight: 500;
        margin-top: 6px;
      }

      .top-row {
        display: flex;
        gap: 20px;
        justify-content: space-evenly;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-weight: 600;
        font-size: 1rem;
        color: #333;
      }

      .detail-value {
        font-size: 1.2rem;
        font-weight: 600;
        color: #000;
        margin-top: 3px;
      }

      .bottom-row {
        display: flex;
        gap: 20px;
        justify-content: space-evenly;
        margin-top: 10px;
      }

      .details-section {
        flex: 1;
        max-width: 300px;
        background: #fafafa;
        padding: 12px;
        border-radius: 6px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        justify-content: start;
        gap: 12px;
      }

      .seat-details {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .details-qr-container {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
      }

      .details-section,
      .qr-section {
        flex: 1;
        max-width: 330px;
        min-height: 244px;
        gap: 15px;
        background: #fafafa;
        padding: 20px;
        border-radius: 6px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 20px;
      }

      .detail-label {
        font-weight: 600;
        font-size: 1rem;
        color: #555;
      }

      .qr-section {
        flex: 1;
        max-width: 330px;
        background: #fafafa;
        padding: 12px;
        border-radius: 6px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
        text-align: center;
      }

      .qr-label {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 10px;
        color: #333;
      }

      .qr-code {
        max-width: 100%;
        height: auto;
        display: inline-block;
      }

      .auth-section {
        margin-top: 20px;
        text-align: center;
      }

      .auth-label {
        font-weight: 600;
        margin-bottom: 6px;
        color: #555;
      }

      .auth-code {
        font-weight: 700;
        font-size: 1.1rem;
        color: #000;
        margin-bottom: 10px;
      }

      .footer-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .footer {
        padding: 20px;
        border-radius: 10px;
        background: #f1f5f9;
        text-align: center;
      }

      .footer-title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 12px;
      }

      .footer-instructions {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
      }

      .instruction-item {
        font-size: 13px;
        padding: 6px 12px;
        border: 1px solid #9b9b9b;
        border-radius: 16px;
        background: rgb(246, 246, 255);
        color: #334155;
      }

      .footer-note {
        font-size: 11px;
        color: #64748b;
        font-style: italic;
      }

      .company-info {
        background: #1e293b;
        color: #cbd5e1;
        font-size: 11px;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        border-radius: 6px;
      }

      .company-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .company-logo {
        width: 20px;
        height: 20px;
        background: #10b981;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      .company-right {
        display: flex;
        align-items: center;
        opacity: 0.8;
      }
    </style>
  </head>
  <body>
    <div class="ticket-container">
      <div class="ticket-header">
        <div class="company-name">${trip.company || "BusExpress"}</div>
        <div class="trip-type">
          Boleto de ${tripType === "ida" ? "Ida" : "Vuelta"}
        </div>
      </div>

      <div class="ticket-body">
        <div class="route-section">
          <div class="route-point">
            <div class="location-label">Origen</div>
            <div class="location-name">${trip.origin}</div>
            <div class="terminal-name">${trip.terminalOrigin}</div>
            <div class="date-hour">
              <div>${formatDate(trip.date)}</div>
              <div>${trip.departureTime} hrs</div>
            </div>
          </div>
          <div class="route-connector"></div>
          <div class="route-point">
            <div class="location-label">Destino</div>
            <div class="location-name">${trip.destination}</div>
            <div class="terminal-name">${trip.terminalDestination}</div>
            <div class="date-hour">
              <div>${formatDate(trip.arrivalDate)}</div>
              <div>${trip.arrivalTime} hrs</div>
            </div>
          </div>
        </div>

        <div class="bottom-row">
          <div class="details-section">
            <div class="seat-details">
              <div class="detail-item">
                <div class="detail-label">Asiento</div>
                <div class="detail-value">${seat.asiento}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Piso</div>
                <div class="detail-value">
                  ${seat.floor === "floor1" ? "1" : "2"}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Tipo</div>
                <div class="detail-value">
                  ${
                    seat.floor === "floor1"
                      ? trip.seatLayout.tipo_Asiento_piso_1
                      : trip.seatLayout.tipo_Asiento_piso_2
                  }
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Precio</div>
                <div class="detail-value">Gs. ${seat.valorAsiento}</div>
              </div>
            </div>
          </div>

          <div class="qr-section">
            <div class="qr-label">Código QR</div>
            <img src="${qrImage}" alt="QR Code" class="qr-code" />
          </div>
        </div>

        <div class="auth-section">
          <div class="auth-label">Código de Transacción</div>
          <div class="auth-code">${seat.authCode || authCode || "N/A"}</div>
        </div>
      </div>

      <div class="footer-container">
        <div class="footer">
          <div class="footer-title">¡Gracias por viajar con nosotros!</div>
          <div class="footer-instructions">
            <span class="instruction-item"
              >Presenta este boleto al abordar</span
            >
            <span class="instruction-item">Lleva identificación válida</span>
            <span class="instruction-item">Llega 30 minutos antes</span>
          </div>
          <div class="footer-note">
            Este boleto es intransferible. Válido únicamente para la fecha y
            horario especificados.
          </div>
        </div>

        <div class="company-info">
          <div class="company-left">
            <div class="company-logo">B</div>
            <span>Boleto generado electrónicamente</span>
          </div>
          <div class="company-right">
            <span
              >Sistema de reservas BusExpress © ${new Date().getFullYear()}</span
            >
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  // Configuración de Puppeteer con Chromium
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  // Establecer el contenido HTML
  await page.setContent(htmlContent, {
    waitUntil: "networkidle0",
  });

  // Generar el PDF
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  });

  await browser.close();

  const buffer = Buffer.from(pdfBuffer);
  const base64 = `data:application/pdf;base64,${buffer.toString("base64")}`;
  const fileName = `Boleto_${trip.origin}-${trip.destination}_${trip.date}_Asiento:${seat.asiento}.pdf`;

  return {
    fileName,
    base64,
    buffer,
    origin: trip.origin,
    destination: trip.destination,
    seat: seat.asiento,
  };
}

// Función para enviar boletos por email
async function sendTicketsByEmail(options: {
  customerEmail: string;
  tickets: EmailTicket[];
  customerName?: string;
  bookingReference?: string;
}): Promise<{ success: boolean; message: string }> {
  const {
    customerEmail,
    tickets,
    customerName = "Estimado cliente",
    bookingReference = "",
  } = options;

  try {
    // 1. Validaciones iniciales
    if (!customerEmail || !tickets?.length) {
      throw new Error("Se requiere email del cliente y al menos un boleto");
    }

    // 2. Configurar transporte de correo
    const transporter = createTransport({
      service: process.env.EMAIL_SERVICE || "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });

    // 3. Preparar adjuntos
    const attachments: Mail.Attachment[] = tickets.map((ticket) => ({
      filename: ticket.fileName,
      content: ticket.buffer,
      contentType: "application/pdf",
    }));

    // 4. Preparar contenido del correo
    const emailSubject = `Boletos.com - Tus boletos de viaje ${
      bookingReference ? `(Ref: ${bookingReference})` : ""
    }`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #2c3e50;">¡Gracias por viajar con BusExpress!</h1>
        
        <p>Hola ${customerName},</p>
        
        <p>Adjunto encontrarás tus ${
          tickets.length
        } boleto(s) de viaje. Por favor revisa los detalles:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Resumen de tu compra:</h3>
          <ul style="padding-left: 20px;">
            ${tickets
              .map(
                (t) => `
              <li style="margin-bottom: 8px;">
                <strong>${t.origin} a ${t.destination} - Asiento ${t.seat}</strong>
              </li>
            `
              )
              .join("")}
          </ul>
          ${
            bookingReference
              ? `<p><strong>Referencia:</strong> ${bookingReference}</p>`
              : ""
          }
        </div>
        
        <h3 style="color: #2c3e50;">Instrucciones importantes:</h3>
        <ol>
          <li>Presenta este boleto (impreso o en tu móvil) al abordar el bus</li>
          <li>Lleva una identificación válida</li>
          <li>Llega al menos 30 minutos antes de la salida</li>
        </ol>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #e9f7fe; border-radius: 5px;">
          <h4 style="margin-top: 0;">¿Necesitas ayuda?</h4>
          <p style="margin-bottom: 0;">
            Contáctanos en <a href="mailto:soporte@busexpress.com">soporte@busexpress.com</a> o al +56 2 2345 6789
          </p>
        </div>
        
        <p style="margin-top: 30px;">¡Te deseamos un excelente viaje!</p>
        <p><strong>El equipo de BusExpress</strong></p>
      </div>
    `;

    // 5. Configurar opciones del correo
    const mailOptions: Mail.Options = {
      from: `"Boletos" <${process.env.EMAIL_FROM}>`,
      to: customerEmail,
      subject: emailSubject,
      html: emailHtml,
      text: `Hola ${customerName},\n\nAdjunto encontrarás tus ${
        tickets.length
      } boleto(s) de viaje. Por favor presenta estos boletos al abordar el bus junto con tu identificación.\n\nReferencia: ${
        bookingReference || "N/A"
      }\n\n¡Gracias por viajar con BusExpress!`,
      attachments,
    };

    // 6. Verificar conexión SMTP antes de enviar
    await transporter.verify();

    // 7. Enviar el correo electrónico
    const info = await transporter.sendMail(mailOptions);

    console.log(`Correo enviado a ${customerEmail}`, info.messageId);
    return {
      success: true,
      message: `Los boletos han sido enviados a ${customerEmail}`,
    };
  } catch (error) {
    console.error("Error al enviar boletos por correo:", error);

    let errorMessage = "Error al enviar los boletos por correo electrónico";
    if (error.code === "EAUTH") {
      errorMessage = "Error de autenticación con el servicio de correo";
    } else if (error.code === "EENVELOPE") {
      errorMessage = "La dirección de correo electrónico no es válida";
    }

    return {
      success: false,
      message: `${errorMessage}: ${error.message}`,
    };
  }
}
