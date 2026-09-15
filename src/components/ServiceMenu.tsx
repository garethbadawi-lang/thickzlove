import { getEnabledServices } from "@/data/services";
import { ServiceMenuItem } from "./ServiceMenuItem";

export function ServiceMenu() {
  const items = getEnabledServices();

  return (
    <div className="divide-y-0">
      {items.map((service) => (
        <ServiceMenuItem key={service.id} service={service} />
      ))}
    </div>
  );
}
