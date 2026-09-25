import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Anchor, ChevronRight, Facebook, MapPin, Minus, Phone, Plus, ShoppingBag, Trash2, Waves, X } from "lucide-react";
import { MENU, type Dish } from "./data/menuData";

const PHONE = "51961261750";
const PHONE_LABEL = "961 261 750";
const SECOND_PHONE_LABEL = "954 184 320";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Av.+Dos+de+Mayo+con+26+de+Diciembre+Peru";
const FACEBOOK_URL = "https://www.facebook.com/search/top?q=la%20loma%20cevicheria%20restobar";

type CartItem = Dish & { cantidad: number };
const money = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(MENU[0].id);
  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.cantidad, 0), [cart]);
  const total = useMemo(() => cart.reduce((sum, line) => sum + money(line.precio) * line.cantidad, 0), [cart]);

  const add = (dish: Dish) => setCart((current) => {
    const found = current.find((line) => line.nombre === dish.nombre && line.precio === dish.precio);
    return found
      ? current.map((line) => line === found ? { ...line, cantidad: line.cantidad + 1 } : line)
      : [...current, { ...dish, cantidad: 1 }];
  });

  const changeQuantity = (target: CartItem, amount: number) => setCart((current) => current
    .map((line) => line === target ? { ...line, cantidad: line.cantidad + amount } : line)
    .filter((line) => line.cantidad > 0));

  const goTo = (id: string) => {
    setActiveCategory(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sendOrder = () => {
    const detail = cart.map((line) => `• ${line.cantidad} x ${line.nombre} — ${line.precio}`).join("\n");
    const message = `Hola La Loma, deseo realizar este pedido:\n\n${detail}\n\nTOTAL: S/ ${total.toFixed(2)}`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <a href="#inicio" className="brand-lockup" aria-label="Inicio de La Loma">
          <img src="/logo-la-loma.png" alt="La Loma Cevichería Restobar" />
          <span><strong>La Loma</strong><small>Cevichería · Restobar</small></span>
        </a>
        <nav className="header-actions" aria-label="Acciones rápidas">
          <a href={MAPS_URL} target="_blank" rel="noreferrer" aria-label="Ver ubicación"><MapPin size={19} /></a>
          <a href={`tel:${PHONE_LABEL.replace(/\s/g, "")}`} aria-label={`Llamar al ${PHONE_LABEL}`}><Phone size={19} /></a>
          <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Ver pedido, ${cartCount} productos`}><ShoppingBag size={20} /><span>{cartCount}</span></button>
        </nav>
      </header>

      <main>
        <section id="inicio" className="hero">
          <img className="hero-photo" src="/hero-ceviche.jpg" alt="Ceviche peruano con chicharrón y guarniciones" />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow"><Waves size={17} /> Tradición marina y sazón amazónica</div>
            <img className="hero-logo" src="/logo-la-loma.png" alt="" aria-hidden="true" />
            <h1>Fresco del río.<br /><em>Sabroso de corazón.</em></h1>
            <p>Ceviches, frituras y cocina peruana preparados con el sabor que distingue a La Loma.</p>
            <div className="hero-ctas">
              <button onClick={() => goTo("ceviches")}>Ver la carta <ChevronRight size={18} /></button>
              <a href={`https://wa.me/${PHONE}`} target="_blank" rel="noreferrer">Pedir por WhatsApp</a>
            </div>
          </div>
          <div className="hero-stamp"><Anchor size={20} /><span>Puerto<br />Maldonado</span></div>
          <a className="photo-credit" href="https://www.pexels.com/photo/delicious-traditional-peruvian-ceviche-dish-28490822/" target="_blank" rel="noreferrer">Foto: Nano Erdozain · Pexels</a>
        </section>

        <div className="ticker" aria-label="Información de delivery"><div>DELIVERY {PHONE_LABEL} <span>•</span> CEVICHES <span>•</span> COCINA AMAZÓNICA <span>•</span> DELIVERY {PHONE_LABEL}</div></div>

        <section className="intro" aria-labelledby="carta-title">
          <div><span className="section-kicker">Nuestra carta</span><h2 id="carta-title">Elige tu antojo</h2></div>
          <p>Agrega tus favoritos y envía el pedido directamente por WhatsApp.</p>
        </section>

        <nav className="category-nav" aria-label="Categorías de la carta">
          {MENU.map((category) => <button key={category.id} onClick={() => goTo(category.id)} className={activeCategory === category.id ? "active" : ""}>{category.nombre}</button>)}
        </nav>

        <div className="menu-wrap">
          {MENU.map((category, categoryIndex) => (
            <section key={category.id} id={`cat-${category.id}`} className="menu-category">
              <header className="category-heading">
                <div className="category-number">{String(categoryIndex + 1).padStart(2, "0")}</div>
                <div><span>{category.bajada}</span><h2>{category.nombre}</h2></div>
                <Waves aria-hidden="true" />
              </header>
              <div className="dish-grid">
                {category.items.map((dish) => (
                  <article className="dish-card" key={`${category.id}-${dish.nombre}`}>
                    <div className="dish-placeholder" aria-label={`Espacio reservado para imagen de ${dish.nombre}`}><Waves size={23} /><span>Aquí va la imagen</span></div>
                    <div className="dish-info">
                      <div className="dish-title-row"><h3>{dish.nombre}</h3><strong>{dish.precio}</strong></div>
                      {dish.descripcion && <p>{dish.descripcion}</p>}
                      <button onClick={() => add(dish)} aria-label={`Agregar ${dish.nombre} al pedido`}>Agregar <Plus size={17} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="contact-band">
          <div><span>Haz tu pedido</span><h2>Del río a tu mesa</h2><p>Delivery: {PHONE_LABEL} · {SECOND_PHONE_LABEL}</p></div>
          <a href={`https://wa.me/${PHONE}`} target="_blank" rel="noreferrer">Escríbenos por WhatsApp <ChevronRight size={19} /></a>
        </section>
      </main>

      <footer>
        <img src="/logo-la-loma.png" alt="La Loma Cevichería Restobar" />
        <div><strong>Tradición marina y la mejor sazón</strong><span>Av. Dos de Mayo con 26 de Diciembre</span></div>
        <div className="footer-links">
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Buscar La Loma en Facebook"><Facebook size={19} /></a>
          <a href={MAPS_URL} target="_blank" rel="noreferrer" aria-label="Ver ubicación"><MapPin size={19} /></a>
          <a href={`tel:${PHONE_LABEL.replace(/\s/g, "")}`} aria-label="Llamar"><Phone size={19} /></a>
        </div>
      </footer>

      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.button className="floating-cart" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} onClick={() => setCartOpen(true)}>
            <span><ShoppingBag size={20} /> {cartCount} {cartCount === 1 ? "producto" : "productos"}</span>
            <strong>S/ {total.toFixed(2)} <ChevronRight size={18} /></strong>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.div className="cart-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)}>
            <motion.aside className="cart-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} onClick={(event) => event.stopPropagation()} aria-label="Tu pedido">
              <header><div><span>La Loma</span><h2>Tu pedido</h2></div><button onClick={() => setCartOpen(false)} aria-label="Cerrar pedido"><X /></button></header>
              {cart.length === 0 ? (
                <div className="empty-cart"><ShoppingBag size={42} /><h3>Tu pedido está vacío</h3><p>Agrega platos de la carta para empezar.</p><button onClick={() => setCartOpen(false)}>Volver a la carta</button></div>
              ) : (
                <>
                  <div className="cart-lines">
                    {cart.map((line) => (
                      <div className="cart-line" key={`${line.nombre}-${line.precio}`}>
                        <div><strong>{line.nombre}</strong><span>{line.precio}</span></div>
                        <div className="quantity"><button onClick={() => changeQuantity(line, -1)} aria-label={`Quitar una unidad de ${line.nombre}`}><Minus size={15} /></button><span>{line.cantidad}</span><button onClick={() => changeQuantity(line, 1)} aria-label={`Agregar una unidad de ${line.nombre}`}><Plus size={15} /></button></div>
                        <button className="remove" onClick={() => changeQuantity(line, -line.cantidad)} aria-label={`Eliminar ${line.nombre}`}><Trash2 size={17} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="cart-total"><span>Total</span><strong>S/ {total.toFixed(2)}</strong></div>
                  <button className="send-order" onClick={sendOrder}>Enviar pedido por WhatsApp <ChevronRight size={20} /></button>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
