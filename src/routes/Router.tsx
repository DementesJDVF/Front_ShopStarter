import { lazy } from 'react';
import { Navigate, createBrowserRouter } from "react-router";
import { ProductCatalog } from "../components/products/ProductCatalog.tsx";

const FullLayout = lazy(() => import('../layouts/full/FullLayout'));
const BlankLayout = lazy(() => import('../layouts/blank/BlankLayout'));


//Landin Page
const LandingPage = lazy(() => import('../views/LandingPage/Home'))

// Dashboard
const Dashboard = lazy(() => import('../views/dashboards/Dashboard'));
const Typography = lazy(() => import("../views/typography/Typography"));
const Table = lazy(() => import("../views/tables/Table"));
const Category = lazy(() => import("../views/categories/Category"));
const Form = lazy(() => import("../views/forms/Form"));
const Shadow = lazy(() => import("../views/shadows/Shadow"));
const Alert = lazy(() => import("../views/alerts/Alerts"));
const Solar = lazy(() => import("../views/icons/Solar"));
const Login = lazy(() => import('../views/auth/login/Login'));
const Register = lazy(() => import('../views/auth/login/Register')); //
const SamplePage = lazy(() => import('../views/sample-page/SamplePage'));
const Error = lazy(() => import('../views/auth/error/Error'));

const ProductDetail = lazy(() => import('../components/products/ProductDetail'));
const AddProduct = lazy(() => import('../components/products/AddProduct'));

const Router = [
  //Landing Page - Sin layout o con BlankLayout
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { index: true, element: <LandingPage /> }, // "/" → Landing
      { path: 'auth/login', element: <Login /> },
      { path: 'auth/register', element: <Register /> },
      { path: 'auth/404', element: <Error /> },
    ],
  },

  //Dashboard y rutas protegidas - Con FullLayout
  {
    path: '/app',  //prefijo para aislar el layout
    element: <FullLayout />,
    children: [
      { path: 'shopstarter', element: <Dashboard /> },
      { path: 'ui/typography', element: <Typography /> },
      { path: 'ui/table', element: <Table /> },
      { path: 'ui/form', element: <Form /> },
      { path: 'ui/alert', element: <Alert /> },
      { path: 'ui/shadow', element: <Shadow /> },
      { path: 'icons/solar', element: <Solar /> },
      { path: 'sample-page', element: <SamplePage /> },
    ],
  },

  //Catch-all para rutas no encontradas
  {
    path: '*',
    element: <Navigate to="/auth/404" replace />,
  },
];

const router = createBrowserRouter(Router);
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from "react-router";
import { ProductCatalog } from "../components/products/ProductCatalog.tsx";
import ProtectedRoute from './ProtectedRoute.tsx';

const FullLayout = lazy(() => import('../layouts/full/FullLayout'));
const BlankLayout = lazy(() => import('../layouts/blank/BlankLayout'));

const Dashboard = lazy(() => import('../views/dashboards/Dashboard'));
const Typography = lazy(() => import("../views/typography/Typography"));
const Table = lazy(() => import("../views/tables/Table"));
const Form = lazy(() => import("../views/forms/Form"));
const Shadow = lazy(() => import("../views/shadows/Shadow"));
const Alert = lazy(() => import("../views/alerts/Alerts"));

const Solar = lazy(() => import("../views/icons/Solar"));
const Login = lazy(() => import('../views/auth/login/Login'));
const Register = lazy(() => import('../views/auth/register/Register'));
const SamplePage = lazy(() => import('../views/sample-page/SamplePage'));
const Error = lazy(() => import('../views/auth/error/Error'));

const ProductDetail = lazy(() => import('../components/products/ProductDetail'));

// Vistas Específicas por Rol
const ClienteHome = lazy(() => import('../views/cliente/Home.tsx'));
const BrowseProducts = lazy(() => import('../views/cliente/BrowseProducts.tsx'));
const VendedorDashboard = lazy(() => import('../views/vendedor/Dashboard.tsx'));
const ManageProducts = lazy(() => import('../views/vendedor/ManageProducts.tsx'));

const Router = [
  // RUTAS PROTEGIDAS PARA EL CLIENTE (MÁXIMA PRIORIDAD)
  {
    path: '/cliente',
    element: <ProtectedRoute allowedRoles={['CLIENTE']} />,
    children: [
      {
        path: '',
        element: <FullLayout />,
        children: [
          { path: 'home', element: <ClienteHome /> },
          { path: 'productos', element: <BrowseProducts /> },
          { path: 'reservas', element: <SamplePage /> },
        ]
      }
    ]
  },
  // RUTAS PROTEGIDAS PARA EL VENDEDOR
  {
    path: '/vendedor',
    element: <ProtectedRoute allowedRoles={['VENDEDOR']} />,
    children: [
      {
        path: '',
        element: <FullLayout />,
        children: [
          { path: 'dashboard', element: <VendedorDashboard /> },
          { path: 'productos', element: <ManageProducts /> },
          { path: 'reservas', element: <Table /> },
        ]
      }
    ]
  },
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', exact: true, element: <Dashboard /> },
      { path: '/products', exact: true, element: <ProductCatalog /> },
      { path: '/products/:id', exact: true, element: <ProductDetail /> },
      { path: '/ui/typography', exact: true, element: <Typography /> },
      { path: '/ui/table', exact: true, element: <Table /> },
      { path: '/ui/form', exact: true, element: <Form /> },
      { path: '/ui/alert', exact: true, element: <Alert /> },
      { path: '/ui/shadow', exact: true, element: <Shadow /> },
      { path: '/icons/solar', exact: true, element: <Solar /> },
      { path: '/sample-page', exact: true, element: <SamplePage /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: '404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  { path: '*', element: <Navigate to="/auth/login" /> },
];

const router = createBrowserRouter(Router);

export default router;