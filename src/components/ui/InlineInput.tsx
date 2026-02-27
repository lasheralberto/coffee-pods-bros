import React, { useState } from 'react';
import { Button } from './Button';
import { Loader2 } from 'lucide-react';

interface InlineInputProps {
  placeholder: string;
  buttonLabel: string;
  onSubmit: (value: string) => void;
  loading?: boolean;
}

export const InlineInput: React.FC<InlineInputProps> = ({
  placeholder,
  buttonLabel,
  onSubmit,
  loading = false,
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-inline">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
      />
      <Button
        type="submit"
        variant="primary"
        size="sm"
        loading={loading}
        disabled={!value.trim() || loading}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : buttonLabel}
      </Button>
    </form>
  );
};
