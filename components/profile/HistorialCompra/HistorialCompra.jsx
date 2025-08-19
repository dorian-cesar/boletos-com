import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from "./HistorialCompra.module.css";
import axios from "axios";
import { useId } from "react";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";
import { generateToken } from "utils/jwt-auth";
import Popup from "../../Popup/Popup";
import ModalEntities from "../../../entities/ModalEntities";

const actualizarFormFields = {
  rut: "",
  // apellidoMaterno: "",
  apellidoPaterno: "",
  email: "",
  // correo: "",
  // correo2: "",
  // fechaNacimiento: "",
  nombres: "",
  userId: "",
  // tipoDocumento: "R",
  // sexo: "",
};

const estadoBoleto = {
  ACTI: "Activo",
  NUL: "Nulo",
};

const clpFormat = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

const itemsPerPage = 8;
const itemsPerPageBoleto = 5;

const HistorialCompra = () => {
  const { formState: userData, onInputChange } = useForm(actualizarFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTicket, setLoadingTicket] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [boleto, setBoleto] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageBoleto, setCurrentPageBoleto] = useState(1);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [transaccion, setTransaccion] = useState("");

  const abrirPopup = () => {
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  const id = useId();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkUser = decryptData(LocalStorageEntities.user_auth);

    if (!checkUser) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      try {
        let updatedUser = checkUser;

        const { data } = await axios.post("/api/user/obtener-usuario", {
          email: checkUser.correo,
        });
        updatedUser = { ...updatedUser, id: data.id };
        setUser(updatedUser);

        // Obtener historial de compras
        const { data: historialData } = await axios.get(
          "/api/user/historial-compra",
          {
            params: { userId: data.id },
          }
        );
        const historialFalso = Array.from({ length: 50 }).map((_, i) => ({
          date: `2025-08-${String((i % 28) + 1).padStart(2, "0")}`,
          departureTime: "10:00",
          origin: "Santiago",
          destination: "Valparaíso",
          serviceId: `srv-${i}`,
          tipo_Asiento_piso_1: "Semi Cama",
          tipo_Asiento_piso_2: "Salón Cama",
          company: "Buses Ejemplo",
          seats: {
            firstFloor: [
              [
                {
                  number: `A${i}`,
                  floor: 1,
                  price: 5000 + i * 100,
                  paid: i % 2 === 0,
                  authCode: `AUTH${i}`,
                },
              ],
            ],
            secondFloor: [],
          },
        }));
        setHistorial(historialData);
        // setHistorial([...historialData, ...historialFalso]);
      } catch (error) {
        console.error("Error en la carga de datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const MemoizedComponent = useMemo(() => {
    if (!historial || historial.length === 0) {
      return (
        <tr>
          <td colSpan={5}>No hay registros</td>
        </tr>
      );
    }

    const boletosPlanos = historial.flatMap((servicio, servicioIndex) => {
      const allSeats = [
        ...(servicio.seats.firstFloor?.flat() || []),
        ...(servicio.seats.secondFloor?.flat() || []),
      ];

      const today = new Date();

      return allSeats.map((asiento, asientoIndex) => {
        const fechaViaje = new Date(
          `${servicio.date}T${servicio.departureTime || "00:00"}:00`
        );
        let estadoTransaccion = "NUL";
        if (!asiento.paid) estadoTransaccion = "NUL";
        else if (fechaViaje >= today) estadoTransaccion = "ACTI";
        else estadoTransaccion = "VENC";

        return {
          key: `${asiento.authCode}-${servicioIndex}-${asientoIndex}`,
          authCode: asiento.authCode,
          fecha: servicio.date,
          cantidadBoletos: 1,
          montoTotal: asiento.price || 0,
          estadoTransaccion,
        };
      });
    });

    boletosPlanos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const boletosPagina = boletosPlanos.slice(startIndex, endIndex);

    if (boletosPagina.length === 0) {
      return (
        <tr>
          <td colSpan={5}>No hay boletos en esta página</td>
        </tr>
      );
    }

    return boletosPagina.map((boleto) => (
      <tr key={boleto.key}>
        <td>{boleto.authCode}</td>
        <td>
          {boleto.estadoTransaccion === "ACTI"
            ? "Boleto activo"
            : boleto.estadoTransaccion === "NUL"
            ? "Transacción nula"
            : "Boleto usado"}
        </td>
        <td>{boleto.fecha}</td>
        {/* <td>{boleto.cantidadBoletos}</td> */}
        <td>{clpFormat.format(boleto.montoTotal)}</td>
        <td className={styles["boton-descargar"]}>
          {boleto.estadoTransaccion === "ACTI" && (
            <img
              width={24}
              src="/img/icon/general/search-outline.svg"
              onClick={() => abrirPopTransaccion(boleto.authCode)}
            />
          )}
        </td>
      </tr>
    ));
  }, [historial, currentPage]);

  const totalPages = Math.ceil(
    (historial.flatMap((s) => [
      ...(s.seats.firstFloor?.flat() || []),
      ...(s.seats.secondFloor?.flat() || []),
    ]).length || 0) / itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li
          key={i}
          className={`${styles["page-item"]} ${
            currentPage === i ? styles["active"] : ""
          }`}
        >
          <button
            onClick={() => handlePageChange(i)}
            className={styles["page-link"]}
          >
            {i}
          </button>
        </li>
      );
    }

    if (currentPage > 1) {
      pages.unshift(
        <li key="previous" className={styles["page-item"]}>
          <button
            onClick={handlePreviousPage}
            className={styles["page-link"]}
            aria-label="Previous"
          >
            &laquo;
          </button>
        </li>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <li key="next" className={styles["page-item"]}>
          <button
            onClick={handleNextPage}
            className={styles["page-link"]}
            aria-label="Next"
          >
            &raquo;
          </button>
        </li>
      );
    }

    return pages;
  };

  const totalPagesBoletos = Math.ceil(boleto.length / itemsPerPage);

  const handlePageChangeBoleto = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPagesBoletos) {
      setCurrentPageBoleto(pageNumber);
    }
  };

  const handleNextPageBoleto = () => {
    if (currentPageBoleto < totalPagesBoletos) {
      setCurrentPageBoleto(currentPageBoleto + 1);
    }
  };

  const handlePreviousPageBoleto = () => {
    if (currentPageBoleto > 1) {
      setCurrentPageBoleto(currentPageBoleto - 1);
    }
  };

  const renderPaginationBoleto = () => {
    const pages = [];
    const maxVisiblePages = 3;
    const startPage = Math.max(
      1,
      currentPageBoleto - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(
      startPage + maxVisiblePages - 1,
      totalPagesBoletos
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li
          key={i}
          className={`${styles["page-item"]} ${
            currentPageBoleto === i ? styles["active"] : ""
          }`}
        >
          <button
            onClick={() => handlePageChangeBoleto(i)}
            className={styles["page-link"]}
          >
            {i}
          </button>
        </li>
      );
    }

    if (currentPageBoleto > 1) {
      pages.unshift(
        <li key="previous" className={styles["page-item"]}>
          <button
            onClick={handlePreviousPageBoleto}
            className={styles["page-link"]}
            aria-label="Previous"
          >
            &laquo;
          </button>
        </li>
      );
    }

    if (currentPageBoleto < totalPagesBoletos) {
      pages.push(
        <li key="next" className={styles["page-item"]}>
          <button
            onClick={handleNextPageBoleto}
            className={styles["page-link"]}
            aria-label="Next"
          >
            &raquo;
          </button>
        </li>
      );
    }

    return pages;
  };

  const boletoDetalle = useMemo(() => {
    if (boleto.length === 0) {
      return <h3>No hay registros</h3>;
    }

    return boleto.map((itemBoleto, index) => (
      <tr key={index}>
        <td>{itemBoleto.boleto}</td>
        <td>{itemBoleto.origen}</td>
        <td>{itemBoleto.destino}</td>
        <td>{itemBoleto.fechaEmbarcacion}</td>
        <td className={styles["boton-descargar"]}>
          {itemBoleto.puedeImprimir && (
            <button
              disabled={loadingTicket === itemBoleto.authCode}
              className={styles["btn-descargar"]}
              onClick={() => descargarBoleto(itemBoleto)}
              aria-label="Descargar boleto"
            >
              {loadingTicket === itemBoleto.authCode ? (
                <div className={styles.spinner} aria-hidden="true"></div>
              ) : (
                <img
                  width={24}
                  height={24}
                  src="/img/icon/general/download-outline.svg"
                  alt="Descargar"
                />
              )}
            </button>
          )}
        </td>
      </tr>
    ));
  }, [boleto, currentPageBoleto, loadingTicket]);

  const tablaArmada = (
    <div className={`${styles["menu-central"]} mt-0 pt-2`}>
      <div className={styles["tabla-responsive"]}>
        <table className={`table ${styles["tabla-informacion"]}`}>
          <thead>
            <tr>
              <th scope="col">Boleto</th>
              <th scope="col">Origen</th>
              <th scope="col">Destino</th>
              <th scope="col">Fecha embarque</th>
              <th scope="col">Descargar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.loader}></div>
                </td>
              </tr>
            ) : (
              boletoDetalle
            )}
          </tbody>
        </table>
      </div>
      {totalPagesBoletos > 1 && (
        <nav aria-label="Page navigation boletos">
          <ul className={styles["pagination-css"]}>
            {renderPaginationBoleto()}
          </ul>
        </nav>
      )}
    </div>
  );

  const abrirPopTransaccion = (authCode) => {
    setTransaccion(authCode);

    const seatsParaTransaccion = historial
      .flatMap((servicio) => [
        ...(servicio.seats.firstFloor?.flat() || []),
        ...(servicio.seats.secondFloor?.flat() || []),
      ])
      .filter((asiento) => asiento.authCode === authCode);

    const boletos = seatsParaTransaccion.map((asiento) => {
      const servicio = historial.find((s) =>
        [
          ...(s.seats.firstFloor?.flat() || []),
          ...(s.seats.secondFloor?.flat() || []),
        ].some((a) => a.authCode === authCode)
      );

      return {
        boleto: asiento.number,
        origen: servicio?.origin,
        destino: servicio?.destination,
        fechaEmbarcacion: servicio?.date,
        puedeImprimir: asiento.paid,
        authCode: asiento.authCode,
      };
    });

    setBoleto(boletos);
    abrirPopup();
  };

  const descargarBoleto = async (itemBoleto) => {
    if (!itemBoleto || loadingTicket) return;

    try {
      setLoadingTicket(itemBoleto.authCode);

      const asientoCompleto = historial
        .flatMap((servicio) => [
          ...(servicio.seats.firstFloor?.flat() || []),
          ...(servicio.seats.secondFloor?.flat() || []),
        ])
        .find(
          (a) =>
            a.authCode === itemBoleto.authCode && a.number === itemBoleto.boleto
        );

      if (!asientoCompleto) {
        console.error("No se encontró el asiento en el historial");
        setLoadingTicket(null);
        return;
      }

      const servicio = historial.find((s) =>
        [
          ...(s.seats.firstFloor?.flat() || []),
          ...(s.seats.secondFloor?.flat() || []),
        ].some((a) => a._id === asientoCompleto._id)
      );

      if (!servicio) {
        console.error("No se encontró el servicio correspondiente al boleto");
        setLoadingTicket(null);
        return;
      }

      const viaje = {
        origin: servicio.origin,
        destination: servicio.destination,
        date: servicio.date,
        departureTime: servicio.departureTime,
        arrivalDate: servicio.arrivalDate,
        arrivalTime: servicio.arrivalTime,
        terminalOrigin: servicio.terminalOrigin,
        terminalDestination: servicio.terminalDestination,
        company: servicio.company,
        seatLayout: {
          tipo_Asiento_piso_1: servicio.tipo_Asiento_piso_1,
          tipo_Asiento_piso_2: servicio.tipo_Asiento_piso_2,
        },
        asientos: [
          {
            asiento: asientoCompleto.number,
            floor: asientoCompleto.floor,
            valorAsiento: asientoCompleto.price,
            authCode: asientoCompleto.authCode,
          },
        ],
      };

      const ticketData = {
        [servicio.serviceId]: { ida: [viaje], vuelta: [] },
      };

      const token = generateToken();

      const body = {
        ticketData,
        email: user?.correo,
        authCode: asientoCompleto.authCode,
        customerName: user?.nombreCompleto || "Cliente",
        bookingReference: asientoCompleto.authCode,
        tokenBoleto: token,
      };

      const response = await fetch("/api/generar-boletos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (
        response.ok &&
        Array.isArray(result.tickets) &&
        result.tickets.length > 0
      ) {
        result.tickets.forEach((ticket) =>
          downloadTicket(ticket.base64, ticket.fileName)
        );
      } else {
        console.error("Error al generar boleto:", result);
      }
    } catch (error) {
      console.error("Error al descargar el boleto:", error);
    } finally {
      setLoadingTicket(null);
    }
  };

  const downloadTicket = (base64, fileName) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={styles["menu-central"]}>
        <h1 className="title-historial">Historial de compras</h1>
        <span>
          Registro de todos tus boletos comprados. Recuerda que solo podrás
          descargar tu pasaje mientras esté activo.
        </span>
        <div className={styles["table-responsive-custom"]}>
          <table className={`table ${styles["tabla-informacion"]}`}>
            <thead>
              <tr>
                <th scope="col">Código Transacción</th>
                <th scope="col">Estado Boleto</th>
                <th scope="col">Fecha Viaje</th>
                {/* <th scope="col">Cantidad Boletos</th> */}
                <th scope="col">Monto</th>
                <th scope="col">Ver boletos</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.loader}></div>
                  </td>
                </tr>
              ) : (
                MemoizedComponent
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <nav aria-label="Page navigation historial">
            <ul className={styles["pagination-css"]}>{renderPagination()}</ul>
          </nav>
        )}
        {mostrarPopup && (
          <div className={styles["popup-overlay"]}>
            <div
              className={styles["popup-container"]}
              key={`popup-${transaccion}-${loadingTicket}`}
            >
              <div className={styles["popup-header"]}>
                <span
                  className={`${styles["close-icon"]} ${
                    loadingTicket ? styles["disabled"] : ""
                  }`}
                  onClick={() => {
                    if (!loadingTicket) cerrarPopup();
                  }}
                >
                  &times;
                </span>
              </div>

              <div className="col-12">
                <div className="row justify-content-center">
                  <div className="col-12 text-center">
                    <img
                      src="/img/icon/popup/checkmark-circle-outline.svg"
                      alt="Checkmark"
                    />
                  </div>
                  <div className="col-12 text-center">
                    <p className="mb-0 fw-bold">Detalle boletos</p>
                  </div>
                </div>
              </div>

              <div className={styles["popup-content"]}>{tablaArmada}</div>

              <button
                className={styles["popup-button"]}
                onClick={cerrarPopup}
                disabled={!!loadingTicket}
              >
                {loadingTicket ? "Generando boleto..." : "Aceptar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HistorialCompra;
