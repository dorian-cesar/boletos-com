import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  BuscarPlanillaVerticalDTO,
  BuscarPlanillaVerticalOpenPaneDTO,
} from "dto/MapaAsientosDTO";
import { LiberarAsientoDTO, TomaAsientoDTO } from "dto/TomaAsientoDTO";
import styles from "./Parrilla.module.css";
import { AsientoDTO } from "dto/AsientoDTO";

import { useSelector, useDispatch } from "react-redux";
import {
  agregarServicio,
  eliminarServicio,
  limpiarListaCarrito,
} from "store/usuario/compra-slice";
import { toast } from "react-toastify";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/svg-arrow.css";
import "tippy.js/animations/shift-away-subtle.css";
import { roundArrow } from "tippy.js";

import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

import { generateToken } from "utils/jwt-auth";

import { decryptData } from "utils/encrypt-data";
import LocalStorageEntities from "entities/LocalStorageEntities";
import Image from "next/image";

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

const ASIENTO_LIBRE = "available";
const ASIENTO_LIBRE_MASCOTA = "pet-free";
const STAGE_BOLETO_IDA = 0;
const STAGE_BOLETO_VUELTA = 1;
const ASIENTO_TIPO_MASCOTA = "pet";
const ASIENTO_TIPO_ASOCIADO = "asociado";
const ASIENTO_OCUPADO = "hold";
const ASIENTO_OCUPADO_MASCOTA = "pet-busy";
const MAXIMO_COMPRA_ASIENTO = 4;

const Parrilla = (props) => {
  const buttonRef = useRef();

  const carroCompras = useSelector((state) => state.compra?.listaCarrito) || [];
  console.log("carroCompras: ", carroCompras);
  const dispatch = useDispatch();

  const {
    isShowParrilla = false,
    parrilla,
    stage,
    setParrilla,
    setIsLoading,
    setModalMab,
    setIsOpened,
  } = props;

  // console.log(`Parrilla props: `, props);

  const [openPane, setOpenPane] = useState(false);
  const [key, setKey] = useState(null);
  const [totalPagar, setTotalPagar] = useState(0);
  const [piso, setPiso] = useState(1);
  const [asientos1, setAsientos1] = useState([]);
  const [asientos2, setAsientos2] = useState([]);
  const [cantidadIda, setCantidadIda] = useState(0);
  const [cantidadVuelta, setCantidadVuelta] = useState(0);

  const [validationCheckInfo, setValidationCheckInfo] = useState(false);
  const [user, setUser] = useState();
  const [shouldRender, setShouldRender] = useState(isShowParrilla);

  useEffect(() => {
    const user = decryptData(LocalStorageEntities.user_auth);
    setUser(user);
  }, []);

  // const clpFormat = new Intl.NumberFormat("es-CL", {
  //   style: "currency",
  //   currency: "CLP",
  // });

  const formatGuarani = (value) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      currencyDisplay: "symbol",
    })
      .format(value)
      .replace(/Gs\.?|PYG/, "₲");

  useEffect(() => {
    if (isShowParrilla && !parrilla.length) {
      setOpenPaneRoot(props.k);
    }
  }, [isShowParrilla]);

  useEffect(() => {
    // setKey(
    //   `${props?.thisParrilla?.terminalOrigin.replace(
    //     /\s+/g,
    //     ""
    //   )}-${props?.thisParrilla?.terminalDestination.replace(/\s+/g, "")}`
    // );
    setKey(props?.thisParrilla?.id);
  }, []);

  useEffect(() => {
    // setKey(
    //   `${props?.thisParrilla?.terminalOrigin.replace(
    //     /\s+/g,
    //     ""
    //   )}-${props?.thisParrilla?.terminalDestination.replace(/\s+/g, "")}`
    // );
    setKey(props?.thisParrilla?.id);
  }, [stage, parrilla]);

  useEffect(() => {
    let dataIda = [];
    let dataVuelta = [];

    Object.entries(carroCompras).map(([key, value]) => {
      if (value.ida) dataIda.push(value.ida);
      if (value.vuelta) dataVuelta.push(value.vuelta);
    });

    let cantidadAsientosIda = 0;
    if (dataIda.length > 0) {
      dataIda.forEach((servicioIda) => {
        Object.entries(servicioIda).map(([key, value]) => {
          value.asientos.forEach((_) => (cantidadAsientosIda += 1));
        });
      });
    }
    setCantidadIda(cantidadAsientosIda);

    let cantidadAsientosVuelta = 0;
    if (dataVuelta.length > 0) {
      dataVuelta.forEach((servicioVuelta) => {
        Object.entries(servicioVuelta).map(([key, value]) => {
          value.asientos.forEach((_) => (cantidadAsientosVuelta += 1));
        });
      });
    }
    setCantidadVuelta(cantidadAsientosVuelta);
  }, [carroCompras]);

  useEffect(() => actualizarTotalPagar(), [carroCompras]);

  useEffect(() => {
    if (isShowParrilla) {
      setShouldRender(true);
    }
  }, [isShowParrilla]);

  const onAnimationEnd = () => {
    if (!isShowParrilla) {
      setShouldRender(false);
    }
  };

  let asientosPorServicio = [];

  function actualizarTotalPagar() {
    let total = 0;
    Object.keys(carroCompras).forEach((servicios) => {
      carroCompras[servicios]?.ida?.forEach(
        (servicioIda) =>
          (total += servicioIda.asientos.reduce(
            (acc, asiento) => acc + asiento.valorAsiento,
            0
          ))
      );
      carroCompras[servicios]?.vuelta?.forEach(
        (servicioVuelta) =>
          (total += servicioVuelta.asientos.reduce(
            (acc, asiento) => acc + asiento.valorAsiento,
            0
          ))
      );
    });
    setTotalPagar(total);
  }

  function obtenerAsientosSeleccionados() {
    const returnedArray = [];
    if (carroCompras[key]) {
      if (carroCompras[key][stage === 0 ? "ida" : "vuelta"]) {
        carroCompras[key][stage === 0 ? "ida" : "vuelta"].filter((carro) => {
          if (
            carro.id === props.thisParrilla.id &&
            carro.date === props.thisParrilla.date
          ) {
            carro.asientos.forEach((carro) => {
              returnedArray.push({
                ...carro,
                estado: "seleccion",
              });
            });
          }
        });
      }
    }
    asientosPorServicio = returnedArray;
    return returnedArray;
  }

  const asientoClass = (asiento, indexParrilla) => {
    try {
      let asientosSeleccionados = obtenerAsientosSeleccionados() || [];

      let isSelected = false,
        isPetSelected = false;

      if (asientosSeleccionados.length > 0) {
        const findAsiento = asientosSeleccionados.find(
          (i) => i.asiento === asiento.asiento
        );
        if (findAsiento) {
          asiento = findAsiento;
        }
        isSelected = asientosSeleccionados.includes(
          (i) => i.asiento === asiento && asiento.tipo !== "pet-busy"
        );
        isPetSelected = asientosSeleccionados.includes(
          (i) => i.asiento === asiento && asiento.estado === "pet-busy"
        );
      }

      let classes = "";
      if (asiento.estado === "seleccion") {
        classes += styles["seleccion"] + " ";
      }

      // if (asiento.estado === "seleccion-mascota") {
      //   classes += styles["m-seleccion"] + " ";
      // }

      // if (asiento.tipo === "pet" && asiento.estado === "hold") {
      //   classes += styles["m-disponible"] + " ";
      // }

      // if (asiento.tipo === "pet" && asiento.estado === "pet-free") {
      //   classes += styles["m-disponible"] + " ";
      // }

      // if (
      //   asiento.estado === "pet-busy" &&
      //   !asientosSeleccionados.find((i) => i.asiento === asiento.asiento)
      // ) {
      //   classes += styles["m-reservado"] + " ";
      // }

      if (asiento.estado === "hold" || asiento.estado === "paid") {
        classes += styles["reservado"] + " ";
      }

      if (asiento.estado === "available") {
        classes += styles["disponible"] + " ";
      }

      if (asiento.asiento === "B1" || asiento.asiento === "B2") {
        classes += styles["bano"] + " ";
      }

      if (asiento.asiento === "") {
        classes += styles["vacio"] + " ";
      }

      return classes.trim();
    } catch (error) {
      console.log(
        `Error al obtener clases para el asiento ${JSON.stringify(asiento)}`
      );
      console.log(obtenerAsientosSeleccionados());
      console.error(`Error al obtener clases de asiento [${error}]`);
    }
  };

  async function reloadPane(indexParrilla) {
    try {
      const parrillaTemporal = [...parrilla.parrilla];

      const request = CryptoJS.AES.encrypt(
        JSON.stringify(new BuscarPlanillaVerticalOpenPaneDTO(parrilla)),
        secret
      );

      const response = await fetch(`/api/ticket_sale/mapa-asientos`, {
        method: "POST",
        body: JSON.stringify({ data: request.toString() }),
      });

      const data = await response.json();
      const dataAsientos1 = data.seats.firstFloor;
      const dataAsientos2 = data.seats.secondFloor;

      console.log(
        `Recargando panel para el servicio ${parrillaTemporal[indexParrilla].idParrilla} -  Data: `,
        data
      );

      let nuevaParrilla = { ...parrillaTemporal[indexParrilla] };
      nuevaParrilla.loadingAsientos = false;
      nuevaParrilla.asientos1 = dataAsientos1;
      nuevaParrilla.asientos2 = dataAsientos2;
      // if (!!parrillaTemporal[indexParrilla].seats.secondFloor) {
      //   nuevaParrilla.asientos2 = dataAsientos2;
      // }
      // if (
      //   Array.isArray(parrillaTemporal[indexParrilla].seats.secondFloor) &&
      //   parrillaTemporal[indexParrilla].seats.secondFloor.length > 0
      // ) {
      //   nuevaParrilla.asientos2 = dataAsientos2;
      // }
      parrillaTemporal[indexParrilla] = nuevaParrilla;
      setParrilla(parrillaTemporal);
    } catch ({ message }) {
      console.error(`Error al recargar panel [${message}]`);
    }
  }

  async function servicioTomarAsiento(
    parrillaServicio,
    asiento,
    piso,
    asientosTemporal,
    isMascota = false
  ) {
    try {
      const token = generateToken();

      const request = CryptoJS.AES.encrypt(
        JSON.stringify(
          new TomaAsientoDTO(parrillaServicio, "", "", asiento, piso, stage)
        ),
        secret
      );

      const response = await fetch(`/api/ticket_sale/tomar-asiento-v2`, {
        method: "POST",
        body: JSON.stringify({ data: request.toString() }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      const reserva = data;
      console.log("reserva data: ", reserva);
      console.log("parrillaServicio", parrillaServicio);

      if (!reserva.success || reserva.success === false || reserva.error) {
        toast.error(
          "El asiento seleccionado ya se encuentra reservado. Porfavor seleccione otro asiento",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
          }
        );
        await reloadPane(parrillaServicio.idParrilla - 1);
        setIsOpened(false);
        setTimeout(() => setIsOpened(true), 0);
        throw new Error("Asiento tomado");
      }

      if (reserva.success === true) {
        if (isMascota) setModalMab(true);
        asientosTemporal.push(
          new AsientoDTO(reserva, parrillaServicio, asiento, piso)
        );
        return asientosTemporal;
      }
    } catch ({ message }) {
      throw new Error(`Error al reservar asociado/mascota [${message}]`);
    }
  }

  async function tomarAsiento(asiento, viaje, indexParrilla, piso) {
    try {
      if (asiento.valorAsiento === 0) {
        toast.error("No puede seleccionar asiento sin valor", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      if (validationCheckInfo) {
        return;
      }

      if (!user) {
        // buttonRef.current.click();
        // return;
      }

      if (asiento.estado === "sinasiento" || !asiento.asiento) return;

      // asiento["piso"] = piso;
      // asiento["claseBus"] =
      //   piso === 1
      //     ? props.thisParrilla.seatDescriptionFirst
      //     : props.thisParrilla.seatDescriptionSecond;
      // asiento["idaVuelta"] = stage ? true : false;
      // asiento["tipoMascota"] = false;
      // asiento["relacionAsiento"] = asiento.asientoAsociado
      //   ? asiento.asientoAsociado
      //   : "";

      const carrito = {
        servicio: parrilla.parrilla[indexParrilla],
        asiento,
        tipoServicio: stage === 0 ? "ida" : "vuelta",
      };

      setIsLoading(true);

      let asientosTemporal = asientosPorServicio || [];

      const asientoSeleccionado = asientosTemporal?.find(
        (asientoBusqueda) => asiento.asiento == asientoBusqueda?.asiento
      );

      const className = asientoClass(asiento);

      if (
        asiento.estado === ASIENTO_LIBRE &&
        // asiento.estado === ASIENTO_LIBRE_MASCOTA ||
        className.includes(styles["disponible"])
        // asiento.style === styles["m-disponible"]
      ) {
        if (asiento.tipo === ASIENTO_TIPO_MASCOTA) {
          setModalMab(true);
        }

        if (stage === STAGE_BOLETO_VUELTA) {
          let dataVuelta = [];
          let cantidadAsientos = 0;
          Object.entries(carroCompras).map(([key, value]) => {
            dataVuelta = value.vuelta || [];
          });
          Object.entries(dataVuelta).map(([key, value]) => {
            value.asientos.forEach((element) => {
              cantidadAsientos = cantidadAsientos + 1;
            });
          });
          if (cantidadIda === cantidadAsientos) {
            toast.warn(
              `El número de asientos de regreso no puede exceder la cantidad de asientos seleccionados para el viaje de ida.`,
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
              }
            );
            setIsLoading(false);
            return;
          }
        }

        if (!validarMaximoAsientos(asientosTemporal, asiento)) return;
        asientosTemporal = await servicioTomarAsiento(
          props.thisParrilla,
          asiento.asiento,
          piso,
          asientosTemporal
        );

        if (
          asiento.tipo == ASIENTO_TIPO_ASOCIADO ||
          asiento.tipo == ASIENTO_TIPO_MASCOTA
        ) {
          asientosTemporal = await servicioTomarAsiento(
            props.thisParrilla,
            asiento.asientoAsociado,
            piso,
            asientosTemporal,
            true
          );
        }

        dispatch(agregarServicio(carrito));

        if (asiento.asientoAsociado) {
          const newCarrito = {
            ...carrito,
            asiento: asignarAsientoAsociado(asiento),
          };
          newCarrito.asiento = {
            ...newCarrito.asiento,
            piso,
            claseBus:
              piso === 1
                ? props.thisParrilla.seatDescriptionFirst
                : props.thisParrilla.seatDescriptionSecond,
            tipoMascota: true,
          };

          if (newCarrito.asiento) dispatch(agregarServicio(newCarrito));
        }
        setIsLoading(false);
        await reloadPane(indexParrilla);
        return;
      }

      if (
        asiento.estado == ASIENTO_OCUPADO ||
        // asiento.estado == ASIENTO_OCUPADO_MASCOTA ||
        className.includes(styles["seleccion"])
        // asiento.style === styles["m-seleccion"]
      ) {
        if (asientoSeleccionado) {
          await servicioLiberarAsiento(carrito, asiento.asiento, 1, piso);

          if (
            asiento.tipo == ASIENTO_TIPO_ASOCIADO ||
            asiento.tipo == ASIENTO_TIPO_MASCOTA
          ) {
            await servicioLiberarAsiento(
              carrito,
              asiento.asientoAsociado,
              1,
              piso
            );
          }

          dispatch(eliminarServicio(carrito));
          if (stage === STAGE_BOLETO_VUELTA) {
            setCantidadVuelta(cantidadVuelta - 1);
          }
          if (stage === STAGE_BOLETO_IDA) {
            const valorNuevo = cantidadIda - 1;
            if (valorNuevo <= 0) {
              dispatch(limpiarListaCarrito());
            }
            setCantidadIda(valorNuevo);
          }

          if (asiento.asientoAsociado) {
            const newCarrito = {
              ...carrito,
              asiento: asignarAsientoAsociado(asiento),
            };
            if (newCarrito.asiento) dispatch(eliminarServicio(newCarrito));
            if (stage === STAGE_BOLETO_VUELTA) {
              const valorNuevo = cantidadVuelta - 1;
              setCantidadVuelta(valorNuevo);
            }
            if (stage === STAGE_BOLETO_IDA) {
              const valorNuevo = cantidadIda - 1;
              if (valorNuevo <= 0) {
                dispatch(limpiarListaCarrito());
              }
              setCantidadIda(valorNuevo);
            }
          }
          setIsLoading(false);
          await reloadPane(indexParrilla);
          return;
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    } catch ({ message }) {
      console.error(`Error al tomar asiento [${message}]`);
      await reloadPane(indexParrilla);
      setIsLoading(false);
    }
  }

  function asignarAsientoAsociado(asiento) {
    const asientos = [];
    props.thisParrilla.asientos1.map((array) =>
      array.map((asiento) => asientos.push(asiento))
    );

    if (props.thisParrilla.asientos2) {
      props.thisParrilla.asientos2.map((array) =>
        array.map((asiento) => asientos.push(asiento))
      );
    }

    const asientoAsociado = asientos.find(
      (i) => i.asiento === asiento.asientoAsociado
    );
    if (asientoAsociado) {
      return asientoAsociado;
    }
  }

  async function servicioLiberarAsiento(
    parrillaServicio,
    asiento,
    codigoReserva,
    piso
  ) {
    try {
      const { data } = await axios.post(
        "/api/ticket_sale/liberar-asiento",
        new LiberarAsientoDTO(parrillaServicio, asiento, codigoReserva, piso)
      );
      return data;
    } catch ({ message }) {
      throw new Error(`Error al liberar asiento [${message}]`);
    }
  }

  function validarMaximoAsientos(asientos, asientoSeleccion) {
    const cantidadAsientos = asientos.length;

    if (cantidadAsientos >= MAXIMO_COMPRA_ASIENTO) {
      toast.warn(`Máximo ${MAXIMO_COMPRA_ASIENTO} pasajes`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
      });
      setIsLoading(false);
      return false;
    }

    if (
      asientoSeleccion.asientoAsociado &&
      cantidadAsientos + 1 >= MAXIMO_COMPRA_ASIENTO
    ) {
      toast.warn(
        `Asiento seleccionado superara el máximo de compra permitido`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
      setIsLoading(false);
      return false;
    }

    let cantidadServicios = 0;
    Object.entries(carroCompras).forEach(([key, value]) => {
      if (value.hasOwnProperty(stage === 0 ? "ida" : "vuelta")) {
        cantidadServicios += value[stage === 0 ? "ida" : "vuelta"].length;
      }
    });

    if (cantidadServicios >= MAXIMO_COMPRA_ASIENTO) {
      toast.warn(`Sólo puede elegir ${MAXIMO_COMPRA_ASIENTO} servicios`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
      });
      setIsLoading(false);
      return false;
    }

    return true;
  }

  async function setOpenPaneRoot(indexParrilla) {
    try {
      const parrillaTemporal = [...parrilla.parrilla];
      const parrillaModificada = [...parrilla.parrilla];
      // console.log("parrillaTemporal", parrillaTemporal)
      // console.log("parrillaModificada", parrillaModificada)

      if (parrilla.parrilla[indexParrilla].idParrilla == openPane) {
        return;
      }

      const request = CryptoJS.AES.encrypt(
        JSON.stringify(new BuscarPlanillaVerticalOpenPaneDTO(parrilla)),
        secret
      );

      const response = await fetch(`/api/ticket_sale/mapa-asientos`, {
        method: "POST",
        body: JSON.stringify({ data: request.toString() }),
      });

      const data = await response.json();
      const dataAsientos1 = data.seats.firstFloor;
      const dataAsientos2 = data.seats.secondFloor;

      // console.log("asientos1: ", dataAsientos1);
      // console.log("asientos2: ", dataAsientos2);

      console.log(
        `Abriendo panel para el servicio ${parrillaTemporal[indexParrilla].idParrilla} - Data: `,
        data
      );

      parrillaModificada[indexParrilla].loadingAsientos = false;
      parrillaModificada[indexParrilla].asientos1 = dataAsientos1;
      parrillaModificada[indexParrilla].asientos2 = dataAsientos2;
      parrillaTemporal[indexParrilla].asientos1 = dataAsientos1;
      parrillaTemporal[indexParrilla].asientos2 = dataAsientos2;
      // if (!!parrillaTemporal[indexParrilla].props.asientos2) {
      //   parrillaModificada[indexParrilla].asientos2 = dataAsientos2;
      // }
      // if (
      //   Array.isArray(parrillaTemporal[indexParrilla].props.asientos2) &&
      //   parrillaTemporal[indexParrilla].props.asientos2.length > 0
      // ) {
      //   parrillaModificada[indexParrilla].asientos2 = dataAsientos2;
      // }
      setParrilla(parrillaModificada);
    } catch ({ message }) {
      console.error(`Error al abrir el panel [${message}]`);
    }
  }

  function getImage(sit, indexParrilla) {
    let asientosSeleccionados = obtenerAsientosSeleccionados() || [];

    if (asientosSeleccionados.length > 0) {
      const findAsiento = asientosSeleccionados.find(
        (i) => i.asiento === sit.asiento
      );
      if (findAsiento) sit = findAsiento;
    }

    if (sit.asiento === "B1" || sit.asiento === "B2") {
      return "img/a-bano.svg";
    }
    if (sit.estado === "seleccion") {
      return "img/asiento_seleccionado.svg";
    }
    if (sit.estado === "available" && sit.valorAsiento > 0) {
      return "img/asiento_disponible.svg";
    }
    if (sit.estado === "hold" || sit.estado === "paid") {
      return "img/asiento_ocupado.svg";
    }
    if (sit.tipo === "pet" && sit.estado === "pet-free") {
      return "img/a-pet-disponible.svg";
    }
    if (sit.tipo === "pet" && sit.estado === "pet-busy") {
      return "img/a-pet-reservado.svg";
    }
    if (sit.tipo === "pet" && sit.estado === "seleccion-mascota") {
      return "img/a-pet-seleccionado.svg";
    }
    if (sit.estado === "available" && sit.valorAsiento === 0) {
      return "img/asiento_disponible.svg";
    }
  }

  function cantidadAsientosSeleccionados() {
    return asientosPorServicio.filter(
      (i) =>
        i.idServicio === props.thisParrilla.idServicio &&
        i.fechaServicio === props.thisParrilla.fechaServicio
    ).length;
  }

  function validarAsientosTomados() {
    if (stage === STAGE_BOLETO_IDA) {
      if (cantidadIda === 0) {
        toast.warn(`Seleccione al menos un asiento para continuar`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return false;
      }
    }
    if (stage === STAGE_BOLETO_VUELTA) {
      if (cantidadVuelta === 0) {
        toast.warn(`Seleccione al menos un asiento para continuar`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return false;
      }
      if (cantidadIda > cantidadVuelta) {
        toast.warn(
          // `La cantidad de asientos de regreso debe coincidir con la cantidad de asientos seleccionados para el viaje de ida.`,
          `Los asientos de regreso deben coincidir con la cantidad de asientos de ida`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
          }
        );
        return false;
      }
    }
    return true;
  }

  const rellenaEspaciosVacios = (cantidad, largoAsietos) => {
    if (!cantidad || !largoAsietos) return;
    const total = cantidad - largoAsietos;
    return Array.from(Array(total < 0 ? 0 : total), (e, i) => {
      const uuid = uuidv4();
      return (
        <div key={uuid} className="col-12 row justify-content-evenly">
          <div className="col-2 empty-seat"></div>
          <div className="col-2 empty-seat"></div>
          <div className="col-2 empty-seat"></div>
          <div className="col-2 empty-seat"></div>
        </div>
      );
    });
  };

  const colorTexto = (asiento) => {
    const asientosSeleccionados = obtenerAsientosSeleccionados() || [];

    if (asientosSeleccionados.length > 0) {
      const findAsiento = asientosSeleccionados.find(
        (i) => i.asiento === asiento.asiento
      );
      if (findAsiento) asiento = findAsiento;
    }

    if (
      asiento?.estado.includes("seleccion") ||
      asiento?.estado.includes("seleccion-mascota")
    ) {
      return "text-secondary";
    } else if (
      asiento?.estado.includes("available") ||
      asiento?.estado.includes("free")
    ) {
      return "text-primary";
    } else if (
      asiento?.estado.includes("hold") ||
      asiento?.estado.includes("busy")
    ) {
      return "text-info";
    } else {
      return "";
    }
  };

  const handleNextStep = (e) => {
    try {
      e.stopPropagation();

      const asientosTomados = validarAsientosTomados();

      if (asientosTomados) {
        try {
          props.buttonCloseModalRef.current.click();
        } catch (error) {}

        props.setPasaje(props);
      }
    } catch (error) {}
  };

  return (
    <>
      {shouldRender && (
        <section
          className={`${styles["grill-detail"]} ${
            isShowParrilla ? styles.show : ""
          }`}
          onAnimationEnd={onAnimationEnd}
        >
          <div className="d-none">
            <input
              type="checkbox"
              name="honeypot"
              checked={validationCheckInfo}
              onChange={() => setValidationCheckInfo(!validationCheckInfo)}
            />
          </div>
          <div className={styles["cross-container"]}>
            <img
              src="img/close.svg"
              className={styles["cross"]}
              onClick={() => props.setIsOpened(false)}
            />
          </div>

          {/* Mapa asientos vertical -> MOBILE <- */}
          <div className="d-flex d-md-none row justify-content-evenly">
            <div className="col-12 align-self-center d-flex flex-col gap-4 p-0">
              <ul className="list-group list-group-horizontal justify-content-evenly mx-3 mb-4">
                <li className="list-group-item d-flex gap-2 align-items-center border-0 p-0">
                  <Image
                    src="img/ui/service-availability/radio-button-available-outline.svg"
                    alt="Logo asiento disponible"
                    width={16}
                    height={16}
                  />
                  <span>Disponible</span>
                </li>
                <li className="list-group-item d-flex gap-2 align-items-center border-0 p-0">
                  <Image
                    src="img/ui/service-availability/radio-button-selected-outline.svg"
                    alt="Logo asiento seleccionado"
                    width={16}
                    height={16}
                  />
                  <span>Seleccionado</span>
                </li>
                <li className="list-group-item d-flex gap-2 align-items-center border-0 p-0">
                  <Image
                    src="img/ui/service-availability/radio-button-unavailable-outline.svg"
                    alt="Logo asiento no disponible"
                    width={16}
                    height={16}
                  />
                  <span>Reservado</span>
                </li>
              </ul>
              {/* TODO: Habilitar a futuro para cuando sea MAB */}
              {/* <ul className="list-group">
                    <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                        <Image src="img/ui/service-availability/radio-button-mab-available-outline.svg" alt="Logo asiento mascota disponible" width={ 16 } height={ 16 }/>
                        <span>Disponible</span>
                    </li>
                    <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                        <Image src="img/ui/service-availability/radio-button-mab-selected-outline.svg" alt="Logo asiento mascota seleccionado" width={ 16 } height={ 16 }/>
                        <span>Seleccionado</span>
                    </li>
                    <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                        <Image src="img/ui/service-availability/radio-button-mab-unavailable-outline.svg" alt="Logo asiento mascota no disponible" width={ 16 } height={ 16 }/>
                        <span>Reservado</span>
                    </li>
                </ul> */}
            </div>
            <div className="col-12 bg-bus rounded py-3 mh-4 p-0 w-50">
              <div className="container">
                <div className="row justify-content-center">
                  <img
                    className="col-12"
                    src="img/ui/service-components/line-floor-h.svg"
                  />
                  {piso === 1 && (
                    <div className="col-10 py-1">
                      <img src="img/ui/service-components/steering-wheel.svg" />
                    </div>
                  )}
                  <div className="col-12 row">
                    <div className="col-3 empty-seat"></div>
                    <div className="col-3 empty-seat"></div>
                    <div className="col-3 empty-seat"></div>
                    <div className="col-3 empty-seat"></div>
                  </div>
                  {props.asientos1 && piso === 1 && (
                    <>
                      {rellenaEspaciosVacios(7, props.asientos1.length)}
                      {piso === 1 &&
                        props.asientos1.map(
                          (asientosPiso1, indexAsientosPiso1) => {
                            return (
                              <div
                                key={`${indexAsientosPiso1}-fila-asientos-piso-1`}
                                className="col-12 row justify-content-evenly flex-row-reverse"
                              >
                                {asientosPiso1.map(
                                  (asientoPiso1, indexAsientoPiso1) => {
                                    return (
                                      <div
                                        key={`${indexAsientoPiso1}-asiento-piso-1`}
                                        className="col-2 p-0 py-1 d-flex justify-content-center position-relative"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          tomarAsiento(
                                            asientoPiso1,
                                            props,
                                            props.k,
                                            1
                                          );
                                        }}
                                      >
                                        <span
                                          className={`position-absolute top-50 start-50 translate-middle fs-7 fw-bold ${colorTexto(
                                            asientoPiso1 || ""
                                          )}`}
                                        >
                                          {asientoPiso1?.asiento &&
                                            asientoPiso1.estado !==
                                              "sinasiento" &&
                                            asientoPiso1?.asiento}
                                        </span>
                                        {asientoPiso1.asiento && (
                                          <img
                                            className="img-fluid rotate-90"
                                            src={getImage(
                                              asientoPiso1,
                                              props.k
                                            )}
                                          />
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            );
                          }
                        )}
                      {rellenaEspaciosVacios(7, props.asientos1.length)}
                    </>
                  )}
                  {props.asientos2 && piso === 2 && (
                    <>
                      {piso === 2 &&
                        props.asientos2.map(
                          (asientosPiso2, indexAsientosPiso2) => {
                            return (
                              <div
                                key={`${indexAsientosPiso2}-fila-asientos-piso-2`}
                                className="col-12 row justify-content-evenly flex-row-reverse"
                              >
                                {asientosPiso2.map(
                                  (asientoPiso2, indexAsientoPiso2) => {
                                    return (
                                      <div
                                        key={`${indexAsientoPiso2}-asiento-piso-2`}
                                        className="col-2 p-0 py-1 d-flex justify-content-center position-relative"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          tomarAsiento(
                                            asientoPiso2,
                                            props,
                                            props.k,
                                            2
                                          );
                                        }}
                                      >
                                        <span
                                          className={`position-absolute top-50 start-50 translate-middle fs-7 fw-bold ${colorTexto(
                                            asientoPiso2 || ""
                                          )}`}
                                        >
                                          {asientoPiso2?.asiento &&
                                            asientoPiso2.estado !==
                                              "sinasiento" &&
                                            asientoPiso2?.asiento}
                                        </span>
                                        {asientoPiso2.asiento && (
                                          <img
                                            className="img-fluid rotate-90"
                                            src={getImage(
                                              asientoPiso2,
                                              props.k
                                            )}
                                          />
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            );
                          }
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mapa asientos horizontal -> DESKTOP <- */}
          <div className={`d-none d-md-flex ${styles["disponibilidad-bus"]}`}>
            <div className={`${styles["bus"]} ${styles["piso-1"]}`}>
              {piso === 1 && (
                <img
                  src="img/line.svg"
                  alt="piso-1"
                  className={styles["linea-piso-1"]}
                />
              )}
              <div className={styles["contenedor-bus"]}>
                {piso === 1 && (
                  <div className={styles["fila"]}>
                    <img
                      className={styles["imagen-volante"]}
                      src="img/volante.svg"
                      alt="Volante conductor"
                      // onClick={() => console.log(totalCompra)}
                    />
                  </div>
                )}
                <div className={`${styles["fila"]} ${styles["fila-vacia"]}`}>
                  <div className={styles["columna"]}></div>
                  <div className={styles["columna"]}></div>
                  <div className={styles["columna"]}></div>
                  <div className={styles["columna"]}></div>
                  <div className={styles["columna"]}></div>
                </div>
                {props.asientos1
                  ? piso === 1 && (
                      <>
                        {/* {function () {
                          let max = 7 - props.asientos1.length;
                          let n = 0;
                          let liens = [];
                          while (n < max) {
                            liens.push(
                              <div
                                key={`fila-asiento-${n}`}
                                className={styles["fila"]}
                              ></div>
                            );
                            n++;
                          }
                          return liens;
                        }.call(this)}
                        {props.asientos1.map((i, k) => {
                          return (
                            <div
                              key={`fila-asiento-${k}`}
                              className={styles["fila"]}
                            >
                              {i.map((ii, kk) => {
                                return (
                                  <div
                                    key={`columna-asiento-${kk}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      tomarAsiento(ii, props, props.k, 1);
                                    }}
                                    className={`${
                                      styles["columna"]
                                    } ${asientoClass(ii, props.k)} `}
                                  >
                                    {ii.asiento && (
                                      <img src={getImage(ii, props.k)} />
                                    )}
                                    <span>
                                      {ii.asiento != "B1" &&
                                      ii.asiento != "B2" &&
                                      ii.estado != "sinasiento"
                                        ? ii.asiento
                                        : ""}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                        {function () {
                          let max = 7 - props.asientos1.length;
                          let n = 0;
                          let liens = [];
                          while (n < max) {
                            liens.push(
                              <div
                                key={`fila-asiento-${n}`}
                                className={styles["fila"]}
                              ></div>
                            );
                            n++;
                          }
                          return liens;
                        }.call(this)} */}
                        {props.asientos1.map((i, k) => (
                          <div
                            key={`fila-asiento-${k}`}
                            className={styles["fila"]}
                          >
                            {i.map((ii, kk) =>
                              ii.estado === "hold" || ii.estado === "paid" ? (
                                <div
                                  key={`columna-asiento-${kk}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    tomarAsiento(ii, props, props.k, 1);
                                  }}
                                  className={`${
                                    styles["columna"]
                                  } ${asientoClass(ii, props.k)}`}
                                >
                                  {ii.asiento && (
                                    <img src={getImage(ii, props.k)} />
                                  )}
                                  <span>
                                    {ii.asiento !== "B1" &&
                                    ii.asiento !== "B2" &&
                                    ii.estado !== "sinasiento"
                                      ? ii.asiento
                                      : ""}
                                  </span>
                                </div>
                              ) : (
                                <Tippy
                                  key={`columna-asiento-${kk}`}
                                  content={
                                    <div>
                                      <strong>Asiento:</strong> {ii.asiento}{" "}
                                      <br />
                                      <strong>Estado:</strong> {ii.estado}{" "}
                                      <br />
                                      <strong>Precio:</strong>{" "}
                                      {ii.valorAsiento
                                        ? formatGuarani(ii.valorAsiento)
                                        : "N/A"}
                                    </div>
                                  }
                                  placement="top"
                                  animation="shift-away-subtle"
                                  arrow={roundArrow}
                                  theme="custom-bus"
                                  offset={[0, 15]}
                                >
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      tomarAsiento(ii, props, props.k, 1);
                                    }}
                                    className={`${
                                      styles["columna"]
                                    } ${asientoClass(ii, props.k)}`}
                                  >
                                    {ii.asiento && (
                                      <img src={getImage(ii, props.k)} />
                                    )}
                                    <span>
                                      {ii.asiento !== "B1" &&
                                      ii.asiento !== "B2" &&
                                      ii.estado !== "sinasiento"
                                        ? ii.asiento
                                        : ""}
                                    </span>
                                  </div>
                                </Tippy>
                              )
                            )}
                          </div>
                        ))}
                      </>
                    )
                  : ""}
                {props.asientos2
                  ? piso === 2 && (
                      <>
                        {/* {props.asientos2.map((i, k) => {
                          return (
                            <div
                              key={`fila-asiento-${k}`}
                              className={styles["fila"]}
                            >
                              {i.map((ii, kk) => {
                                return (
                                  <div
                                    key={`columna-asiento-${kk}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      tomarAsiento(ii, props, props.k, 2);
                                    }}
                                    className={`${
                                      styles["columna"]
                                    } ${asientoClass(ii, props.k)} `}
                                  >
                                    {ii.asiento && (
                                      <img src={getImage(ii, props.k)} />
                                    )}
                                    <span>
                                      {ii.asiento != "B1" &&
                                      ii.asiento != "B2" &&
                                      ii.estado != "sinasiento"
                                        ? ii.asiento
                                        : ""}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                        {function () {
                          let max = 10 - props.asientos2.length;
                          let n = 0;
                          let liens = [];
                          while (n < max) {
                            liens.push(
                              <div
                                key={`fila-asiento-${n}`}
                                className={styles["fila"]}
                              ></div>
                            );
                            n++;
                          }
                          return liens;
                        }.call(this)} */}
                        {props.asientos2.map((i, k) => (
                          <div
                            key={`fila-asiento-${k}`}
                            className={styles["fila"]}
                          >
                            {i.map((ii, kk) =>
                              ii.estado === "hold" || ii.estado === "paid" ? (
                                <div
                                  key={`columna-asiento-${kk}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    tomarAsiento(ii, props, props.k, 2);
                                  }}
                                  className={`${
                                    styles["columna"]
                                  } ${asientoClass(ii, props.k)}`}
                                >
                                  {ii.asiento && (
                                    <img src={getImage(ii, props.k)} />
                                  )}
                                  <span>
                                    {ii.asiento !== "B1" &&
                                    ii.asiento !== "B2" &&
                                    ii.estado !== "sinasiento"
                                      ? ii.asiento
                                      : ""}
                                  </span>
                                </div>
                              ) : (
                                <Tippy
                                  key={`columna-asiento-${kk}`}
                                  content={
                                    <div>
                                      <strong>Asiento:</strong> {ii.asiento}{" "}
                                      <br />
                                      <strong>Estado:</strong> {ii.estado}{" "}
                                      <br />
                                      <strong>Precio:</strong>{" "}
                                      {ii.valorAsiento
                                        ? formatGuarani(ii.valorAsiento)
                                        : "N/A"}
                                    </div>
                                  }
                                  placement="top"
                                  animation="shift-away-subtle"
                                  arrow={roundArrow}
                                  theme="custom-bus"
                                  offset={[0, 15]}
                                >
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      tomarAsiento(ii, props, props.k, 2);
                                    }}
                                    className={`${
                                      styles["columna"]
                                    } ${asientoClass(ii, props.k)}`}
                                  >
                                    {ii.asiento && (
                                      <img src={getImage(ii, props.k)} />
                                    )}
                                    <span>
                                      {ii.asiento !== "B1" &&
                                      ii.asiento !== "B2" &&
                                      ii.estado !== "sinasiento"
                                        ? ii.asiento
                                        : ""}
                                    </span>
                                  </div>
                                </Tippy>
                              )
                            )}
                          </div>
                        ))}
                      </>
                    )
                  : ""}
              </div>
            </div>
            <div className={styles["estados-disponibilidad"]}>
              <div>
                <div className={styles["asiento-disponible"]}></div>
                <span>Disponible</span>
              </div>
              <div>
                <div className={styles["asiento-seleccionado"]}></div>
                <span>Seleccionado</span>
              </div>
              <div>
                <div className={styles["asiento-reservado"]}></div>
                <span>Reservado</span>
              </div>
            </div>
          </div>
          <div className={styles["botones-inferiores"]}>
            <div className={styles["botones-seleccion-piso"]}>
              <div className={styles["seleccion-pisos"]}>
                <div
                  className={`${styles["floor-button"]} ${
                    piso === 1 && styles["floor-button-selected"]
                  }`}
                  onClick={() => setPiso(1)}
                >
                  <span>#Piso 1</span>
                </div>
                {props.asientos2 && props.asientos2.length > 0 ? (
                  <div
                    className={`${styles["floor-button"]} ${
                      piso === 2 && styles["floor-button-selected"]
                    }`}
                    onClick={() => setPiso(2)}
                  >
                    <span>#Piso 2</span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="container">
              <div className={`row ${styles["botones-pago"]} px-2 pb-3`}>
                <div className="col"></div>
                <div className="col-12 col-xs-4 col-sm-4 justify-content-center">
                  <div className="d-grid">
                    <button
                      className="btn btn-primary border-0 rounded-3"
                      onClick={handleNextStep}
                    >
                      Continuar: {formatGuarani(totalPagar)}
                    </button>
                  </div>
                  <div className={styles["texto-cantidad-asientos"]}>
                    <span>
                      Cantidad de asientos seleccionados:{" "}
                      {asientosPorServicio.length}
                    </span>
                  </div>
                  <div
                    className="d-none"
                    ref={buttonRef}
                    data-bs-toggle="modal"
                    data-bs-target="#loginModal"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Parrilla;