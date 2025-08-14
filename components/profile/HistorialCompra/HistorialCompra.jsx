import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from "./HistorialCompra.module.css";
import axios from "axios";
import { useId } from "react";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";
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

const itemsPerPage = 9;
const itemsPerPageBoleto = 5;

const HistorialCompra = () => {
  const { formState: userData, onInputChange } = useForm(actualizarFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
        setHistorial(historialData);
      } catch (error) {
        console.error("Error en la carga de datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     console.log("user actualizado:", user);
  //   }
  // }, [user]);

  // useEffect(() => {
  //   console.log("userdata:::", user);
  //   data.nombres = user?.nombres;
  //   data.apellidoPaterno = user?.apellidoPaterno;
  //   // data.apellidoMaterno = user?.apellidoMaterno;
  //   // data.genero = user?.genero;
  //   // data.mail = user?.mail;
  //   // data.mail2 = user?.mail2;
  //   data.mail = user?.correo;
  //   data.rut = user?.rut;
  //   // if (!!user?.fechaNacimiento) {
  //   //   let fecha = new Date(
  //   //     String(user?.fechaNacimiento).substring(
  //   //       0,
  //   //       String(user?.fechaNacimiento).length - 5
  //   //     )
  //   //   );
  //   //   setFechaNacimiento(fecha);
  //   // }
  // }, [user]);

  // useEffect(() => {
  //   data.fechaNacimiento = fechaNacimiento;
  // }, [fechaNacimiento]);

  function retornarEstado(estado) {
    if (estado === "NUL") {
      return "Transacción nula";
    }
    if (estado === "ACTI") {
      return "Transacción activa";
    }
    return "Sin descripción";
  }

  const MemoizedComponent = useMemo(() => {
    if (!historial || historial.length === 0) {
      return <h3>No hay registros</h3>;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = historial.slice(startIndex, endIndex);

    return currentItems.flatMap((servicio, indexServicio) => {
      const allSeats = [
        ...(servicio.seats.firstFloor?.flat() || []),
        ...(servicio.seats.secondFloor?.flat() || []),
      ];

      if (allSeats.length === 0) {
        return (
          <tr key={indexServicio}>
            <td colSpan={6}>No hay boletos en esta transacción</td>
          </tr>
        );
      }

      // Agrupar asientos por authCode
      const seatsByAuth = allSeats.reduce((acc, asiento) => {
        if (!acc[asiento.authCode]) acc[asiento.authCode] = [];
        acc[asiento.authCode].push(asiento);
        return acc;
      }, {});

      const today = new Date();

      return Object.entries(seatsByAuth).map(([authCode, seats], indexAuth) => {
        const cantidadBoletos = seats.length;
        const montoTotal = seats.reduce((sum, a) => sum + (a.price || 0), 0);

        const hayPago = seats.some((a) => a.paid);
        const fechaViaje = new Date(
          `${servicio.date}T${servicio.departureTime}:00`
        );
        let estadoTransaccion = "NUL";

        if (!hayPago) {
          estadoTransaccion = "NUL"; // no pagado
        } else if (fechaViaje >= today) {
          estadoTransaccion = "ACTI"; // boleto activo
        } else {
          estadoTransaccion = "VENC"; // boleto vencido
        }

        return (
          <tr key={`${indexServicio}-${indexAuth}`}>
            <td>{authCode}</td>
            <td>
              {estadoTransaccion === "ACTI"
                ? "Boleto activo"
                : estadoTransaccion === "NUL"
                ? "Transacción nula"
                : "Boleto usado"}
            </td>
            <td>{servicio.date}</td>
            <td>{cantidadBoletos}</td>
            <td>{clpFormat.format(montoTotal)}</td>
            <td className={styles["boton-descargar"]}>
              {estadoTransaccion === "NUL" ? (
                ""
              ) : (
                <img
                  width={24}
                  src="/img/icon/general/search-outline.svg"
                  onClick={() => abrirPopTransaccion(authCode)}
                />
              )}
            </td>
          </tr>
        );
      });
    });
  }, [historial, currentPage]);

  const totalPages = Math.ceil(historial.length / itemsPerPage);

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
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <a className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </a>
        </li>
      );
    }

    if (currentPage > 1) {
      pages.unshift(
        <li key="previous" className="page-item">
          <a
            className="page-link"
            aria-label="Previous"
            onClick={handlePreviousPage}
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <li key="next" className="page-item">
          <a className="page-link" aria-label="Next" onClick={handleNextPage}>
            <span aria-hidden="true">&raquo;</span>
          </a>
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
          className={`page-item ${currentPageBoleto === i ? "active" : ""}`}
        >
          <a className="page-link" onClick={() => handlePageChangeBoleto(i)}>
            {i}
          </a>
        </li>
      );
    }

    if (currentPageBoleto > 1) {
      pages.unshift(
        <li key="previous" className="page-item">
          <a
            className="page-link"
            aria-label="Previous"
            onClick={handlePreviousPageBoleto}
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      );
    }

    if (currentPageBoleto < totalPagesBoletos) {
      pages.push(
        <li key="next" className="page-item">
          <a
            className="page-link"
            aria-label="Next"
            onClick={handleNextPageBoleto}
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
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
            <img
              src="/img/icon/general/download-outline.svg"
              onClick={() => descargarBoleto(itemBoleto.boleto)}
            />
          )}
        </td>
      </tr>
    ));
  }, [boleto, currentPageBoleto, mostrarPopup]);

  const tablaArmada = (
    <div className={styles["menu-central"]}>
      <table className={`table ${styles["tabla-informacion"]}`}>
        <thead>
          <tr>
            <th scope="col">Boleto</th>
            <th scope="col">Origen</th>
            <th scope="col">Destino</th>
            <th scope="col">Fecha embarque</th>
            <th scope="col"></th>
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
      <nav aria-label="Page navigation example">
        <ul className={`pagination ${styles["pagination-css"]}`}>
          {renderPaginationBoleto()}
        </ul>
      </nav>
    </div>
  );

  const abrirPopTransaccion = (authCode) => {
    setTransaccion(authCode);

    // Buscar todos los asientos que coinciden con la transacción
    const seatsParaTransaccion = historial
      .flatMap((servicio) => [
        ...(servicio.seats.firstFloor?.flat() || []),
        ...(servicio.seats.secondFloor?.flat() || []),
      ])
      .filter((asiento) => asiento.authCode === authCode);

    // Mapear a la estructura de la tabla
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
      };
    });

    setBoleto(boletos);
    abrirPopup();
  };

  // const descargarBoleto = async (boletoBuscar) => {
  //   let boleto = {
  //     codigo: transaccion,
  //     boleto: boletoBuscar,
  //   };
  //   try {
  //     const res = await axios.post("/api/voucher", boleto);
  //     if (res.request.status) {
  //       const linkSource = `data:application/pdf;base64,${res.data?.archivo}`;
  //       const downloadLink = document.createElement("a");
  //       const fileName = res.data.nombre;
  //       downloadLink.href = linkSource;
  //       downloadLink.download = fileName;
  //       downloadLink.click();
  //     }
  //   } catch (e) {}
  // };

  const generarBoletos = async () => {
    const token = localStorage.getItem("tokenTemp");
    try {
      console.log("Enviando boletos...");
      if (
        !carroCompras ||
        (Object.keys(carroCompras).length === 0 && !buyerInfo.email)
      ) {
        console.error("No hay datos de compras para generar boletos");
        return;
      }

      const response = await fetch("/api/generar-boletos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketData: carroCompras,
          email: buyerInfo.email,
          authCode: flowOrder,
          token: token,
        }),
      });

      console.log("Body para generar boletos:", {
        ticketData: carroCompras,
        email: buyerInfo.email,
        authCode: flowOrder,
        token: token,
      });

      const result = await response.json();
      console.log("Resultado de la generación de boletos:", result);

      if (response.ok) {
        setGeneratedTickets(result.tickets);
        console.log("Boletos generados y guardados", result.tickets);
      } else {
        console.error("Error:", result);
      }
    } catch (error) {
      console.error("Error en generarBoletos:", error);
    }
  };

  const descargarBoletos = () => {
    try {
      console.log("Descargando boletos...");
      if (!generatedTickets || generatedTickets.length === 0) {
        return;
      }
      generatedTickets.forEach((ticket) => {
        downloadTicket(ticket.base64, ticket.fileName);
      });
    } catch (error) {
      console.error("Error al descargar los boletos:", error);
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
                <th scope="col">Cantidad Boletos</th>
                <th scope="col">Monto</th>
                <th scope="col">Ver boletos</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.loader}></div>
                  </td>
                </tr>
              ) : (
                MemoizedComponent
              )}
            </tbody>
          </table>
        </div>
        <nav
          className={styles["navigation"]}
          aria-label="Page navigation example"
        >
          <ul className={`pagination ${styles["pagination-css"]}`}>
            {renderPagination()}
          </ul>
        </nav>
        {mostrarPopup && (
          <Popup
            modalKey={ModalEntities.detail_ticket}
            modalClose={cerrarPopup}
            modalBody={tablaArmada}
            modalMethods={cerrarPopup}
          />
        )}
      </div>
    </>
  );
};

export default HistorialCompra;
