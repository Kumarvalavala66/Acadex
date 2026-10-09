import { useMemo, useRef, useState } from "react";
import "./SwipeRow.css";

export default function SwipeRow({
  children,
  actions = [],
  onAction,
  onCommit,
  actionColor = "#e5484d",
  drawerColor = "#3f3f46",
  rowColor = "#27272a",
  textColor = "#f5f5f5",
  height = 64,
  radius = 16,
  actionWidth = 80,
  direction = "left",
  commitAt = 0.45,
  collapseMs = 180,
  style = {},
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const currentOffset = useRef(0);
  const activePointerId = useRef(null);
  const didDrag = useRef(false);
  const suppressClick = useRef(false);
  const actionMap = useMemo(() => actions, [actions]);
  const maxOffset = actionMap.length * actionWidth * (direction === "left" ? -1 : 1);

  function updateOffset(nextOffset) {
    currentOffset.current = nextOffset;
    setOffset(nextOffset);
  }

  function clamp(value) {
    return direction === "left"
      ? Math.min(0, Math.max(maxOffset, value))
      : Math.max(0, Math.min(maxOffset, value));
  }

  function handlePointerDown(event) {
    if (
      (event.pointerType === "mouse" && event.button !== 0) ||
      event.target.closest("button, a, input, select, textarea")
    ) {
      return;
    }

    activePointerId.current = event.pointerId;
    startX.current = event.clientX;
    startOffset.current = currentOffset.current;
    didDrag.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (event.pointerId !== activePointerId.current) return;
    const delta = event.clientX - startX.current;
    if (Math.abs(delta) >= 6) didDrag.current = true;
    updateOffset(clamp(startOffset.current + delta));
  }

  function finishPointer(event, allowOpen = true) {
    if (event.pointerId !== activePointerId.current) return;

    activePointerId.current = null;
    setDragging(false);
    if (didDrag.current) {
      suppressClick.current = true;
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }

    const revealThreshold = Math.abs(maxOffset) * commitAt;
    const shouldReveal =
      allowOpen &&
      actionMap.length > 0 &&
      Math.abs(currentOffset.current) >= revealThreshold;

    updateOffset(shouldReveal ? maxOffset : 0);
  }

  function handleClickCapture(event) {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function runAction(action) {
    if (onAction) {
      onAction(action);
    } else {
      onCommit?.(action);
    }
    updateOffset(0);
  }

  return (
    <div
      className={`swipe-row-shell swipe-row-${direction}`}
      style={{
        minHeight: height,
        borderRadius: radius,
        ...style,
      }}
      onClickCapture={handleClickCapture}
    >
      <div
        className="swipe-row-actions"
        style={{
          background: drawerColor,
          borderRadius: radius,
          width: `${Math.max(actionMap.length * actionWidth, 0)}px`,
        }}
      >
        {actionMap.map((action) => (
          <button
            key={action.id || action.label}
            type="button"
            className="swipe-row-action"
            style={{
              width: `${actionWidth}px`,
              background: actionColor,
              color: textColor,
            }}
            onClick={() => runAction(action)}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <div
        className={`swipe-row-content ${dragging ? "dragging" : ""}`}
        style={{
          transform: `translateX(${offset}px)`,
          background: rowColor,
          color: textColor,
          borderRadius: radius,
          transition: dragging ? "none" : `transform ${collapseMs}ms ease`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={(event) => finishPointer(event, false)}
      >
        {children}
      </div>
    </div>
  );
}
