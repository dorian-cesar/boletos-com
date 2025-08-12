import React from "react";
import styles from "./Popup.module.css";
import ModalEntities from "../../entities/ModalEntities";

const Popup = ({
  modalKey,
  modalClose,
  modalMethods,
  modalTitleButton,
  modalBody = "",
}) => {
  const popInfo = {
    [ModalEntities.email_success]: {
      title: "Correo enviado exitosamente",
      body: "Hemos enviado una contraseña provisional a tu correo electrónico",
      buttonMessage: "Volver al inicio",
      imageIcon: "",
      onClick: () => {
        window.location.href = "/";
      },
    },
    [ModalEntities.register_success]: {
      title: "¡Felicitaciones!",
      body: "Te has registrado exitosamente.",
      buttonMessage: "Ingresar",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: () => {},
    },
    [ModalEntities.update_success]: {
      title: "¡Actualizamos tus datos!",
      body: "Tu información se ha actualizado correctamente.",
      buttonMessage: "Cerrar",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalClose,
    },
    [ModalEntities.logout]: {
      title: "¿Está seguro de que desea cerrar sesión?",
      body: "",
      buttonMessage: "Cerrar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: () => {},
    },
    [ModalEntities.change_ticket]: {
      title: "¿Estás seguro de cambiar tu boleto? ",
      body: "",
      buttonMessage: "Confirmar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: () => {},
    },
    [ModalEntities.confirm_change]: {
      title: "Cambio de boleto éxitoso",
      body: "",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: () => {},
    },
    [ModalEntities.annulation_purse]: {
      title: "¿Estás seguro de enviar el valor del pasaje al monedero virtual?",
      body: "",
      buttonMessage: "Enviar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: () => {},
    },
    [ModalEntities.annulation_success]: {
      title: "¡Devolución existosa!",
      body: "Hemos enviado el comprobante de devolución del boleto. Recuerda que el tiempo dependerá de la opción seleccionada.",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.confirm_return]: {
      title: "¿Estás seguro de devolver los pasajes? ",
      body: "",
      buttonMessage: "Confirmar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.confirm_success]: {
      title: "¡Devolución existosa!",
      body: "El valor del pasaje se verá reflejado en la facturación de tu cuenta de crédito.",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: () => {},
    },
    [ModalEntities.delete_car]: {
      title: "¡Usuario(a)!",
      body: "Si hay asientos actualmente seleccionados, al realizar una búsqueda para otra fecha, estos asientos serán liberados y se limpiara el carrito. ",
      buttonMessage: "Limpiar y buscar servicios",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.info_bad_return]: {
      title: "¡Usuario(a)!",
      body: "Código de transacción no valido, favor intente nuevamente",
      buttonMessage: "Ok",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.change_password]: {
      title: "¡Contraseña actualizada correctamente!",
      body: "Se ha enviado un correo de confirmación.",
      buttonMessage: "Volver",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.password_not_same]: {
      title: "¡Contraseña nueva incorrecta!",
      body: "Asegurece de escribir la misma contraseña en ambas casillas.",
      buttonMessage: "Ok",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.request_for_help]: {
      title: "¡Solicitud ingresada correctamente!",
      body: "Se enviará un correo con el código de seguimiento",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.request_bad_help]: {
      title: "¡Problemas con la solicitud!",
      body: "Problemas al enviar su solicitud, intente  más tarde.",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.car_live_time_end]: {
      title: "¡Se acabo el tiempo 🥺!",
      body: "Se ha terminado el tiempo para poder realizar su compra",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.exchange_return_information_no_login]: {
      title: "¡Usuario(a)!",
      body: "El saldo a favor será devuelto como dinero a su cuenta wallet, para ello debe iniciar sesión.",
      buttonMessage: modalTitleButton,
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.exchange_return_information_login]: {
      title: "¡Usuario(a)!",
      body: "El saldo a favor será devuelto como dinero a su cuenta wallet.",
      buttonMessage: modalTitleButton,
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.user_ticket_not_equals_buy]: {
      title: "¡Usuario(a)!",
      body: "El correo electronico a la transacción ingresada no corresponde al correo electronico de la cuenta",
      buttonMessage: "Aceptar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.return_to_wallet]: {
      title: "¡Usuario(a)!",
      body: "El monto total de los boletos seleccionados sera abonado a su billetera virtual, podra ver reflejado el monto en su perfil, presione en 'Aceptar' para completar el proceso.",
      buttonMessage: "Aceptar",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.return_to_wallet_success]: {
      title: "¡Usuario(a)!",
      body: "Devolución realizada con exito, será redirigido a su perfil para ver reflejado el saldo nuevo",
      buttonMessage: "Aceptar",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.detail_ticket]: {
      title: "Detalle boletos",
      body: modalBody,
      buttonMessage: "Aceptar",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.detail_coupon]: {
      title: "Detalle cuponera",
      body: modalBody,
      buttonMessage: "Aceptar",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.mobile_purchase_info]: {
      title: "¡ESTAS EN EL NUEVO SITIO WEB!",
      body: "¿Deseas adquirir tus pasajes antes del 21 de mayo? Entra al sitio web antiguo:",
      buttonMessage: "WWW.PULLMANBUS.CL",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.bad_viajes_special]: {
      title: "¡Ups! Hubo un error ",
      body: "No hemos recibido tu correo, intenta nuevamente.",
      buttonMessage: "Volver al formulario",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.correo_viajes_special]: {
      title: "¡Correo Enviado!",
      body: "Hemos recibido tu solicitud. Pronto un ejecutivo comercial se contactará contigo. ",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalMethods,
    },
    [ModalEntities.password_incorrect]: {
      title: "Error al actualizar contraseña",
      body: "La contraseña actual es incorrecta.",
      buttonMessage: "Entendido",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods,
    },
  };

  const handleButtonClick = () => {
    if (popInfo[modalKey]?.onClick) {
      popInfo[modalKey].onClick();
    }
  };

  return (
    <div className={styles["popup-overlay"]}>
      <div
        className={`${styles["popup-container"]} ${
          modalKey === ModalEntities.mobile_purchase_info &&
          styles["popup-important"]
        }`}
      >
        <div className={styles["popup-header"]}>
          <div className={"row justify-content-center"}>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-12 d-flex"}>
                  <span className={styles["close-icon"]} onClick={modalClose}>
                    &times;
                  </span>
                </div>
              </div>
            </div>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-12 text-center"}>
                  <img src={popInfo[modalKey]?.imageIcon || ""}></img>
                </div>
              </div>
            </div>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-12 text-center"}>
                  <div
                    className={`${styles["popup-title"]} ${
                      modalKey === ModalEntities.mobile_purchase_info &&
                      styles["popup-important"]
                    }`}
                  >
                    {popInfo[modalKey]?.title || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-12 text-center"}>
                  <div
                    className={`${styles["popup-body-text"]} ${
                      modalKey === ModalEntities.mobile_purchase_info &&
                      styles["popup-important"]
                    }`}
                  >
                    {popInfo[modalKey]?.body || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className={"col-12"}>
              <div className={"row d-flex justify-content-center"}>
                <div
                  className={styles["popup-button"]}
                  onClick={() => {
                    handleButtonClick();
                  }}
                >
                  {popInfo[modalKey]?.buttonMessage || ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
