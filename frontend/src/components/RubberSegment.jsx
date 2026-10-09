import { useEffect, useRef, useState } from "react";
import "./RubberSegment.css";

export default function RubberSegment({
  items = [],
  defaultValue,
  onChange,

  trackColor = "#27272a",
  thumbColor = "#fafafa",
  textColor = "#fafafa",
  activeTextColor = "#18181b",

  size = "md",
  radius = 10,
  inset = 3,

  equalSlots = true,

  stretch = 100,
  squash = 3,
  speed = 1,
  glide = 75,

  draggable = true,
  disabled = false,
}) {
  const initialIndex = Math.max(0, items.indexOf(defaultValue));

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const [dragging, setDragging] = useState(false);

  const ref = useRef(null);

  /*
   * Keep the active index synchronized when the
   * parent changes defaultValue.
   */
  useEffect(() => {
    const index = items.indexOf(defaultValue);

    if (index >= 0) {
      setActiveIndex(index);
    }
  }, [defaultValue, items]);

  /*
   * Nothing to render if there are no items.
   */
  if (!items.length) {
    return null;
  }

  function selectIndex(index) {
    if (disabled) return;

    const safeIndex = Math.max(0, Math.min(index, items.length - 1));

    setActiveIndex(safeIndex);

    if (onChange) {
      onChange(items[safeIndex], safeIndex);
    }
  }

  /*
   * Convert pointer position into a segment index.
   */
  function getIndexFromPointer(event) {
    if (!ref.current || !items.length) {
      return 0;
    }

    const rect = ref.current.getBoundingClientRect();

    if (rect.width <= 0) {
      return 0;
    }

    const percentage = (event.clientX - rect.left) / rect.width;

    const clampedPercentage = Math.max(0, Math.min(percentage, 0.999999));

    return Math.floor(clampedPercentage * items.length);
  }

  function handlePointerDown(event) {
    if (!draggable || disabled) return;

    setDragging(true);

    const index = getIndexFromPointer(event);

    selectIndex(index);

    /*
     * Capture the pointer so dragging continues even
     * if the pointer moves outside the component.
     */
    if (ref.current?.setPointerCapture) {
      ref.current.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerMove(event) {
    if (!dragging || !ref.current) return;

    const index = getIndexFromPointer(event);

    selectIndex(index);
  }

  function handlePointerUp(event) {
    setDragging(false);

    if (ref.current?.hasPointerCapture?.(event.pointerId)) {
      ref.current.releasePointerCapture(event.pointerId);
    }
  }

  const transitionDuration = Math.max(0.1, 0.35 / speed);

  const thumbWidth = equalSlots
    ? `calc(${100 / items.length}% - ${inset * 2}px)`
    : undefined;

  const thumbLeft = equalSlots
    ? `calc(${activeIndex * (100 / items.length)}% + ${inset}px)`
    : undefined;

  return (
    <div
      ref={ref}
      className={`rubber-segment rubber-${size} ${
        dragging ? "is-dragging" : ""
      }`}
      style={{
        "--track": trackColor,
        "--thumb": thumbColor,
        "--text": textColor,
        "--active-text": activeTextColor,

        "--radius": `${radius}px`,
        "--inset": `${inset}px`,

        "--stretch": `${stretch}%`,
        "--squash": squash,
        "--glide": `${glide}ms`,

        "--transition": `${transitionDuration}s cubic-bezier(.2,.9,.25,1)`,

        /*
         * Important:
         * RubberSegment.css uses this value to create
         * the correct number of grid columns.
         */
        "--slots": items.length,

        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="rubber-thumb"
        style={{
          width: thumbWidth,
          left: thumbLeft,
        }}
      />

      {items.map((item, index) => (
        <button
          type="button"
          key={item}
          className={
            index === activeIndex ? "rubber-item active" : "rubber-item"
          }
          onClick={() => selectIndex(index)}
          style={{
            color: index === activeIndex ? activeTextColor : textColor,
          }}
          disabled={disabled}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
