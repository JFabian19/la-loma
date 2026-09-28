import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ArrowLeft,
  Bike,
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Phone,
  User,
  Home,
  Navigation,
  Loader2,
} from "lucide-react";
import type { CartItem, OrderMode, DeliveryFormData, PickupFormData } from "../types";

const PHONE = "51961261750";
const PHONE_LABEL = "961 261 750";
const STORE_MAPS_URL = "https://maps.app.goo.gl/V3Ct5PnPisJ2jYXr6";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (item: CartItem, amount: number) => void;
  onRemoveItem: (item: CartItem) => void;
  onUpdateNote: (item: CartItem, newNote: string) => void;
  onClearCart: () => void;
}

const money = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote,
  onClearCart,
}: CartDrawerProps) {
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [mode, setMode] = useState<OrderMode>("delivery");

  // Delivery state
  const [deliveryData, setDeliveryData] = useState<DeliveryFormData>({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    referencia: "",
    gpsCoords: null,
    gpsUrl: "",
  });

  // Pickup state
  const [pickupData, setPickupData] = useState<PickupFormData>({
    nombre: "",
    apellido: "",
    telefono: "",
  });

  // Geolocation loading/status
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [geoErrorMsg, setGeoErrorMsg] = useState("");

  // Inline note editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const total = cart.reduce((sum, item) => sum + money(item.dish.precio) * item.cantidad, 0);

  // Handle Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoErrorMsg("Tu navegador o teléfono no soporta geolocalización.");
      return;
    }

    setGeoStatus("loading");
    setGeoErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

        setDeliveryData((prev) => ({
          ...prev,
          gpsCoords: {
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
          },
          gpsUrl: mapsLink,
        }));
        setGeoStatus("success");
      },
      (error) => {
        setGeoStatus("error");
        if (error.code === error.PERMISSION_DENIED) {
          setGeoErrorMsg("Permiso GPS denegado. Puedes escribir tu dirección y referencia.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoErrorMsg("Ubicación GPS no disponible en este momento.");
        } else {
          setGeoErrorMsg("Tiempo de espera agotado al conectar con el GPS.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleStartEditNote = (item: CartItem) => {
    setEditingNoteId(item.id);
    setEditingNoteText(item.nota || "");
  };

  const handleSaveEditNote = (item: CartItem) => {
    onUpdateNote(item, editingNoteText.trim());
    setEditingNoteId(null);
  };

  const validateCheckout = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === "delivery") {
      if (!deliveryData.nombre.trim()) errors.nombre = "Ingresa tu nombre";
      if (!deliveryData.apellido.trim()) errors.apellido = "Ingresa tu apellido";
      if (!deliveryData.telefono.trim()) errors.telefono = "Ingresa tu número de teléfono";
      else if (!/^\d{8,11}$/.test(deliveryData.telefono.replace(/\s+/g, ""))) {
        errors.telefono = "Ingresa un teléfono válido de 9 dígitos";
      }
      if (!deliveryData.direccion.trim()) errors.direccion = "Ingresa tu dirección de entrega";
    } else {
      if (!pickupData.nombre.trim()) errors.nombre = "Ingresa tu nombre";
      if (!pickupData.apellido.trim()) errors.apellido = "Ingresa tu apellido";
      if (!pickupData.telefono.trim()) errors.telefono = "Ingresa tu número de teléfono";
      else if (!/^\d{8,11}$/.test(pickupData.telefono.replace(/\s+/g, ""))) {
        errors.telefono = "Ingresa un teléfono válido de 9 dígitos";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOrder = () => {
    if (!validateCheckout()) return;

    let message = "";

    const detailLines = cart
      .map((item) => {
        let line = `• ${item.cantidad} x ${item.dish.nombre} (${item.dish.precio})`;
        if (item.opcionesSeleccionadas && item.opcionesSeleccionadas.length > 0) {
          line += `\n  ↳ 🍤 Trío: ${item.opcionesSeleccionadas.join(" + ")}`;
        }
        if (item.nota && item.nota.trim().length > 0) {
          line += `\n  ↳ 📝 Nota: ${item.nota.trim()}`;
        }
        return line;
      })
      .join("\n\n");

    if (mode === "delivery") {
      const nombreCompleto = `${deliveryData.nombre.trim()} ${deliveryData.apellido.trim()}`;
      message = `🌊 *NUEVO PEDIDO - LA LOMA RESTOBAR* 🌊
══════════════════════════════
🛵 *MODALIDAD:* Delivery a domicilio

👤 *DATOS DEL CLIENTE:*
• *Nombre:* ${nombreCompleto}
• *Teléfono:* ${deliveryData.telefono.trim()}
• *Dirección:* ${deliveryData.direccion.trim()}
• *Referencia:* ${deliveryData.referencia.trim() || "No especificada"}
• *Ubicación GPS:* ${deliveryData.gpsUrl || "No proporcionada (ver dirección/referencia)"}

🍽️ *DETALLE DEL PEDIDO:*
${detailLines}

══════════════════════════════
💵 *TOTAL A PAGAR:* S/ ${total.toFixed(2)}
══════════════════════════════

_Por favor confírmenme el tiempo estimado de entrega y los métodos de pago disponibles (Yape/Plin/Efectivo). ¡Muchas gracias!_`;
    } else {
      const nombreCompleto = `${pickupData.nombre.trim()} ${pickupData.apellido.trim()}`;
      message = `🌊 *NUEVO PEDIDO - LA LOMA RESTOBAR* 🌊
══════════════════════════════
🏪 *MODALIDAD:* Recoger en tienda (Local)

👤 *DATOS DE QUIEN RECOGE:*
• *Nombre:* ${nombreCompleto}
• *Teléfono:* ${pickupData.telefono.trim()}
📍 *Punto de recojo:* Cevichería "La Loma" - Av. Dos de Mayo con 26 de Diciembre (${STORE_MAPS_URL})

🍽️ *DETALLE DEL PEDIDO:*
${detailLines}

══════════════════════════════
💵 *TOTAL A PAGAR:* S/ ${total.toFixed(2)}
══════════════════════════════

_Por favor confírmenme en cuánto tiempo estará listo para pasar a recogerlo. ¡Muchas gracias!_`;
    }

    setOrderSentSuccess(true);
    const whatsappUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCloseAll = () => {
    setOrderSentSuccess(false);
    setStep("cart");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="cart-backdrop" onClick={handleCloseAll}>
        <motion.aside
          className="cart-panel-improved"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Panel de pedido"
        >
          {/* Top Bar Header */}
          <div className="cart-topbar-header">
            <div className="cart-topbar-left">
              {step === "checkout" && (
                <button
                  type="button"
                  className="cart-back-btn"
                  onClick={() => setStep("cart")}
                  aria-label="Volver al carrito"
                >
                  <ArrowLeft size={19} />
                </button>
              )}
              <div className="cart-header-titles">
                <span className="cart-super-badge">La Loma Restobar</span>
                <h2>{step === "cart" ? "Tu Pedido" : "Datos de Entrega"}</h2>
              </div>
            </div>

            <div className="cart-topbar-right">
              {step === "cart" && cart.length > 0 && (
                <button
                  type="button"
                  className="cart-clear-btn"
                  onClick={() => {
                    if (window.confirm("¿Deseas vaciar todos los productos del carrito?")) {
                      onClearCart();
                    }
                  }}
                  title="Vaciar carrito"
                >
                  <Trash2 size={15} />
                  <span>Vaciar</span>
                </button>
              )}
              <button
                type="button"
                className="cart-close-circle"
                onClick={handleCloseAll}
                aria-label="Cerrar pedido"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-icon-wrap">
                <ShoppingBag size={46} />
              </div>
              <h3>Tu pedido está vacío</h3>
              <p>Agrega los mejores ceviches, chicharrones y platos amazónicos para iniciar tu orden.</p>
              <button type="button" className="btn-explore-menu" onClick={handleCloseAll}>
                Ver la carta
              </button>
            </div>
          ) : orderSentSuccess ? (
            <div className="order-success-screen">
              <div className="success-icon-wrap">
                <CheckCircle2 size={52} />
              </div>
              <h3>¡Pedido enviado a WhatsApp!</h3>
              <p>
                Hemos abierto tu WhatsApp con el resumen completo de tu orden. Por favor dale al botón{" "}
                <strong>"Enviar"</strong> en WhatsApp para confirmarlo de inmediato con La Loma.
              </p>
              <div className="success-recap-box">
                <div className="recap-row">
                  <span>Modalidad:</span>
                  <strong>{mode === "delivery" ? "🛵 Delivery a domicilio" : "🏪 Recojo en tienda"}</strong>
                </div>
                <div className="recap-row">
                  <span>Platos ordenados:</span>
                  <strong>{cartCount} plato(s)</strong>
                </div>
                <div className="recap-row total">
                  <span>Total a pagar:</span>
                  <strong>S/ {total.toFixed(2)}</strong>
                </div>
              </div>
              <div className="success-actions">
                <button
                  type="button"
                  className="btn-reopen-whatsapp"
                  onClick={handleSendOrder}
                >
                  Reabrir WhatsApp
                </button>
                <button
                  type="button"
                  className="btn-finish-order"
                  onClick={() => {
                    onClearCart();
                    handleCloseAll();
                  }}
                >
                  Finalizar y nuevo pedido
                </button>
              </div>
            </div>
          ) : step === "cart" ? (
            /* STEP 1: CART ITEMS */
            <div className="cart-step-container">
              <div className="cart-promo-banner">
                <Sparkles size={16} />
                <span>Pescados y mariscos frescos preparados al momento en Puerto Maldonado</span>
              </div>

              <div className="cart-items-scroll">
                {cart.map((item) => {
                  const itemPrice = money(item.dish.precio);
                  const lineTotal = (itemPrice * item.cantidad).toFixed(2);
                  const isEditingNote = editingNoteId === item.id;

                  return (
                    <article className="cart-item-card" key={item.id}>
                      <div className="cart-item-top">
                        <div className="cart-item-info">
                          <h4 className="cart-item-title">{item.dish.nombre}</h4>
                          <span className="cart-item-unit-price">{item.dish.precio} c/u</span>

                          {item.opcionesSeleccionadas && item.opcionesSeleccionadas.length > 0 && (
                            <div className="cart-trio-selected-box">
                              <span className="cart-trio-label">
                                <Sparkles size={12} /> Trío elegido:
                              </span>
                              <div className="cart-trio-tags">
                                {item.opcionesSeleccionadas.map((opt, idx) => (
                                  <span key={idx} className="cart-trio-pill">
                                    ✓ {opt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="cart-item-delete"
                          onClick={() => onRemoveItem(item)}
                          title={`Eliminar ${item.dish.nombre}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Notes Section */}
                      {isEditingNote ? (
                        <div className="cart-note-edit-box">
                          <textarea
                            rows={2}
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            placeholder="Escribe la indicación para este plato..."
                            maxLength={140}
                          />
                          <div className="note-edit-actions">
                            <button
                              type="button"
                              className="btn-save-note"
                              onClick={() => handleSaveEditNote(item)}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="btn-cancel-note"
                              onClick={() => setEditingNoteId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : item.nota && item.nota.trim().length > 0 ? (
                        <div className="cart-item-note-badge">
                          <div className="note-content">
                            <MessageSquare size={13} />
                            <span>
                              <strong>Nota:</strong> {item.nota}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn-edit-inline-note"
                            onClick={() => handleStartEditNote(item)}
                          >
                            Editar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-add-inline-note"
                          onClick={() => handleStartEditNote(item)}
                        >
                          <Plus size={12} /> Agregar nota / indicación
                        </button>
                      )}

                      {/* Bottom Controls */}
                      <div className="cart-item-bottom">
                        <div className="cart-stepper">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item, -1)}
                            aria-label="Restar una unidad"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="stepper-val">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item, 1)}
                            aria-label="Sumar una unidad"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="cart-item-subtotal">
                          <span>Subtotal:</span>
                          <strong>S/ {lineTotal}</strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Cart Footer Summary */}
              <div className="cart-footer-summary">
                <div className="summary-row">
                  <span>Cantidad de platos:</span>
                  <strong>{cartCount}</strong>
                </div>
                <div className="summary-total-row">
                  <div>
                    <span className="summary-total-label">Total estimado</span>
                    <small>No incluye costo de delivery según distancia</small>
                  </div>
                  <strong className="summary-total-value">S/ {total.toFixed(2)}</strong>
                </div>

                <button
                  type="button"
                  className="btn-continue-checkout"
                  onClick={() => setStep("checkout")}
                >
                  <span>Continuar con el pedido</span>
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: CHECKOUT (DELIVERY VS PICKUP) - RESPONSIVE OPTIMIZED */
            <div className="cart-step-container checkout-container">
              {/* Delivery Tabs (Compact & Responsive) */}
              <div className="delivery-tabs-segmented" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "delivery"}
                  className={`tab-btn ${mode === "delivery" ? "active" : ""}`}
                  onClick={() => {
                    setMode("delivery");
                    setValidationErrors({});
                  }}
                >
                  <Bike size={18} />
                  <span>Delivery</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "pickup"}
                  className={`tab-btn ${mode === "pickup" ? "active" : ""}`}
                  onClick={() => {
                    setMode("pickup");
                    setValidationErrors({});
                  }}
                >
                  <Store size={18} />
                  <span>Recojo en tienda</span>
                </button>
              </div>

              {/* Mode Specific Form */}
              <div className="checkout-fields-scroll">
                {mode === "delivery" ? (
                  <div className="form-group-wrap">
                    {/* Names Grid */}
                    <div className="form-two-cols">
                      <div className="form-field">
                        <label htmlFor="del-nombre">
                          <User size={14} /> Nombre *
                        </label>
                        <input
                          id="del-nombre"
                          type="text"
                          placeholder="Tu nombre"
                          value={deliveryData.nombre}
                          onChange={(e) => {
                            setDeliveryData({ ...deliveryData, nombre: e.target.value });
                            if (validationErrors.nombre) {
                              setValidationErrors((prev) => ({ ...prev, nombre: "" }));
                            }
                          }}
                          className={validationErrors.nombre ? "input-error" : ""}
                        />
                        {validationErrors.nombre && (
                          <span className="error-text">{validationErrors.nombre}</span>
                        )}
                      </div>

                      <div className="form-field">
                        <label htmlFor="del-apellido">
                          <User size={14} /> Apellido *
                        </label>
                        <input
                          id="del-apellido"
                          type="text"
                          placeholder="Tu apellido"
                          value={deliveryData.apellido}
                          onChange={(e) => {
                            setDeliveryData({ ...deliveryData, apellido: e.target.value });
                            if (validationErrors.apellido) {
                              setValidationErrors((prev) => ({ ...prev, apellido: "" }));
                            }
                          }}
                          className={validationErrors.apellido ? "input-error" : ""}
                        />
                        {validationErrors.apellido && (
                          <span className="error-text">{validationErrors.apellido}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="del-telefono">
                        <Phone size={14} /> Teléfono / WhatsApp *
                      </label>
                      <input
                        id="del-telefono"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Ej: 961 261 750"
                        value={deliveryData.telefono}
                        onChange={(e) => {
                          setDeliveryData({ ...deliveryData, telefono: e.target.value });
                          if (validationErrors.telefono) {
                            setValidationErrors((prev) => ({ ...prev, telefono: "" }));
                          }
                        }}
                        className={validationErrors.telefono ? "input-error" : ""}
                      />
                      {validationErrors.telefono && (
                        <span className="error-text">{validationErrors.telefono}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="del-direccion">
                        <Home size={14} /> Dirección de entrega *
                      </label>
                      <input
                        id="del-direccion"
                        type="text"
                        placeholder="Ej: Jr. Loreto 450, Mz. B Lt. 12"
                        value={deliveryData.direccion}
                        onChange={(e) => {
                          setDeliveryData({ ...deliveryData, direccion: e.target.value });
                          if (validationErrors.direccion) {
                            setValidationErrors((prev) => ({ ...prev, direccion: "" }));
                          }
                        }}
                        className={validationErrors.direccion ? "input-error" : ""}
                      />
                      {validationErrors.direccion && (
                        <span className="error-text">{validationErrors.direccion}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="del-referencia">
                        <Navigation size={14} /> Referencia de llegada
                      </label>
                      <input
                        id="del-referencia"
                        type="text"
                        placeholder="Ej: Casa azul de dos pisos, frente a la farmacia"
                        value={deliveryData.referencia}
                        onChange={(e) =>
                          setDeliveryData({ ...deliveryData, referencia: e.target.value })
                        }
                      />
                    </div>

                    {/* Geolocation Section */}
                    <div className="location-section-box">
                      <div className="location-box-header">
                        <MapPin size={18} className="loc-pin-icon" />
                        <div>
                          <strong>Ubicación GPS precisa</strong>
                          <p>Para que el repartidor llegue directo a tu puerta</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`btn-share-location ${geoStatus}`}
                        onClick={handleGetLocation}
                        disabled={geoStatus === "loading"}
                      >
                        {geoStatus === "loading" ? (
                          <>
                            <Loader2 size={17} className="spin-icon" />
                            <span>Detectando GPS...</span>
                          </>
                        ) : geoStatus === "success" ? (
                          <>
                            <CheckCircle2 size={17} />
                            <span>Ubicación GPS lista ✓ (Actualizar)</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={17} />
                            <span>Compartir mi ubicación actual</span>
                          </>
                        )}
                      </button>

                      {/* Explicit instruction note as requested */}
                      <div className="location-instruction-note">
                        <span className="note-bulb">💡</span>
                        <span>
                          <strong>Nota:</strong> Haz clic en el botón de arriba para compartir tu
                          ubicación en tiempo real. Se enviará un enlace de Google Maps por WhatsApp para que
                          el repartidor tenga la mejor referencia y llegue rápidamente.
                        </span>
                      </div>

                      {geoStatus === "success" && deliveryData.gpsCoords && (
                        <div className="location-success-badge">
                          <div className="loc-badge-left">
                            <CheckCircle2 size={15} />
                            <span>GPS listo (±{deliveryData.gpsCoords.accuracy}m)</span>
                          </div>
                          <a
                            href={deliveryData.gpsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="location-preview-link"
                          >
                            Ver en mapa <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {geoStatus === "error" && (
                        <div className="location-error-badge">
                          <AlertCircle size={15} />
                          <span>{geoErrorMsg}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* PICKUP MODE */
                  <div className="form-group-wrap">
                    <div className="pickup-info-banner">
                      <Store size={22} className="pickup-store-icon" />
                      <div>
                        <strong>Local La Loma Restobar</strong>
                        <p>Av. Dos de Mayo con 26 de Diciembre, Puerto Maldonado</p>
                        <a
                          href={STORE_MAPS_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="pickup-map-link"
                        >
                          Ver en Google Maps <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    <div className="form-two-cols">
                      <div className="form-field">
                        <label htmlFor="pick-nombre">
                          <User size={14} /> Nombre *
                        </label>
                        <input
                          id="pick-nombre"
                          type="text"
                          placeholder="Tu nombre"
                          value={pickupData.nombre}
                          onChange={(e) => {
                            setPickupData({ ...pickupData, nombre: e.target.value });
                            if (validationErrors.nombre) {
                              setValidationErrors((prev) => ({ ...prev, nombre: "" }));
                            }
                          }}
                          className={validationErrors.nombre ? "input-error" : ""}
                        />
                        {validationErrors.nombre && (
                          <span className="error-text">{validationErrors.nombre}</span>
                        )}
                      </div>

                      <div className="form-field">
                        <label htmlFor="pick-apellido">
                          <User size={14} /> Apellido *
                        </label>
                        <input
                          id="pick-apellido"
                          type="text"
                          placeholder="Tu apellido"
                          value={pickupData.apellido}
                          onChange={(e) => {
                            setPickupData({ ...pickupData, apellido: e.target.value });
                            if (validationErrors.apellido) {
                              setValidationErrors((prev) => ({ ...prev, apellido: "" }));
                            }
                          }}
                          className={validationErrors.apellido ? "input-error" : ""}
                        />
                        {validationErrors.apellido && (
                          <span className="error-text">{validationErrors.apellido}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="pick-telefono">
                        <Phone size={14} /> Teléfono de contacto *
                      </label>
                      <input
                        id="pick-telefono"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Ej: 961 261 750"
                        value={pickupData.telefono}
                        onChange={(e) => {
                          setPickupData({ ...pickupData, telefono: e.target.value });
                          if (validationErrors.telefono) {
                            setValidationErrors((prev) => ({ ...prev, telefono: "" }));
                          }
                        }}
                        className={validationErrors.telefono ? "input-error" : ""}
                      />
                      {validationErrors.telefono && (
                        <span className="error-text">{validationErrors.telefono}</span>
                      )}
                    </div>

                    <div className="pickup-time-note">
                      <span>⏱️</span>
                      <p>
                        Tu pedido empezará a prepararse de inmediato. Te confirmaremos por WhatsApp cuando esté
                        listo para retirar en el mostrador.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Footer */}
              <div className="checkout-footer-summary">
                <div className="checkout-summary-bar">
                  <div className="recap-pill">
                    <strong>{cartCount} plato(s)</strong>
                    <span>•</span>
                    <strong>{mode === "delivery" ? "Delivery" : "Recojo"}</strong>
                  </div>
                  <div className="recap-total">
                    <span>Total:</span>
                    <strong>S/ {total.toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-send-whatsapp-final"
                  onClick={handleSendOrder}
                >
                  <MessageSquare size={18} />
                  <span>Enviar pedido por WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}
