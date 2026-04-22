import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen grid place-items-center px-6 text-center">
            <div>
                <p className="text-mint-400 text-sm uppercase tracking-widest">
                    404
                </p>
                <h1 className="font-display text-5xl font-bold mt-2">
                    Page not found
                </h1>
                <p className="text-zinc-400 mt-3">
                    The page you're looking for moved or never existed.
                </p>
                <Link to="/" className="btn-primary mt-6 inline-flex">
                    Take me home
                </Link>
            </div>
        </div>
    );
}
