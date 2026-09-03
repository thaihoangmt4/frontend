"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";

export function ExitLessonDialog({
  open,
  onOpenChange,
  onLeave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeave: () => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialog.Popup className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none dark:bg-neutral-900">
            <AlertDialog.Title className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Leave this lesson?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Your current lesson progress won’t be saved. You’ll start this
              lesson again next time.
            </AlertDialog.Description>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <AlertDialog.Close className="inline-flex h-11 items-center justify-center rounded-lg border border-neutral-200 px-4 text-sm font-medium outline-none hover:bg-neutral-50 focus-visible:ring-3 focus-visible:ring-blue-500/30 dark:border-neutral-700 dark:hover:bg-neutral-800">
                Keep Learning
              </AlertDialog.Close>
              <AlertDialog.Close
                onClick={onLeave}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white outline-none hover:bg-red-700 focus-visible:ring-3 focus-visible:ring-red-500/30"
              >
                Leave Lesson
              </AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
