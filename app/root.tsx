import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import store from "./src/redux/store/store.js";
import type { Route } from "./+types/root";
import "./app.css";

// 🔹 Layout SSR (minimized whitespace to avoid hydration error)
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="mdl-js">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// 🔹 ClientOnly to avoid hydration mismatch
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}

// 🔹 Root component
export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ClientOnly>
          <Outlet />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#333",
                color: "#fff",
                borderRadius: "12px",
                padding: "12px 20px",
                fontSize: "15px",
              },
              success: { style: { background: "#4caf50" } },
              error: { icon: "⚠️", style: { background: "#f44336" } },
            }}
          />
        </ClientOnly>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  );
}

// 🔹 Improved ErrorBoundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : `Error ${error.status}`;
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error instanceof Error) {
    message = "Client Error";
    details = error.message;
    stack = error.stack;
    if (error.message.includes("Failed to fetch")) {
      details =
        "Failed to load a resource. Please check your network connection or try again later.";
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">{message}</h1>
      <p>{details}</p>
      {stack && import.meta.env.DEV && (
        <pre className="w-full p-4 overflow-x-auto bg-gray-100 text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
