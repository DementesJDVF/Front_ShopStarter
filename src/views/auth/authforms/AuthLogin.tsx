import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import api from "../../../utils/axios";

const AuthLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Diccionario para traducir nombres técnicos del backend a etiquetas amigables en español
    const fieldLabels: Record<string, string> = {
        email: 'Correo Electrónico',
        password: 'Contraseña',
        non_field_errors: 'Credenciales',
        detail: 'Detalle',
        error: 'Error'
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('users/auth/login/', { email, password });
            const { access_token, user } = response.data;
            
            // Guardamos el estado del usuario y el token en el contexto global de la aplicación
            login(user, access_token);

            // Sistema de redirección profesional basado en el ROL del usuario obtenido del Backend
            if (user.role === 'VENDEDOR') {
                navigate("/vendedor/dashboard");
            } else if (user.role === 'CLIENTE') {
                navigate("/cliente/home");
            } else if (user.role === 'ADMIN') {
                navigate("/admin");
            }
        } catch (err: any) {
            console.error("Error de Login:", err.response?.data);
            const backendErrors = err.response?.data;
            
            if (backendErrors && typeof backendErrors === 'object') {
                const mainError = backendErrors.error || backendErrors.detail || backendErrors.message;
                
                if (typeof mainError === 'string') {
                    setError(mainError);
                } else {
                    try {
                        const messages = Object.entries(backendErrors)
                            .filter(([field]) => field !== 'error' && field !== 'detail')
                            .map(([field, msgs]) => {
                                const label = fieldLabels[field] || field;
                                const message = Array.isArray(msgs) ? msgs[0] : msgs;
                                return `${label}: ${message}`;
                            })
                            .join(" | ");
                        setError(messages || "No se pudo iniciar sesión. Verifica tus datos.");
                    } catch (e) {
                        setError("Error en las credenciales proporcionadas.");
                    }
                }
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || "Credenciales inválidas o error de servidor.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} >
                {error && (
                    <div className="flex items-start gap-3 p-4 mb-6 text-sm text-red-800 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake font-[var(--main-font)] shadow-md">
                        <div className="mt-0.5">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold mb-1">Error de Acceso:</p>
                            <div className="flex flex-col gap-1">
                                {error.split(' | ').map((msg, i) => (
                                    <span key={i} className="block">• {msg}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <div className="mb-2 block">
                        <Label htmlFor="email" value="Correo Electrónico" />
                    </div>
                    <TextInput
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        sizing="md"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control form-rounded-xl"
                    />
                </div>
                <div className="mb-4">
                    <div className="mb-2 block">
                        <Label htmlFor="password" value="Contraseña" />
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        sizing="md"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control form-rounded-xl"
                    />
                </div>
                <div className="flex justify-between my-5">
                    <div className="flex items-center gap-2">
                        <Checkbox id="accept" className="checkbox" />
                        <Label
                            htmlFor="accept"
                            className="opacity-90 font-normal cursor-pointer"
                        >
                            Recordar sesión
                        </Label>
                    </div>
                    <Link to={"/auth/forgot-password"} className="text-primary text-sm font-medium">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <Button type="submit" color={"primary"} disabled={loading} className="w-full bg-primary text-white rounded-xl">
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
            </form>
        </>
    );
};

export default AuthLogin;
