"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LearningAudio } from "@/features/learning-catalog/components/learning-media";
import type { ExerciseAnswer, LearningActivity } from "../types";

export function ExerciseInput({
  activity,
  disabled,
  onAnswer,
}: {
  activity: LearningActivity;
  disabled: boolean;
  onAnswer: (answer: ExerciseAnswer) => void;
}) {
  const c = activity.content;
  const [choice, setChoice] = useState("");
  const [text, setText] = useState("");
  const [order, setOrder] = useState<string[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const options = c.options ?? [];
  if (
    activity.exerciseType === "MultipleChoice" ||
    activity.exerciseType === "AudioMatching"
  )
    return (
      <div className="space-y-3">
        <p className="text-lg font-medium">
          {c.question ??
            (activity.exerciseType === "AudioMatching"
              ? "Choose what you hear"
              : activity.instruction)}
        </p>
        {activity.exerciseType === "AudioMatching" && (
          <LearningAudio
            text={c.pronunciationText ?? ""}
            label="pronunciation"
            prominent
          />
        )}{" "}
        {options.map((o) => (
          <label
            key={o.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${choice === o.id ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
          >
            <input
              type="radio"
              name="answer"
              checked={choice === o.id}
              onChange={() => setChoice(o.id)}
              disabled={disabled}
            />
            <span>{o.text}</span>
          </label>
        ))}
        <Submit
          disabled={disabled || !choice}
          onClick={() => onAnswer({ selectedOptionId: choice })}
        />
      </div>
    );
  if (activity.exerciseType === "Typing")
    return (
      <div className="space-y-4">
        <p className="text-lg font-medium">{c.prompt}</p>
        <input
          autoFocus
          value={text}
          maxLength={c.maxLength ?? undefined}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) onAnswer({ text });
          }}
          className="h-12 w-full rounded-xl border bg-transparent px-4 outline-none focus:ring-3 focus:ring-blue-500/20"
          placeholder="Type your answer"
        />
        <Submit
          disabled={disabled || !text.trim()}
          onClick={() => onAnswer({ text })}
        />
      </div>
    );
  if (activity.exerciseType === "SentenceOrdering") {
    const tokens = c.tokens ?? [];
    return (
      <div className="space-y-4">
        <p className="text-lg font-medium">{c.prompt}</p>
        <div className="min-h-14 rounded-xl border border-dashed p-3">
          {order.map((id, i) => (
            <Button
              key={`${id}-${i}`}
              variant="secondary"
              className="m-1"
              onClick={() => setOrder(order.filter((_, x) => x !== i))}
            >
              {tokens.find((t) => t.id === id)?.text}
            </Button>
          ))}
        </div>
        <div>
          {tokens.map((t) => (
            <Button
              key={t.id}
              variant="outline"
              className="m-1"
              disabled={disabled || order.includes(t.id)}
              onClick={() => setOrder([...order, t.id])}
            >
              {t.text}
            </Button>
          ))}
        </div>
        <Submit
          disabled={disabled || order.length !== tokens.length}
          onClick={() => onAnswer({ orderedTokenIds: order })}
        />
      </div>
    );
  }
  if (activity.exerciseType === "ImageMatching")
    return (
      <MappingRows
        labels={(c.sources ?? []).map((x) => ({ id: x.id, label: x.altText }))}
        choices={(c.targets ?? []).map((x) => ({ id: x.id, label: x.text }))}
        values={matches}
        setValues={setMatches}
        disabled={disabled}
        onSubmit={() =>
          onAnswer({
            matches: Object.entries(matches).map(([sourceId, targetId]) => ({
              sourceId,
              targetId,
            })),
          })
        }
      />
    );
  if (activity.exerciseType === "Categorization")
    return (
      <MappingRows
        labels={(c.items ?? []).map((x) => ({ id: x.id, label: x.text }))}
        choices={(c.categories ?? []).map((x) => ({ id: x.id, label: x.name }))}
        values={assignments}
        setValues={setAssignments}
        disabled={disabled}
        onSubmit={() =>
          onAnswer({
            assignments: Object.entries(assignments).map(
              ([itemId, categoryId]) => ({ itemId, categoryId }),
            ),
          })
        }
      />
    );
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{c.prompt}</p>
      <blockquote className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
        {c.referenceText}
      </blockquote>
      {c.referenceAudioMediaId && <MediaUnavailable kind="Reference audio" />}
      <p className="text-sm text-neutral-500">
        Speaking evaluation is coming soon. Practice aloud, then confirm when
        finished.
      </p>
      <Submit
        disabled={disabled}
        onClick={() => onAnswer({ acknowledged: true })}
        label="I finished speaking"
      />
    </div>
  );
}
function Submit({
  disabled,
  onClick,
  label = "Check answer",
}: {
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <div className="pt-3">
      <Button
        size="lg"
        className="min-h-11 px-5"
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}
function MediaUnavailable({ kind }: { kind: string }) {
  return (
    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
      {kind} is unavailable for this activity.
    </div>
  );
}
function MappingRows({
  labels,
  choices,
  values,
  setValues,
  disabled,
  onSubmit,
}: {
  labels: { id: string; label: string }[];
  choices: { id: string; label: string }[];
  values: Record<string, string>;
  setValues: (v: Record<string, string>) => void;
  disabled: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-4">
      {labels.map((x) => (
        <label
          key={x.id}
          className="grid gap-2 rounded-xl border p-4 sm:grid-cols-2 sm:items-center"
        >
          <span>{x.label}</span>
          <select
            className="h-10 rounded-lg border bg-transparent px-3"
            value={values[x.id] ?? ""}
            disabled={disabled}
            onChange={(e) => setValues({ ...values, [x.id]: e.target.value })}
          >
            <option value="">Choose…</option>
            {choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <Submit
        disabled={
          disabled ||
          labels.length === 0 ||
          Object.keys(values).length !== labels.length
        }
        onClick={onSubmit}
      />
    </div>
  );
}
