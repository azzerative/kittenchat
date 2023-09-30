import axios, { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true,
});
API.interceptors.response.use(undefined, (err) => {
  if (isAxiosError<{ message: string }>(err) && err.response) {
    err.message = err.response.data.message;
  }
  return Promise.reject(err);
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
