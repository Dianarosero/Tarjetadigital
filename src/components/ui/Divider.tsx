import { Asset } from "./Asset";

/** Ramita con estrella central para separar secciones. */
export function Divider() {
  return (
    <div aria-hidden="true" className="flex justify-center py-1">
      <Asset name="foliageSprig" className="h-auto w-44 opacity-95" />
    </div>
  );
}
