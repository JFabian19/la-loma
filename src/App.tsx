import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Anchor,
  ChevronRight,
  Facebook,
  MapPin,
  Phone,
  Plus,
  ShoppingBag,
  Waves,
} from "lucide-react";
import { MENU, type Dish } from "./data/menuData";
import type { CartItem } from "./types";
import DishNoteModal from "./components/DishNoteModal";
import CartDrawer from "./components/CartDrawer";

const PHONE = "51961261750";
const PHONE_LABEL = "961 261 750";
const MAPS_URL = "https://maps.app.goo.gl/V3Ct5PnPisJ2jYXr6";
const FACEBOOK_URL = "https://www.facebook.com/search/top?q=la%20loma%20cevicheria%20restobar";

const money = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(MENU[0].id);

  // Note Modal state before adding to cart
  const [selectedDishForNote, setSelectedDishForNote] = useState<Dish | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.cantidad, 0), [cart]);
  const total = useMemo(
    () => cart.reduce((sum, line) => sum + money(line.dish.precio) * line.cantidad, 0),
    [cart]
  );

  const handleOpenNoteModal = (dish: Dish) => {
    setSelectedDishForNote(dish);
    setIsNoteModalOpen(true);
  };

  const handleConfirmDishNote = (dish: Dish, cantidad: number, nota: string) => {
    setCart((current) => {
      const cleanNote = nota.trim();
      const found = current.find(
        (line) =>
          line.dish.nombre === dish.nombre &&
          line.dish.precio === dish.precio &&
          (line.nota || "").trim() === cleanNote
      );

      if (found) {
        return current.map((line) =>
          line === found ? { ...line, cantidad: line.cantidad + cantidad } : line
        );
      }

      const newItem: CartItem = {
        id: `${dish.nombre}-${dish.precio}-${cleanNote}-${Date.now()}`,
        dish,
        cantidad,
        nota: cleanNote,
      };
      return [...current, newItem];
    });
  };

  const handleUpdateQuantity = (target: CartItem, amount: number) => {
    setCart((current) =>
      current
        .map((line) => (line.id === target.id ? { ...line, cantidad: line.cantidad + amount } : line))
        .filter((line) => line.cantidad > 0)
    );
  };

  const handleRemoveItem = (target: CartItem) => {
    setCart((current) => current.filter((line) => line.id !== target.id));
  };

  const handleUpdateNote = (target: CartItem, newNote: string) => {
    setCart((current) =>
      current.map((line) => (line.id === target.id ? { ...line, nota: newNote } : line))
    );
  };

  const handleClearCart = () => setCart([]);

  const goTo = (id: string) => {
    setActiveCategory(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="site-shell">
      {/* Topbar */}
      <header className="topbar">
        <a href="#inicio" className="brand-lockup" aria-label="Inicio de La Loma">
          <img src="/logo-la-loma.png" alt="La Loma Cevichería Restobar" />
          <span>
            <strong>La Loma</strong>
            <small>Cevichería · Restobar</small>
          </span>
        </a>
        <nav className="header-actions" aria-label="Acciones rápidas">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Ver ubicación de La Loma en Google Maps"
          >
            <MapPin size={19} />
          </a>
          <a
            href={`tel:${PHONE_LABEL.replace(/\s/g, "")}`}
            aria-label={`Llamar al ${PHONE_LABEL}`}
          >
            <Phone size={19} />
          </a>
          <button
            type="button"
            className="cart-trigger"
            onClick={() => setCartOpen(true)}
            aria-label={`Ver pedido, ${cartCount} productos`}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section id="inicio" className="hero">
          <img
            className="hero-photo"
            src="/hero-ceviche.jpg"
            alt="Ceviche peruano con chicharrón y guarniciones"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow">
              <Waves size={17} /> Tradición marina y sazón amazónica
            </div>
            <img className="hero-logo" src="/logo-la-loma.png" alt="" aria-hidden="true" />
            <h1>
              Fresco del río.<br />
              <em>Sabroso de corazón.</em>
            </h1>
            <p>
              Ceviches, pescados fritos, arroces y cocina amazónica preparados al momento con el sabor auténtico de La Loma.
            </p>
            <div className="hero-ctas">
              <button type="button" onClick={() => goTo("ceviches")}>
                Ver la carta <ChevronRight size={18} />
              </button>
              <a
                href={`https://wa.me/${PHONE}?text=Hola%20La%20Loma,%20deseo%20hacer%20una%20consulta%20o%20pedido`}
                target="_blank"
                rel="noreferrer"
              >
                Pedir por WhatsApp
              </a>
            </div>
          </div>
          <div className="hero-stamp">
            <Anchor size={20} />
            <span>
              Puerto<br />Maldonado
            </span>
          </div>
          <a
            className="photo-credit"
            href="https://www.pexels.com/photo/delicious-traditional-peruvian-ceviche-dish-28490822/"
            target="_blank"
            rel="noreferrer"
          >
            Foto: Nano Erdozain · Pexels
          </a>
        </section>

        {/* Info Ticker */}
        <div className="ticker" aria-label="Información de delivery">
          <div>
            DELIVERY {PHONE_LABEL} <span>•</span> CEVICHES FRESCOS <span>•</span> COCINA AMAZÓNICA <span>•</span> RECOJO EN LOCAL <span>•</span> DELIVERY {PHONE_LABEL}
          </div>
        </div>

        {/* Intro */}
        <section className="intro" aria-labelledby="carta-title">
          <div>
            <span className="section-kicker">Nuestra carta digital</span>
            <h2 id="carta-title">Elige tu antojo</h2>
          </div>
          <p>
            Selecciona tus platos favoritos, añade notas personalizadas para cocina y confirma tu delivery o recojo en tienda por WhatsApp.
          </p>
        </section>

        {/* Category Sticky Nav */}
        <nav className="category-nav" aria-label="Categorías de la carta">
          {MENU.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => goTo(category.id)}
              className={activeCategory === category.id ? "active" : ""}
            >
              {category.nombre}
            </button>
          ))}
        </nav>

        {/* Menu Dishes */}
        <div className="menu-wrap">
          {MENU.map((category, categoryIndex) => (
            <section key={category.id} id={`cat-${category.id}`} className="menu-category">
              <header className="category-heading">
                <div className="category-number">{String(categoryIndex + 1).padStart(2, "0")}</div>
                <div>
                  <span>{category.bajada}</span>
                  <h2>{category.nombre}</h2>
                </div>
                <Waves aria-hidden="true" />
              </header>
              <div className="dish-grid">
                {category.items.map((dish) => (
                  <article className="dish-card" key={`${category.id}-${dish.nombre}`}>
                    <div className="dish-photo">
                      <img
                        src={dish.imagen}
                        alt={dish.nombre}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="dish-info">
                      <div className="dish-title-row">
                        <h3>{dish.nombre}</h3>
                        <strong>{dish.precio}</strong>
                      </div>
                      {dish.descripcion && <p>{dish.descripcion}</p>}
                      <button
                        type="button"
                        className="dish-add-btn"
                        onClick={() => handleOpenNoteModal(dish)}
                        aria-label={`Agregar ${dish.nombre} al pedido`}
                      >
                        Agregar <Plus size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Banner */}
        <section className="contact-band">
          <div>
            <span>Haz tu pedido hoy</span>
            <h2>Del río a tu mesa</h2>
            <p>Atención directa por Delivery y Recojo en tienda: {PHONE_LABEL}</p>
          </div>
          <a
            href={`https://wa.me/${PHONE}?text=Hola%20La%20Loma,%20deseo%20hacer%20un%20pedido`}
            target="_blank"
            rel="noreferrer"
          >
            Escríbenos por WhatsApp <ChevronRight size={19} />
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <img src="/logo-la-loma.png" alt="La Loma Cevichería Restobar" />
        <div>
          <strong>Tradición marina y la mejor sazón</strong>
          <span>Av. Dos de Mayo con 26 de Diciembre, Puerto Maldonado</span>
        </div>
        <div className="footer-links">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Buscar La Loma en Facebook"
          >
            <Facebook size={19} />
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Ver ubicación en Google Maps"
          >
            <MapPin size={19} />
          </a>
          <a
            href={`tel:${PHONE_LABEL.replace(/\s/g, "")}`}
            aria-label={`Llamar al ${PHONE_LABEL}`}
          >
            <Phone size={19} />
          </a>
        </div>
      </footer>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.button
            className="floating-cart"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setCartOpen(true)}
            aria-label={`Ver pedido actual, ${cartCount} productos por S/ ${total.toFixed(2)}`}
          >
            <span>
              <ShoppingBag size={21} /> {cartCount} {cartCount === 1 ? "plato" : "platos"}
            </span>
            <strong>
              Ver pedido • S/ {total.toFixed(2)} <ChevronRight size={18} />
            </strong>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dish Note Modal (Before adding to cart) */}
      <DishNoteModal
        dish={selectedDishForNote}
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedDishForNote(null);
        }}
        onConfirm={handleConfirmDishNote}
      />

      {/* Redesigned Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onUpdateNote={handleUpdateNote}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
