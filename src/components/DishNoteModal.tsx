import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, MessageSquarePlus, Sparkles, Check } from "lucide-react";
import type { Dish } from "../types";

interface DishNoteModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dish: Dish, cantidad: number, nota: string) => void;
}

const COMMON_TAGS = [
  "Ají aparte",
  "Sin picante",
  "Sin cebolla",
  "Sin culantro",
  "Pescado bien dorado",
  "Bajo en sal",
  "Con bastante limón",
  "Poco arroz",
];

const money = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

export default function DishNoteModal({
  dish,
  isOpen,
  onClose,
  onConfirm,
}: DishNoteModalProps) {
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");

  if (!isOpen || !dish) return null;

  const unitPrice = money(dish.precio);
  const itemTotal = (unitPrice * cantidad).toFixed(2);

  const toggleTag = (tag: string) => {
    if (nota.includes(tag)) {
      const updated = nota
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== tag && s.length > 0)
        .join(", ");
      setNota(updated);
    } else {
      if (nota.trim().length === 0) {
        setNota(tag);
      } else {
        setNota(`${nota.trim()}, ${tag}`);
      }
    }
  };

  const handleAdd = (includeNote: boolean) => {
    onConfirm(dish, cantidad, includeNote ? nota.trim() : "");
    setNota("");
    setCantidad(1);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="dish-note-modal"
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-modal-title"
        >
          {/* Header */}
          <div className="dish-modal-header">
            <div className="dish-modal-badge-row">
              <span className="optional-badge">
                <Sparkles size={13} /> Opcional
              </span>
              <button
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="dish-modal-title">¿Tienes alguna nota para tu pedido?</h2>
            <p className="dish-modal-subtitle">
              Puedes agregar indicaciones especiales para la preparación de tu plato o continuar directamente.
            </p>
          </div>

          {/* Dish preview card */}
          <div className="dish-preview-card">
            <div className="dish-preview-info">
              <h3>{dish.nombre}</h3>
              {dish.descripcion && <p>{dish.descripcion}</p>}
            </div>
            <div className="dish-preview-price">{dish.precio}</div>
          </div>

          {/* Quantity selector */}
          <div className="dish-modal-qty-row">
            <span className="qty-label">Cantidad:</span>
            <div className="modal-quantity-stepper">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                disabled={cantidad <= 1}
                aria-label="Disminuir cantidad"
              >
                <Minus size={15} />
              </button>
              <span className="qty-count">{cantidad}</span>
              <button
                type="button"
                onClick={() => setCantidad((c) => c + 1)}
                aria-label="Aumentar cantidad"
              >
                <Plus size={15} />
              </button>
            </div>
            <span className="qty-subtotal">Subtotal: S/ {itemTotal}</span>
          </div>

          {/* Note Input */}
          <div className="dish-note-section">
            <label htmlFor="dish-note-input" className="note-label">
              <MessageSquarePlus size={15} />
              <span>Indicaciones o notas (Opcional)</span>
            </label>
            <textarea
              id="dish-note-input"
              className="dish-note-textarea"
              rows={3}
              placeholder="Ej: Ají aparte, sin picante, sin cebolla, pescado bien dorado..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              maxLength={160}
            />
            <div className="char-counter">{nota.length}/160 caracteres</div>

            {/* Quick chips */}
            <div className="quick-tags-wrap">
              <span className="quick-tags-title">Sugerencias rápidas:</span>
              <div className="quick-tags-list">
                {COMMON_TAGS.map((tag) => {
                  const isSelected = nota.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      className={`quick-tag-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {isSelected && <Check size={12} />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="dish-modal-actions">
            <button
              type="button"
              className="btn-add-with-note"
              onClick={() => handleAdd(true)}
            >
              Agregar al pedido • S/ {itemTotal}
            </button>
            <button
              type="button"
              className="btn-skip-note"
              onClick={() => handleAdd(false)}
            >
              Omitir nota y agregar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
