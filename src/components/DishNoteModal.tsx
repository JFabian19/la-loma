import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Plus,
  Minus,
  MessageSquarePlus,
  Sparkles,
  Check,
  AlertCircle,
  UtensilsCrossed,
} from "lucide-react";
import type { Dish, DishOptionItem } from "../types";

interface DishNoteModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    dish: Dish,
    cantidad: number,
    nota: string,
    opcionesSeleccionadas?: string[]
  ) => void;
}

const COMMON_TAGS = [
  "Ají aparte",
  "Sin picante",
  "Sin cebolla",
  "Sin culantro",
  "Pescado bien dorado",
  "Bajo en sal",
  "Poco arroz",
  "Con bastante limón",
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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  // Reset state whenever modal opens or dish changes
  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setNota("");
      setSelectedOptions([]);
      setLimitNotice(null);
    }
  }, [isOpen, dish]);

  if (!isOpen || !dish) return null;

  const unitPrice = money(dish.precio);
  const itemTotal = (unitPrice * cantidad).toFixed(2);
  const hasOptions = Boolean(dish.opcionesConfig && dish.opcionesConfig.opciones.length > 0);
  const requiredMax = dish.opcionesConfig?.max || 3;
  const isTrioComplete = !hasOptions || selectedOptions.length === requiredMax;

  // Options count helper for each dish option
  const getOptionCount = (optionName: string) =>
    selectedOptions.filter((name) => name === optionName).length;

  const handleAddOption = (option: DishOptionItem) => {
    if (selectedOptions.length >= requiredMax) {
      setLimitNotice(`¡Ya tienes tus ${requiredMax} opciones elegidas! Puedes quitar una para cambiarla.`);
      setTimeout(() => setLimitNotice(null), 3500);
      return;
    }
    setLimitNotice(null);
    setSelectedOptions((prev) => [...prev, option.nombre]);
  };

  const handleRemoveOptionByName = (optionName: string) => {
    setLimitNotice(null);
    setSelectedOptions((prev) => {
      const idx = prev.lastIndexOf(optionName);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const handleRemoveOptionAtSlot = (index: number) => {
    setLimitNotice(null);
    setSelectedOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleCard = (option: DishOptionItem) => {
    const count = getOptionCount(option.nombre);
    if (count > 0 && selectedOptions.length === requiredMax) {
      // Remove one instance to allow changing
      handleRemoveOptionByName(option.nombre);
    } else if (selectedOptions.length < requiredMax) {
      handleAddOption(option);
    } else {
      setLimitNotice(`¡Ya tienes tus ${requiredMax} opciones elegidas! Quita una para elegir ${option.nombre}.`);
      setTimeout(() => setLimitNotice(null), 3500);
    }
  };

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
    if (hasOptions && selectedOptions.length < requiredMax) {
      setLimitNotice(`Por favor selecciona ${requiredMax} opciones para armar tu ${dish.nombre}.`);
      return;
    }

    onConfirm(
      dish,
      cantidad,
      includeNote ? nota.trim() : "",
      hasOptions ? selectedOptions : undefined
    );
    setNota("");
    setCantidad(1);
    setSelectedOptions([]);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className={`dish-note-modal ${hasOptions ? "customizer-modal" : ""}`}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-modal-title"
        >
          {/* Header */}
          <div className="dish-modal-header">
            <div className="dish-modal-badge-row">
              <span className={`optional-badge ${hasOptions ? "badge-customizer" : ""}`}>
                {hasOptions ? (
                  <>
                    <UtensilsCrossed size={13} /> Arma tus 3 especialidades
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Opcional
                  </>
                )}
              </span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="dish-modal-title">
              {hasOptions ? `Personaliza tu ${dish.nombre}` : "¿Tienes alguna nota para tu pedido?"}
            </h2>
            <p className="dish-modal-subtitle">
              {hasOptions
                ? "Elige 3 especialidades de la carta para armar tu combinación perfecta servida al momento."
                : "Agrega indicaciones para cocina (ej: ají aparte, sin picante) o continúa directamente."}
            </p>
          </div>

          {/* Dish preview card with image */}
          <div className="dish-preview-card">
            {dish.imagen && (
              <img
                src={dish.imagen}
                alt={dish.nombre}
                className="dish-preview-image"
                loading="lazy"
              />
            )}
            <div className="dish-preview-info">
              <h3>{dish.nombre}</h3>
              {dish.descripcion && <p>{dish.descripcion}</p>}
            </div>
            <div className="dish-preview-price">{dish.precio}</div>
          </div>

          {/* TRIO OPTIONS SELECTOR (If dish has opcionesConfig) */}
          {hasOptions && dish.opcionesConfig && (
            <div className="trio-selector-section">
              {/* Slots and progress */}
              <div className="trio-slots-header">
                <div className="trio-slots-title-wrap">
                  <h4>{dish.opcionesConfig.titulo}</h4>
                  <span className="trio-slots-sub">
                    {dish.opcionesConfig.subtitulo || `Elige exactamente ${requiredMax} opciones`}
                  </span>
                </div>
                <div className={`trio-count-pill ${isTrioComplete ? "pill-complete" : "pill-pending"}`}>
                  {isTrioComplete ? (
                    <>
                      <Check size={13} /> {selectedOptions.length} de {requiredMax} listos
                    </>
                  ) : (
                    <>Faltan {requiredMax - selectedOptions.length} de {requiredMax}</>
                  )}
                </div>
              </div>

              {/* 3 Visual Slots */}
              <div className="trio-visual-slots" aria-label="Opciones seleccionadas">
                {Array.from({ length: requiredMax }).map((_, slotIdx) => {
                  const optionName = selectedOptions[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className={`trio-slot-card ${optionName ? "slot-filled" : "slot-empty"}`}
                    >
                      <span className="slot-idx-badge">{slotIdx + 1}</span>
                      {optionName ? (
                        <>
                          <span className="slot-item-title">{optionName}</span>
                          <button
                            type="button"
                            className="slot-remove-btn"
                            onClick={() => handleRemoveOptionAtSlot(slotIdx)}
                            title={`Quitar ${optionName}`}
                            aria-label={`Quitar ${optionName} del espacio ${slotIdx + 1}`}
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="slot-placeholder-text">Opción {slotIdx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Notice if user exceeds or tries to pick more */}
              {limitNotice && (
                <div className="trio-limit-notice" role="alert">
                  <AlertCircle size={15} />
                  <span>{limitNotice}</span>
                </div>
              )}

              {/* List of 6 available options to pick */}
              <div className="trio-options-grid">
                {dish.opcionesConfig.opciones.map((option) => {
                  const count = getOptionCount(option.nombre);
                  const isSelected = count > 0;
                  const canAddMore = selectedOptions.length < requiredMax;

                  return (
                    <div
                      key={option.id}
                      className={`trio-option-card ${isSelected ? "card-selected" : ""} ${
                        !canAddMore && !isSelected ? "card-disabled" : ""
                      }`}
                      onClick={() => handleToggleCard(option)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleToggleCard(option);
                        }
                      }}
                    >
                      {option.imagen && (
                        <img
                          src={option.imagen}
                          alt={option.nombre}
                          className="trio-option-thumb"
                          loading="lazy"
                        />
                      )}
                      <div className="trio-option-body">
                        <div className="trio-option-head">
                          <h5>{option.nombre}</h5>
                          {count > 0 && (
                            <span className="trio-option-count-badge">
                              ✓ {count > 1 ? `x${count}` : "Elegido"}
                            </span>
                          )}
                        </div>
                        {option.descripcion && (
                          <p className="trio-option-desc">{option.descripcion}</p>
                        )}
                      </div>

                      {/* Stepper or Select button */}
                      <div
                        className="trio-option-controls"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {count > 0 ? (
                          <div className="trio-mini-stepper">
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionByName(option.nombre)}
                              aria-label={`Disminuir ${option.nombre}`}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="stepper-val">{count}</span>
                            <button
                              type="button"
                              onClick={() => handleAddOption(option)}
                              disabled={!canAddMore}
                              aria-label={`Aumentar ${option.nombre}`}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-select-option"
                            onClick={() => handleAddOption(option)}
                            disabled={!canAddMore}
                            aria-label={`Elegir ${option.nombre}`}
                          >
                            <Plus size={13} /> Elegir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="dish-modal-qty-row">
            <div className="qty-stepper-group">
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
            </div>

            <div className="qty-subtotal-group">
              <span className="subtotal-label">Subtotal:</span>
              <strong className="subtotal-amount">S/ {itemTotal}</strong>
            </div>
          </div>

          {/* Note Input */}
          <div className="dish-note-section">
            <label htmlFor="dish-note-input" className="note-label">
              <MessageSquarePlus size={15} />
              <span>Indicaciones o notas para cocina (Opcional)</span>
            </label>
            <textarea
              id="dish-note-input"
              className="dish-note-textarea"
              rows={2}
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
              className={`btn-add-with-note ${!isTrioComplete ? "btn-disabled" : ""}`}
              onClick={() => handleAdd(true)}
              disabled={!isTrioComplete}
            >
              {hasOptions
                ? isTrioComplete
                  ? `Agregar Trío al pedido • S/ ${itemTotal}`
                  : `Elige 3 opciones (te faltan ${requiredMax - selectedOptions.length}) • S/ ${itemTotal}`
                : `Agregar al pedido • S/ ${itemTotal}`}
            </button>
            {!hasOptions && (
              <button
                type="button"
                className="btn-skip-note"
                onClick={() => handleAdd(false)}
              >
                Omitir nota y agregar
              </button>
            )}
            {hasOptions && (
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={onClose}
              >
                Cancelar
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
