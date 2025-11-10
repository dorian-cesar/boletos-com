import Link from "next/link";

const Footer = () => (
  <footer className="psjes text-light py-5">
    <div className="container">
      <div className="row align-items-start gy-4">
        {/* Contacto */}
        <div className="col-md-3 col-sm-6">
          <h5 className="footer-title d-flex align-items-center mb-3">
            <img
              src="../img/icon/chat/location-outline.svg"
              alt=""
              className="me-2"
              style={{ width: "22px" }}
            />
            Contacto
          </h5>
          <div className="footer-section">
            <p className="mb-1">
              San Borja 235, Estación Central <br />
              Santiago
            </p>
            <a
              href="mailto:clientes@pullmanbus.cl"
              className="text-light text-decoration-none"
            >
              clientes@pullmanbus.cl
            </a>
          </div>
        </div>

        {/* Información */}
        <div className="col-md-3 col-sm-6">
          <h5 className="footer-title d-flex align-items-center mb-3">
            <img
              src="../img/icon/chat/chatbox-ellipses-outline.svg"
              alt=""
              className="me-2"
              style={{ width: "22px" }}
            />
            Información
          </h5>
          <ul className="list-unstyled ps-3 border-start border-light">
            <li className="mb-1">
              <Link
                href="/conoce-tus-derechos"
                className="text-light text-decoration-none"
              >
                Conoce tus derechos
              </Link>
            </li>
            <li className="mb-1">
              <Link
                href="/politica-de-privacidad"
                className="text-light text-decoration-none"
              >
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/terminos"
                className="text-light text-decoration-none"
              >
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>

        {/* Redes sociales y logo */}
        <div className="col-md-6 col-sm-12 text-center">
          <div className="d-flex flex-column align-items-center justify-content-center h-100">
            {/* Logo */}
            <img
              src="../img/icon/logos/logo-pagopar-blanco.svg"
              alt="Logo PagoPar"
              className="img-fluid mb-3"
              style={{ maxWidth: "120px" }}
            />

            {/* Iconos redes */}
            <div className="d-flex justify-content-center gap-4">
              <a
                href="https://www.facebook.com/Pullman.cl/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img
                  src="../img/icon/chat/logo-facebook.svg"
                  alt="Facebook"
                  width="26"
                />
              </a>
              <a
                href="https://www.instagram.com/pullmanbus/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img
                  src="../img/icon/chat/logo-instagram.svg"
                  alt="Instagram"
                  width="26"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/pullman-bus/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img
                  src="../img/icon/chat/logo-linkedin.svg"
                  alt="LinkedIn"
                  width="26"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <hr className="border-light opacity-25 mt-4" />
      <p className="text-center text-light-50 small mb-0">
        © {new Date().getFullYear()} WIT — Todos los derechos reservados.
      </p>
    </div>

    <style jsx>{`
      .footer-title {
        font-size: 1.1rem;
        font-weight: 600;
      }
      .footer-section {
        padding-left: 1rem;
        border-left: 1px solid rgba(255, 255, 255, 0.4);
      }
      .social-icon img {
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .social-icon:hover img {
        transform: scale(1.1);
        opacity: 1;
      }
    `}</style>
  </footer>
);

export default Footer;
