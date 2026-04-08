import { useState } from "react";
import api from "src/utils/axios";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";
import { Link, useNavigate } from "react-router";

const gradientStyle = {
  background:
    "linear-gradient(45deg, rgb(238, 119, 82,0.2), rgb(231, 60, 126,0.2), rgb(35, 166, 213,0.2), rgb(35, 213, 171,0.2))",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite",
  height: "100vh",
};

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMsg("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login/", {
        email: cleanEmail,
        password,
      });

      const data = response.data;

      // Guardar tokens (si quieres recordar sesión)
      if (remember) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
      } else {
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);
      }

      // Opcional: guardar usuario
      localStorage.setItem("user_data", JSON.stringify(data.user));

      // Redirigir al panel/home
      navigate("/");
    } catch (error: any) {
      if (error.response) {
        // El servidor respondió con un error (400, 401, etc.)
        const data = error.response.data;
        const msg =
          data?.non_field_errors?.[0] ||
          data?.detail ||
          "Credenciales inválidas. Verifica email y contraseña.";
        setErrorMsg(msg);
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        setErrorMsg("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
      } else {
        // Otro tipo de error
        setErrorMsg("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={gradientStyle} className="relative overflow-hidden h-screen">
      <div className="flex h-full justify-center items-center px-4">
        <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 w-full md:w-96 border-none">
          <div className="flex flex-col gap-2 p-0 w-full">
            <div className="mx-auto">
              <FullLogo />
            </div>

            <p className="text-sm text-center text-dark my-3">Sign In on Shop_Starter</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@dominio.com"
                  className="w-full border rounded-md px-3 py-2"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full border rounded-md px-3 py-2"
                  autoComplete="current-password"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember this Device
              </label>

              {errorMsg && (
                <p className="text-red-600 text-sm font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-md py-2 disabled:opacity-60"
              >
                {loading ? "Ingresando..." : "Sign in"}
              </button>
            </form>

            <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
              <p>New to Shop_Starter?</p>
              <Link to="/auth/register" className="text-primary text-sm font-medium">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;