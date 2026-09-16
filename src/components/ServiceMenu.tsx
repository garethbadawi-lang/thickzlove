import { getPublicServices } from "@/lib/public-content";
import { ServiceMenuItem } from "./ServiceMenuItem";

export async function ServiceMenu() {
  const items = await getPublicServices();

  return (
    <div className="divide-y-0">
      {items.map((service) => (
        <ServiceMenuItem key={service.id} service={service} />
      ))}
    </div>
  );
}
