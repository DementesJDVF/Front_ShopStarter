import { Badge, Dropdown, Progress, Table, Spinner } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import api from "../../utils/axios";

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
  images: Array<{ image: string; is_main: boolean }>;
}

const ProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // En un futuro, filtrar por vendor: api.get('/products/my-products/')
        const response = await api.get('/products/');
        setProducts(response.data.results || response.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /*Table Action*/
  const tableActionData = [
    {
      icon: "solar:add-circle-outline",
      listtitle: "Añadir",
    },
    {
      icon: "solar:pen-new-square-broken",
      listtitle: "Editar",
    },
    {
      icon: "solar:trash-bin-minimalistic-outline",
      listtitle: "Borrar",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-10 font-[var(--main-font)]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex justify-between items-center mb-4 font-[var(--main-font)]">
           <h5 className="card-title text-xl font-bold">Gestión de Productos</h5>
        </div>
        <div className="mt-3">
            <div className="overflow-x-auto font-[var(--main-font)]">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell className="p-6">Producto</Table.HeadCell>
                  <Table.HeadCell>Precio</Table.HeadCell>
                  <Table.HeadCell>Estado</Table.HeadCell>
                  <Table.HeadCell></Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-border dark:divide-darkborder">
                  {products.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={4} className="text-center py-10 opacity-50">
                        No hay productos registrados aún.
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    products.map((product, index) => (
                      <Table.Row key={product.id || index}>
                        <Table.Cell className="whitespace-nowrap ps-6">
                          <div className="flex gap-3 items-center">
                            <img
                              src={product.images?.[0]?.image || "https://placehold.co/60x60?text=PS"}
                              alt="product"
                              className="h-[60px] w-[60px] rounded-md object-cover"
                            />
                            <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                              <h6 className="text-sm font-semibold">{product.name}</h6>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <h5 className="text-base font-bold text-wrap">
                            ${parseFloat(product.price.toString()).toLocaleString()}
                          </h5>
                          <div className="text-sm font-medium text-dark opacity-70 mb-2">
                            Puesto a la venta
                          </div>
                          <div className="me-5">
                            <Progress
                              progress={100}
                              className="bg-success text-success"
                              size={"sm"}
                            />
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={product.status === 'ACTIVE' ? 'success' : 'lightsecondary'}
                            className="uppercase"
                          >
                            {product.status || 'SIN ESTADO'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Dropdown
                            label=""
                            dismissOnClick={false}
                            renderTrigger={() => (
                              <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                                <HiOutlineDotsVertical size={22} />
                              </span>
                            )}
                          >
                            {tableActionData.map((items, index) => (
                              <Dropdown.Item key={index} className="flex gap-3">
                                <Icon icon={`${items.icon}`} height={18} />
                                <span>{items.listtitle}</span>
                              </Dropdown.Item>
                            ))}
                          </Dropdown>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </div>
        </div>
      </div>
    </>
  );
};

export { ProductTable };
