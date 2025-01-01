// App.tsx (Main App Component with Router)
import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home.tsx';
import {Auth} from "./pages/Auth.tsx";

export const App = () => {
    return (
        <div>
            <nav>
                <Link to="/">Home</Link> | <Link to="/auth">Signup/Login</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
            </Routes>
        </div>
    );
};
