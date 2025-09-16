import { createContext, useEffect, useState } from "react";

type AuthContextType = {
    isAuthenticated: boolean;
    token: string | null;
    email: string | null;
    name: string | null;
    login: (token: string, email: string, name: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedEmail = localStorage.getItem("email");
        const storedName = localStorage.getItem("name");
        if (storedName) setName(storedName);
        if (storedToken) setToken(storedToken);
        if (storedEmail) setEmail(storedEmail);
    }, []);
    
    const login = (newToken: string, newEmail: string, newName: string) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("email", newEmail);
        localStorage.setItem("name", newName);
        setName(newName);
        setToken(newToken);
        setEmail(newEmail);
    };
    
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        setName(null);
        setToken(null);
        setEmail(null);
    };
    
    const isAuthenticated = !!localStorage.getItem("token");

    return (
      <AuthContext.Provider
        value={{ isAuthenticated, token, email, name, login, logout }}
      >
        {children}
      </AuthContext.Provider>
    );
};