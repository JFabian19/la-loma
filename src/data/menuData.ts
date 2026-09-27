export interface Dish {
  nombre: string;
  precio: string;
  descripcion?: string;
  imagen: string;
}

export interface Category {
  id: string;
  nombre: string;
  bajada: string;
  items: Dish[];
}

const imageSlug = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const item = (nombre: string, precio: number, descripcion?: string): Dish => ({
  nombre,
  precio: `S/ ${precio.toFixed(2)}`,
  descripcion,
  imagen: `/menu/${imageSlug(nombre)}.jpg`,
});

export const MENU: Category[] = [
  {
    id: "ceviches", nombre: "Ceviches", bajada: "Frescura del río y el mar",
    items: [
      item("Ceviche de jurel", 15), item("Ceviche clásico", 23), item("Ceviche de doncella", 35),
      item("Ceviche mixto", 30), item("Ceviche de mariscos", 33), item("Ceviche de pota", 20),
      item("Ceviche de langostinos", 35), item("Leche de tigre", 18), item("Leche de tigre especial", 22),
    ],
  },
  {
    id: "chicharrones-jalea", nombre: "Chicharrones y jalea", bajada: "Crujientes, dorados y abundantes",
    items: [
      item("Chicharrón de pescado", 25), item("Chicharrón de doncella", 35), item("Chicharrón mixto", 35),
      item("Chicharrón de pota", 22), item("Chicharrón de langostino", 35), item("Chicharrón de jurel", 20),
      item("Jalea real", 40),
    ],
  },
  {
    id: "arroces", nombre: "Arroces", bajada: "Sazón intensa al wok",
    items: [item("Arroz con mariscos", 30), item("Arroz con langostinos", 33), item("Chaufa de mariscos", 30), item("Chaufa de langostinos", 33)],
  },
  {
    id: "pescados-causas", nombre: "Pescados fritos y causas", bajada: "Clásicos de la casa",
    items: [
      item("Paco frito", 30), item("Doncella frita (medallones)", 35), item("Tilapia frita (filete)", 25),
      item("Filete de pescado a la plancha", 25), item("Causa de pescado", 20), item("Causa de langostinos", 25), item("Causa acevichada", 30),
    ],
  },
  {
    id: "duos-marinos", nombre: "Dúos marinos", bajada: "Dos antojos en un solo plato",
    items: [
      item("Leche de tigre + chicharrón de pota", 28), item("Ceviche + chicharrón de pota", 28),
      item("Ceviche + chicharrón de pescado", 32), item("Ceviche + arroz con mariscos", 32),
      item("Ceviche + chaufa de mariscos", 32), item("Ceviche + arroz con langostinos", 35),
      item("Ceviche + chaufa de langostinos", 35), item("Ceviche + chicharrón mixto", 35),
      item("Chaufa de mariscos + chicharrón", 32), item("Arroz con mariscos + chicharrón", 32),
    ],
  },
  {
    id: "trios-marinos", nombre: "Tríos marinos", bajada: "Arma tu combinación favorita",
    items: [item("Arma tu trío marino", 40, "Elige 3: ceviche, leche de tigre, arroz con mariscos, chaufa de mariscos o chicharrón de pescado y/o pota.")],
  },
  {
    id: "sopas-sudados", nombre: "Sopas y sudados", bajada: "Caldos que reconfortan",
    items: [
      item("Chilcano", 15), item("Sopa salvaje", 20), item("Sopa criolla", 20), item("Chupe de langostinos", 35),
      item("Chupe de camarón", 40), item("Chupe de choro", 25), item("Sudado de paco", 30), item("Sudado de tilapia", 25),
      item("Sudado mixto", 30), item("Parihuela", 40),
    ],
  },
  {
    id: "criollos-tipicos", nombre: "Platos criollos y típicos", bajada: "Sabores peruanos y amazónicos",
    items: [
      item("Lomo saltado", 30), item("Chaufa de pollo", 20), item("Pollo a la plancha", 25), item("Saltado de pollo", 25),
      item("Chaufa de lomo", 35), item("Calabresa con tacacho", 20), item("Saltado de calabresa", 20), item("Cecina con tacacho", 25),
      item("Saltado de cecina", 25), item("Chaufa de cecina", 25), item("Chaufa amazónica", 30),
    ],
  },
  {
    id: "porciones", nombre: "Porciones", bajada: "El complemento perfecto",
    items: [
      item("Arroz blanco", 5), item("Papas fritas", 8), item("Patacones", 8), item("Yucas fritas", 5),
      item("Chifle", 5), item("Camote", 5), item("Chicharrón de pota", 12), item("Chicharrón de pescado", 15),
    ],
  },
  {
    id: "bebidas", nombre: "Bebidas", bajada: "Para brindar y refrescar",
    items: [
      item("Jarra de refresco", 12), item("Vaso de refresco", 4), item("Cerveza Pilsen", 12), item("Cerveza de trigo", 13),
      item("Cerveza Corona", 10), item("Inca Kola o Coca-Cola 1/2 L", 5), item("Inca Kola o Coca-Cola 1 L", 10),
      item("Inca Kola o Coca-Cola 2 L", 15), item("Agua mineral", 4), item("Infusiones", 4),
    ],
  },
];
