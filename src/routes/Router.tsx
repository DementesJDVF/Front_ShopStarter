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
export default router;