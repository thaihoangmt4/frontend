import { SkeletonPage } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="mx-auto max-w-6xl py-6">
      <SkeletonPage cards={3} />
    </div>
  );
}
