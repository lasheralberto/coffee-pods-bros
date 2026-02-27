import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroupProps {
  /** Título visible del grupo, ej. "Roast Level" */
  title: string;
  /** Lista de opciones radio */
  options: FilterOption[];
  /** Valor actualmente seleccionado */
  selected: string;
  /** Callback al cambiar selección */
  onChange: (value: string) => void;
  /** Nombre del radio group (debe ser único) */
  name: string;
  /** Abierto por defecto */
  defaultOpen?: boolean;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  options,
  selected,
  onChange,
  name,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const isActive = selected !== 'any';

  return (
    <div className="border-t border-border-color">
      {/* Header — toggle accordion */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 min-h-[44px] text-left hover:opacity-80 transition-opacity"
        aria-expanded={open}
      >
        <span className={`text-sm ${isActive ? 'font-semibold' : ''} text-primary`}>
          {title}
        </span>
        {open ? (
          <Minus size={15} className="text-muted shrink-0" />
        ) : (
          <Plus size={15} className="text-muted shrink-0" />
        )}
      </button>

      {/* Body — opciones radio */}
      {open && (
        <fieldset className="flex flex-col gap-2 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 text-sm text-primary cursor-pointer group min-h-[32px]"
            >
              <input
                type="radio"
                name={name}
                checked={selected === value}
                onChange={() => onChange(value)}
                className="h-4 w-4 accent-[var(--color-roast)] cursor-pointer shrink-0"
              />
              <span className="group-hover:text-roast transition-colors">{label}</span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
};
