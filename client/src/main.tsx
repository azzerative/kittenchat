import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Protected } from "./components/Protected.tsx";
import { Chat } from "./routes/Chat.tsx";
import { Login } from "./routes/Login.tsx";
import { Register } from "./routes/Register.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/register" Component={Register} />
      <Route path="/login" Component={Login} />
      <Route
        element={
          <Protected>
            <Outlet />
          </Protected>
        }
      >
        <Route index Component={Chat} />
      </Route>
    </>,
  ),
);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
