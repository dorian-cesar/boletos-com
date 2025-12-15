import VerBoletos from "components/VerBoletos";
import axios from "axios";
import Layout from "components/Layout";
import { useEffect, useState, useMemo } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import Head from "next/head";
import { useTable, usePagination } from "react-table";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";

const MisCompras = () => {
  const columns = useMemo(
    () => [
      {
        Header: "Código transacción",
        accessor: "codigo",
      },
      {
        Header: "Estado",
        accessor: "estadoFormateado",
      },
      {
        Header: "Fecha compra",
        accessor: "fechaCompraFormato",
      },
      {
        Header: "Total",
        accessor: "montoFormateado",
      },
    ],
    []
  );
  const [data, setData] = useState([]);
  const [dataSelected, setDataSelected] = useState();
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 5 } },
    usePagination
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex, pageSize },
  } = tableInstance;

  useEffect(() => {
    let checkUser = decryptData(LocalStorageEntities.user_auth);
    if (!!checkUser) {
      setUser(checkUser);
      setIsLoading(false);
    } else {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    const getTransacciones = async () => {
      try {
        const res = await axios.post("/api/user/obtener-transacciones", {
          email: user?.correo,
        });
        if (res.data.status) {
          setData(res.data?.object);
        }
      } catch (e) {}
    };
    if (!!user) getTransacciones();
  }, [user]);

  return (
    <>
      <Layout>
        <Head>
          <title>Boletos.com | Mis compras</title>
        </Head>
        {isLoading ? (
          <div className="d-flex justify-content-center mt-2">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden"></span>
            </div>
          </div>
        ) : (
          <>
            <div className="pullman-mas">
              <div className="container">
                <div className="row py-4">
                  <div className="col-12">
                    <span>Home &gt; Mis compras </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row pb-5">
              <div className="d-flex justify-content-center">
                <div className="col-12 col-md-10 bloque flex-column">
                  <h1 className="titulo-azul text-center">
                    Historial de compras
                  </h1>
                  <div className="d-flex justify-content-center mt-2 mb-4">
                    <a href="/">Volver</a>
                  </div>
                  {data?.length > 0 ? (
                    <>
                      <div className="table-responsive">
                        <table
                          className="table table-striped align-middle table-borderless"
                          {...getTableProps()}
                        >
                          <thead className="fondo-naranja">
                            {headerGroups.map((headerGroup) => (
                              <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                  <th {...column.getHeaderProps()}>
                                    {column.render("Header")}
                                  </th>
                                ))}
                                <th></th>
                              </tr>
                            ))}
                          </thead>
                          <tbody {...getTableBodyProps()}>
                            {page.map((row, i) => {
                              prepareRow(row);
                              return (
                                <tr {...row.getRowProps()}>
                                  {row.cells.map((cell) => {
                                    return (
                                      <td {...cell.getCellProps()}>
                                        {cell.render("Cell")}
                                      </td>
                                    );
                                  })}
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-table"
                                      onClick={(e) =>
                                        setDataSelected(row?.original)
                                      }
                                      data-bs-toggle="modal"
                                      data-bs-target="#verBoletosModal"
                                    >
                                      Ver boletos
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="pagination">
                        <button
                          onClick={() => gotoPage(0)}
                          disabled={!canPreviousPage}
                          className="btn btn-paginador"
                        >
                          {"<<"}
                        </button>{" "}
                        <button
                          onClick={() => previousPage()}
                          disabled={!canPreviousPage}
                          className="btn btn-paginador"
                        >
                          {"<"}
                        </button>{" "}
                        <button
                          onClick={() => nextPage()}
                          disabled={!canNextPage}
                          className="btn btn-paginador"
                        >
                          {">"}
                        </button>{" "}
                        <button
                          onClick={() => gotoPage(pageCount - 1)}
                          disabled={!canNextPage}
                          className="btn btn-paginador"
                        >
                          {">>"}
                        </button>
                        {"  "}
                      </div>
                    </>
                  ) : (
                    <h6 className="text-center">
                      No se han efectuado compras aún.
                    </h6>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Layout>
      <VerBoletos compra={dataSelected}></VerBoletos>
    </>
  );
};

export default MisCompras;
