import { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";

const AuthRegister = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<"VENDEDOR" | "CLIENTE">("CLIENTE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          password_confirm: passwordConfirm,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Muestra el primer error que devuelva DRF
        const firstError =
          data?.username?.[0] ||
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.role?.[0] ||
          data?.non_field_errors?.[0] ||
          data?.detail ||
          "Error al registrarse";
        throw new Error(firstError);
      }

      // ✅ Registro exitoso → redirige al login
      navigate("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Username */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="username" value="Nombre de usuario" />
          </div>
          <TextInput
            id="username"
            type="text"
            sizing="md"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario123"
            className="form-control form-rounded-xl"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="emadd" value="Correo electrónico" />
          </div>
          <TextInput
            id="emadd"
            type="email"
            sizing="md"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="form-control form-rounded-xl"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd" value="Contraseña" />
          </div>
          <TextInput
            id="userpwd"
            type="password"
            sizing="md"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="form-control form-rounded-xl"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="confirmpwd" value="Confirmar contraseña" />
          </div>
          <TextInput
            id="confirmpwd"
            type="password"
            sizing="md"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Repite la contraseña"
            className="form-control form-rounded-xl"
          />
        </div>

        {/* Rol */}
        <div className="mb-6">
          <div className="mb-2 block">
            <Label htmlFor="role" value="Tipo de cuenta" />
          </div>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "VENDEDOR" | "CLIENTE")}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-primary"
          >
            <option value="CLIENTE">Cliente</option>
            <option value="VENDEDOR">Vendedor</option>
          </select>
        </div>

        <Button
          color="primary"
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-xl"
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </Button>

      </form>
    </>
  );
};

export default AuthRegister;