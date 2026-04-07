
import { Badge, Dropdown, Progress } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { Table } from "flowbite-react";

import { getUsers, User } from "../../services/UserService";

import product1 from "/src/assets/images/products/dash-prd-1.jpg";
import product2 from "/src/assets/images/products/dash-prd-2.jpg";
import product3 from "/src/assets/images/products/dash-prd-3.jpg";
import product4 from "/src/assets/images/products/dash-prd-4.jpg";
import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  is_active?: boolean;
  product_count?: number;
  created_at?: string; 
};

const ProductTable = () => {
  const [users, setUsers] = useState<User[]>([]); 
  const [usersLoading, setUsersLoading] = useState(true); 
  const [usersError, setUsersError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);


  const ProductTableData = [
    {
      img: product1,
      name: "iPhone 13 pro max-Pacific Blue-128GB storage",
      payment: "$180",
      paymentstatus: "Partially paid",
      process: 45,
      processcolor: "bg-warning",
      statuscolor: "secondary",
      statustext: "Confirmed",
    },
    {
      img: product2,
      name: "Apple MacBook Pro 13 inch-M1-8/256GB-space",
      payment: "$120",
      paymentstatus: "Full paid",
      process: 100,
      processcolor: "bg-success",
      statuscolor: "success",
      statustext: "Confirmed",
    },
    {
      img: product3,
      name: "PlayStation 5 DualSense Wireless Controller",
      payment: "$120",
      paymentstatus: "Cancelled",
      process: 100,
      processcolor: "bg-error",
      statuscolor: "error",
      statustext: "Cancelled",
    },
    {
      img: product4,
      name: "Amazon Basics Mesh, Mid-Back, Swivel Office",
      payment: "$120",
      paymentstatus: "Partially paid",
      process: 45,
      processcolor: "bg-warning",
      statuscolor: "secondary",
      statustext: "Confirmed",
    },
  ];

  /*Table Action*/
  const tableActionData = [
    {
      icon: "solar:add-circle-outline",
      listtitle: "Add",
    },
    {
      icon: "solar:pen-new-square-broken",
      listtitle: "Edit",
    },
    {
      icon: "solar:trash-bin-minimalistic-outline",
      listtitle: "Delete",
    },
  ];

  
  useEffect(() => {
    let isMounted = true; 
    
    const loadUsers = async () => { 
      try { 
        const data = await getUsers(); 
        console.log(data); 
        
        if (isMounted) { 
          setUsers(data); 
          setUsersError(null); 
        } 
      } catch (error) { 
        if (isMounted) { 
          setUsersError("No se pudieron cargar los usuarios."); 
        } 
      } finally { 
        if (isMounted) { 
          setUsersLoading(false); 
        } 
      }
    }; 
      
    loadUsers(); 
    return () => { 
      isMounted = false; 
    };
   }, []);
   
const handleCategoryAction = (action: string, category: Category) => {
    switch (action) {
      case "edit":
        console.log("Editar categoría:", category);
        // Aquí iría tu lógica para editar (abrir modal, navegar, etc.)
        break;
      case "delete":
        if (confirm(`¿Eliminar categoría "${category.name}"?`)) {
          // Aquí iría tu llamada API para eliminar
          setCategories(categories.filter(c => c.id !== category.id));
        }
        break;
      case "view":
        console.log("Ver productos de:", category);
        // Navegar a productos filtrados por categoría
        break;
    }
  };

   
  return (
    <>
    
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <h5 className="card-title">Table</h5>
        <div className="mt-3">
         
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell className="p-6">Products</Table.HeadCell>
                  <Table.HeadCell>Payment</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell></Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-border dark:divide-darkborder ">
                  {ProductTableData.map((item, index) => (
                    <Table.Row key={index}>
                      <Table.Cell className="whitespace-nowrap ps-6">
                        <div className="flex gap-3 items-center">
                          <img
                            src={item.img}
                            alt="icon"
                            className="h-[60px] w-[60px] rounded-md"
                          />
                          <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                            <h6 className="text-sm">{item.name}</h6>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <h5 className="text-base text-wrap">
                          {item.payment}
                          <span className="text-dark opacity-70">
                            <span className="mx-1">/</span>499
                          </span>
                        </h5>
                        <div className="text-sm font-medium text-dark opacity-70 mb-2 text-wrap">
                          {item.paymentstatus}
                        </div>
                        <div className="me-5">
                          <Progress
                            progress={item.process}
                            color={`${item.processcolor}`}
                            className={`${item.processcolor}`}
                            size={"sm"}
                          />
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={`light${item.statuscolor}`}
                          className={`text-${item.statuscolor}`}
                        >
                          {item.statustext}
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
                              {" "}
                              <Icon icon={`${items.icon}`} height={18} />
                              <span>{items.listtitle}</span>
                            </Dropdown.Item>
                          ))}
                        </Dropdown>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
         
        </div>
      </div>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words mt-6">
        <h5 className="card-title">Categorias</h5>
        <div className="mt-3">
          {categoriesLoading ? (
            <div className="text-sm text-dark opacity-70">Cargando categorías...</div>
          ) : categoriesError ? (
            <div className="text-sm text-error">{categoriesError}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell className="p-6">ID</Table.HeadCell>
                   <Table.HeadCell>Nombre</Table.HeadCell>
                  <Table.HeadCell>Descripción</Table.HeadCell>
                  <Table.HeadCell>Productos</Table.HeadCell>
                  <Table.HeadCell>Estado</Table.HeadCell>
                  <Table.HeadCell></Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-border dark:divide-darkborder">
                  {categories.map((category) => (
                    <Table.Row key={category.id}>
                      <Table.Cell className="whitespace-nowrap ps-6">
                        {category.id}
                      </Table.Cell>
                      <Table.Cell className="font-medium">
                        {category.name}
                      </Table.Cell>
                      <Table.Cell className="text-sm text-dark opacity-70 max-w-xs truncate">
                        {category.description || "—"}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="lightprimary" className="text-primary">
                          {category.product_count ?? 0}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={category.is_active ? "lightsuccess" : "lighterror"}
                          className={category.is_active ? "text-success" : "text-error"}
                        >
                          {category.is_active ? "Activa" : "Inactiva"}
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
                          <Dropdown.Item 
                            className="flex gap-3"
                            onClick={() => handleCategoryAction("view", category)}
                          >
                            <Icon icon="solar:eye-outline" height={18} />
                            <span>Ver productos</span>
                          </Dropdown.Item>
                          <Dropdown.Item 
                            className="flex gap-3"
                            onClick={() => handleCategoryAction("edit", category)}
                          >
                            <Icon icon="solar:pen-new-square-broken" height={18} />
                            <span>Editar</span>
                          </Dropdown.Item>
                          <Dropdown.Item 
                            className="flex gap-3 text-error"
                            onClick={() => handleCategoryAction("delete", category)}
                          >
                            <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                            <span>Eliminar</span>
                          </Dropdown.Item>
                        </Dropdown>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words mt-6">
        <h5 className="card-title">Users</h5>
        <div className="mt-3">
          {usersLoading ? (
            <div className="text-sm text-dark opacity-70">Cargando...</div>
          ) : usersError ? (
            <div className="text-sm text-error">{usersError}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell className="p-6">ID</Table.HeadCell>
                  <Table.HeadCell>Username</Table.HeadCell>
                  <Table.HeadCell>Acciones</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-border dark:divide-darkborder">
                  {users.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell className="whitespace-nowrap ps-6">
                        {user.id}
                      </Table.Cell>
                      <Table.Cell>{user.name}</Table.Cell>
                      <Table.Cell>botones</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export { ProductTable };
