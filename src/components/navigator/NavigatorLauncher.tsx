
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Compass } from "lucide-react";

import styles from "./navigator.module.css";

interface NavigatorLauncherProps {
  onClick: () => void;
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = "hackersharbor-navigator-position";
const SIZE = 38;
const EDGE = 16;

const GLIDE_SPEED = 40;
const STOP_DISTANCE = 0.5;
const DIRECTION_THRESHOLD = 8;

export function NavigatorLauncher({ onClick }: NavigatorLauncherProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const positionRef = useRef<Position>({ x: 0, y: 0 });
  const targetRef = useRef<Position>({ x: 0, y: 0 });

  const pendingDragPositionRef = useRef<Position | null>(null);
  const dragFrameRef = useRef<number | null>(null);

  const dragRef = useRef<{
    pointerId: number;
    pointerX: number;
    pointerY: number;
    startPointerX: number;
    startPointerY: number;
    startPosition: Position;
  } | null>(null);

  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);

  const getBounds = useCallback(() => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;

    return {
      minX: EDGE,
      minY: EDGE,
      maxX: Math.max(EDGE, width - SIZE - EDGE),
      maxY: Math.max(EDGE, height - SIZE - EDGE),
    };
  }, []);

  const clamp = useCallback(
    (point: Position): Position => {
      const bounds = getBounds();

      return {
        x: Math.max(bounds.minX, Math.min(point.x, bounds.maxX)),
        y: Math.max(bounds.minY, Math.min(point.y, bounds.maxY)),
      };
    },
    [getBounds]
  );

  const getDirectionalCorner = useCallback(
    (
      start: Position,
      release: Position,
      startPosition: Position
    ): Position => {
      const bounds = getBounds();

      const dx = release.x - start.x;
      const dy = release.y - start.y;

      const middleX = (bounds.minX + bounds.maxX) / 2;
      const middleY = (bounds.minY + bounds.maxY) / 2;

      const goRight =
        Math.abs(dx) > DIRECTION_THRESHOLD
          ? dx > 0
          : startPosition.x >= middleX;

      const goBottom =
        Math.abs(dy) > DIRECTION_THRESHOLD
          ? dy > 0
          : startPosition.y >= middleY;

      return {
        x: goRight ? bounds.maxX : bounds.minX,
        y: goBottom ? bounds.maxY : bounds.minY,
      };
    },
    [getBounds]
  );

  const renderPosition = useCallback((next: Position) => {
    positionRef.current = next;

    let difference =
      targetRotationRef.current - rotationRef.current;

    difference = ((difference + 180) % 360 + 360) % 360 - 180;
    rotationRef.current += difference * 0.2;

    const button = buttonRef.current;

    if (!button) return;

    button.style.transform =
      `translate3d(${next.x}px, ${next.y}px, 0)`;

    const compass = button.querySelector("svg");

    if (compass) {
      compass.style.transform =
        `rotate(${rotationRef.current}deg)`;
    }
  }, []);

  const savePosition = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(positionRef.current)
      );
    } catch {
      // Storage is optional.
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const animate = useCallback(() => {
    if (animationRef.current !== null) return;

    const frame = () => {
      if (dragRef.current) {
        animationRef.current = null;
        return;
      }

      const current = positionRef.current;
      const destination = targetRef.current;

      const dx = destination.x - current.x;
      const dy = destination.y - current.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= STOP_DISTANCE) {
        renderPosition(destination);
        stopAnimation();
        savePosition();
        return;
      }

      // Constant-speed movement directly toward the selected corner.
      // No spring physics or leftover velocity.
      const step = Math.min(GLIDE_SPEED, distance);
      const ratio = step / distance;

      const next = clamp({
        x: current.x + dx * ratio,
        y: current.y + dy * ratio,
      });

      renderPosition(next);

      animationRef.current = requestAnimationFrame(frame);
    };

    animationRef.current = requestAnimationFrame(frame);
  }, [clamp, renderPosition, savePosition, stopAnimation]);

  useEffect(() => {
    setMounted(true);

    const bounds = getBounds();

    let initial: Position = {
      x: bounds.maxX,
      y: bounds.maxY,
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (
          Number.isFinite(parsed.x) &&
          Number.isFinite(parsed.y)
        ) {
          initial = parsed;
        }
      }
    } catch {
      // Use default position.
    }

    const safe = clamp(initial);

    positionRef.current = safe;
    targetRef.current = safe;

    setPosition(safe);

    const handleResize = () => {
      const safePosition = clamp(positionRef.current);

      stopAnimation();

      positionRef.current = safePosition;
      targetRef.current = safePosition;

      renderPosition(safePosition);
      savePosition();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      stopAnimation();

      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
    };
  }, [
    clamp,
    getBounds,
    renderPosition,
    savePosition,
    stopAnimation,
  ]);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (event.button !== 0) return;

    event.preventDefault();
    stopAnimation();

    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    pendingDragPositionRef.current = null;

    event.currentTarget.setPointerCapture(event.pointerId);

    const current = positionRef.current;

    dragRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startPosition: { ...current },
    };

    targetRef.current = current;

    movedRef.current = false;
    suppressClickRef.current = false;
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const totalDx = event.clientX - drag.startPointerX;
    const totalDy = event.clientY - drag.startPointerY;

    if (
      Math.abs(totalDx) > 3 ||
      Math.abs(totalDy) > 3
    ) {
      movedRef.current = true;
    }

    if (!movedRef.current) return;

    if (Math.hypot(totalDx, totalDy) > 0.5) {
      targetRotationRef.current =
        Math.atan2(totalDy, totalDx) * (180 / Math.PI) + 90;
    }

    const next = clamp({
      x: drag.startPosition.x + totalDx,
      y: drag.startPosition.y + totalDy,
    });

    targetRef.current = next;
    pendingDragPositionRef.current = next;

    // Schedule at most one visual update per animation frame.
    if (dragFrameRef.current === null) {
      dragFrameRef.current = requestAnimationFrame(() => {
        dragFrameRef.current = null;

        if (!dragRef.current || !pendingDragPositionRef.current) {
          return;
        }

        renderPosition(pendingDragPositionRef.current);
        pendingDragPositionRef.current = null;
      });
    }
  };

  const finishDrag = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    // Apply the final pointer position before starting the glide.
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    if (pendingDragPositionRef.current) {
      renderPosition(pendingDragPositionRef.current);
      pendingDragPositionRef.current = null;
    }

    if (movedRef.current) {
      suppressClickRef.current = true;

      targetRef.current = getDirectionalCorner(
        {
          x: drag.startPointerX,
          y: drag.startPointerY,
        },
        {
          x: event.clientX,
          y: event.clientY,
        },
        drag.startPosition
      );

      dragRef.current = null;

      animate();
    } else {
      dragRef.current = null;
      stopAnimation();
      savePosition();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      movedRef.current = false;
      return;
    }

    onClick();
  };

  if (!mounted || !position) return null;

  return createPortal(
    <button
      ref={buttonRef}
      type="button"
      className={styles.launcher}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClick={handleClick}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        right: "auto",
        bottom: "auto",
        width: `${SIZE}px`,
        height: `${SIZE}px`,
        minWidth: `${SIZE}px`,
        minHeight: `${SIZE}px`,
        maxWidth: `${SIZE}px`,
        maxHeight: `${SIZE}px`,
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        zIndex: 10000,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: "none",
        cursor: "grab",
        willChange: "transform",
      }}
      aria-label="Open The Navigator assistant"
      title="The Navigator — drag to move"
    >
      <Compass size={22} strokeWidth={2.5} />
    </button>,
    document.body
  );
}
