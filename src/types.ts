export interface DishOptionItem {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
}

export interface DishOptionGroup {
  titulo: string;
  subtitulo?: string;
  min: number;
  max: number;
  opciones: DishOptionItem[];
}

export interface Dish {
  nombre: string;
  precio: string;
  descripcion?: string;
  imagen: string;
  opcionesConfig?: DishOptionGroup;
}

export interface Category {
  id: string;
  nombre: string;
  bajada: string;
  items: Dish[];
}

export interface CartItem {
  id: string;
  dish: Dish;
  cantidad: number;
  nota?: string;
  opcionesSeleccionadas?: string[];
}

export type OrderMode = "delivery" | "pickup";

export interface DeliveryFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  referencia: string;
  gpsCoords?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  gpsUrl?: string;
}

export interface PickupFormData {
  nombre: string;
  apellido: string;
  telefono: string;
}
