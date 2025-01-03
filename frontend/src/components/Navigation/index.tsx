import { Link } from "react-router-dom";

export function Navigation() {
    return (
        <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/explorer">Explorer</Link>
            <Link to="/analytics">Analytics</Link>
        </nav>
    )
}
