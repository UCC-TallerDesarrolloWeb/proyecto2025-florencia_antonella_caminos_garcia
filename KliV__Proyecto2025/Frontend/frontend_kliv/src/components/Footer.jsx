import React from "react"
import { Link } from "react-router-dom"

export default function Footer({
                                   brand = "KliV Manager",
                                   links = [],
                                   social = [],
                                   year = new Date().getFullYear(),
                                   className = "",
                               }) {
    return (
        <footer
            className={`w-full border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-6 px-6 transition-all duration-300 ${className}`}
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-xl font-bold tracking-wide text-purple-600 dark:text-purple-400">
                        {brand}
                    </h2>
                    <p className="text-sm mt-1">
                        © {year} {brand}. Todos los derechos reservados.
                    </p>
                </div>

                {links.length > 0 && (
                    <ul className="flex flex-wrap justify-center md:justify-end gap-4 text-sm font-medium">
                        {links.map(({ label, to }, index) => (
                            <li key={index}>
                                {to.startsWith("http") ? (
                                    <a
                                        href={to}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                    >
                                        {label}
                                    </a>
                                ) : (
                                    <Link
                                        to={to}
                                        className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {social.length > 0 && (
                    <div className="flex gap-4 justify-center md:justify-end">
                        {social.map(({ icon: Icon, href }, index) => (
                            <a
                                key={index}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800 transition-all"
                            >
                                <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </footer>
    )
}