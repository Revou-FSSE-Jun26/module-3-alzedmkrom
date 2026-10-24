"use client";

// components/CustomSelect.tsx
//
// A fully custom dropdown that, unlike a native <select>, styles its option
// list consistently in both light and dark mode (native option popups are
// drawn by the OS and ignore CSS theme colors on many platforms).
//
// Accessibility: implements the listbox pattern — the trigger is a button with
// aria-haspopup/aria-expanded, the list is role="listbox", each row is
// role="option" with aria-selected. Keyboard support covers Up/Down to move,
// Enter/Space to choose, Escape to close, and Home/End to jump. It closes on
// outside click and on blur, and returns focus to the trigger on close.

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export interface SelectOption {
  /** The value submitted/selected. */
  value: string;
  /** The human-readable label shown in the list. */
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Accessible label for the control. */
  ariaLabel?: string;
  id?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  // The option currently highlighted via keyboard, as an index into `options`.
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value),
    ),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;

  const selected = options.find((o) => o.value === value);
  const selectedLabel = selected?.label ?? "";

  // Close when clicking outside the component.
  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  // When the menu is open, move focus to the list so arrow keys work
  // immediately. This effect only syncs focus (an external/DOM concern); the
  // highlighted option is set in openMenu() at the moment of opening, not here,
  // which keeps setState out of the effect body.
  useEffect(() => {
    if (isOpen) {
      listRef.current?.focus();
    }
  }, [isOpen]);

  function openMenu() {
    if (disabled) return;
    // Highlight the currently selected option as we open.
    const current = options.findIndex((o) => o.value === value);
    setActiveIndex(current === -1 ? 0 : current);
    setIsOpen(true);
  }

  function closeMenu(returnFocus = true) {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    closeMenu();
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Enter":
      case " ":
        event.preventDefault();
        openMenu();
        break;
      default:
        break;
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (isOpen ? closeMenu(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-[#252b35] dark:text-white"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listboxId}-opt-${activeIndex}`}
          onKeyDown={onListKeyDown}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-black/15 bg-white py-1 shadow-lg focus:outline-none dark:border-white/20 dark:bg-[#252b35]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  isActive
                    ? "bg-blue-500/15 text-black dark:bg-white/10 dark:text-white"
                    : "text-black dark:text-white"
                } ${isSelected ? "font-semibold" : ""}`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
