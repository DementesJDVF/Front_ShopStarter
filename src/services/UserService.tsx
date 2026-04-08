//  Interfaz para el usuario
export interface User {
    id: number;
    email: string;
    username: string; 
    role: string; 
    is_active: boolean; 
    date_joined: string; 
    last_login: string; 
    is_staff: boolean; 
    is_superuser: boolean; 
    groups: any []; 
    user_permissions: any[]; 
}
// Servicio para obtener los usuarios 
export const getUsers = async (): Promise<User[]> =>{
    const response = await fetch("http://127.0.0.1:8000/api/categories", { 
        method: "GET", 
        headers: {
            "Content-Type": "application/json",
        }, 
    }); 
    if (!response.ok) { 
        throw new Error( "Failed to fetch users");
    }
    return response.json(); 
};