import { AdminRoute } from "@/components/auth";
import { AddLessonPage } from "@/features/admin-lesson-generation";

export default async function AdminAddLessonRoute({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  return (
    <AdminRoute>
      <AddLessonPage unitId={unitId} />
    </AdminRoute>
  );
}
