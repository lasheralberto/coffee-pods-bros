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
        className="w-full flex items-center justify-between py-4 min-h-[48px] text-left hover:opacity-80 transition-opacity"
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
        <fieldset className="flex flex-col gap-1 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map(({ label, value }) => {
            const isSelected = selected === value;
            return (
              <label
                key={value}
                className={`flex items-center gap-3 text-sm cursor-pointer group py-2 px-2 -mx-2 rounded-lg transition-colors ${isSelected ? 'bg-surface/50' : 'hover:bg-surface/50'}`}
              >
                <div className={`flex items-center justify-center shrink-0 w-[18px] h-[18px] rounded-full border transition-colors ${isSelected ? 'border-roast' : 'border-border-color-strong group-hover:border-roast'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-roast animate-in zoom-in duration-200" />}
                </div>
                <input
                  type="radio"
                  name={name}
                  checked={isSelected}
                  onChange={() => onChange(value)}
                  className="absolute opacity-0 w-0 h-0"
                />
                <span className={`transition-colors leading-none ${isSelected ? 'font-medium text-roast' : 'text-primary group-hover:text-roast'}`}>
                  {label}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}
    </div>
  );
};
