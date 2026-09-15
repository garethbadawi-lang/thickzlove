"use client";

import { getEnabledServices } from "@/data/services";

interface ServiceSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
}

export function ServiceSelect({
  value,
  onChange,
  id = "serviceId",
  required,
}: ServiceSelectProps) {
  const services = getEnabledServices();

  return (
    <select
      id={id}
      name={id}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-light"
    >
      <option value="">Select a service</option>
      {services.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} — {s.priceLabel}
        </option>
      ))}
    </select>
  );
}
