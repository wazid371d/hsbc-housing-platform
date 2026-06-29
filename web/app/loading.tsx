import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Spinner label="Loading portal" />
    </div>
  );
}
