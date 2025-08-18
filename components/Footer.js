import Link from "next/link";

const Footer = () => (
    <>
        <footer className="psjes">
            <div className="container">
                <div className="row">
                    <div className="col-md-3 col-sm-6">
                        <h3>
                            <img className="mr-2 img-contacto-footer" src="../img/icon/chat/location-outline.svg" alt=""/>
                            Contacto
                        </h3>
                        <div className="w-100" style={{ paddingLeft: "25px", borderLeft: "1px solid" }}>
                            <p>San Borja 235 , Estación Central, <br />
                            Santiago</p>
                            <a href="mailto:clientes@pullmanbus.cl">
                                clientes@pullmanbus.cl
                                
                            </a>
                            {/* <p>
                                <b>Call Center 600 600 0018</b>
                            </p> */}
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                        <h3>
                            <img className="mr-2" src="../img/icon/chat/chatbox-ellipses-outline.svg" alt=""/>
                            Información
                        </h3>
                        <div className="w-100" style={{ paddingLeft: "25px", borderLeft: "1px solid" }}>
                            <ul>
                                {/* <li>
                                    <Link href="/teAyudamos?page=preguntas" legacyBehavior>
                                        <a href="">Preguntas Frecuentes</a>
                                    </Link>
                                </li> */}
                                <li>
                                    <Link href="/conoce-tus-derechos" legacyBehavior>
                                        <a href="/conoce-tus-derechos">
                                            Conoce tus derechos
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/politica-de-privacidad" legacyBehavior>
                                        <a href="/politica-de-privacidad">
                                            Política de privacidad
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terminos" legacyBehavior>
                                        <a href="/terminos">
                                            Términos y condiciones de pasajes
                                        </a>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 pt-4">
                        <div className="d-flex justify-content-center justify-content-sm-center ">
                            <a className="pe-4" target="_blank" href="https://www.facebook.com/Pullman.cl/">
                                <img src="../img/icon/chat/logo-facebook.svg" alt=""/>
                            </a>
                            <a className="pe-4" target="_blank" href="https://www.instagram.com/pullmanbus/">
                                <img src="../img/icon/chat/logo-instagram.svg" alt=""/>
                            </a>
                            <a className="pe-4" target="_blank" href="https://www.linkedin.com/company/pullman-bus/">
                                <img src="../img/icon/chat/logo-linkedin.svg" alt=""/>
                            </a>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 ">
                        <div className="d-flex flex-column  justify-content-start  justify-content-sm-start text-center">

                            <h3>
                                <img src="../img/icon/chat/Group.svg" className="img-fluid" alt="" />
                            </h3>

                        </div>
                        
                    </div>
                    </div>
            </div>
        </footer>
    </>
);

export default Footer;
