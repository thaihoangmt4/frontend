import { AdminRoute } from "@/components/auth";
import { UnitLessonsPage } from "@/features/admin-lesson-generation";

export default async function AdminUnitLessonsRoute({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  return (
    <AdminRoute>
      <UnitLessonsPage unitId={unitId} />
    </AdminRoute>
  );
}
