import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth.js";

export function ProtectedRoute({ roles, children }) {
    const { user, booting } = useAuth();
    const loc = useLocation();
    if (booting) return null;
    if (!user)
        return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
    if (roles && !roles.includes(user.role))
        return <Navigate to={`/${user.role}`} replace />;
    return children;
}
