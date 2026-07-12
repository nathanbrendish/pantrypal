"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveCommunityFood,
  editCommunityFood,
  lockCommunityFoodEntry,
  mergeCommunityFoods,
  rejectCommunityFood,
  type CommunityActionResult,
} from "@/app/actions/community-intelligence";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import type {
  CommunityFoodRecord,
  CommunityIntelligenceDashboardData,
} from "@/types/community-intelligence";

type CommunityIntelligenceDashboardProps = {
  data: CommunityIntelligenceDashboardData;
};

function statusVariant(status: CommunityFoodRecord["status"]) {
  if (status === "verified") return "success" as const;
  if (status === "locked") return "danger" as const;
  return "warning" as const;
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function CommunityIntelligenceDashboard({
  data,
}: CommunityIntelligenceDashboardProps) {
  const router = useRouter();
  const [pendingFoodId, setPendingFoodId] = useState<string | null>(null);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const runAction = async (
    foodId: string,
    action: () => Promise<CommunityActionResult>
  ) => {
    setPendingFoodId(foodId);
    setMessage(null);
    const result = await action();
    setPendingFoodId(null);
    if (result.success) {
      router.refresh();
      return;
    }
    setMessage(result.error);
  };

  return (
    <div className="flex flex-col gap-8">
      {message && (
        <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {message}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total foods", data.metrics.totalFoods],
          ["Candidates", data.metrics.candidates],
          ["Awaiting review", data.metrics.awaitingReview],
          ["Verified", data.metrics.verified],
          ["Locked", data.metrics.locked],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Community Intelligence
          </h2>
          <p className="mt-1 text-sm text-muted">
            Most-used anonymous aggregate food records.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {data.foods.slice(0, 5).map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between gap-4 rounded-xl bg-background px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{food.canonical_name}</p>
                  <p className="text-xs text-muted">
                    {food.usage_count} observations · {food.alias_count} aliases
                  </p>
                </div>
                <StatusBadge variant={statusVariant(food.status)}>
                  {food.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Top aliases</h2>
          <div className="mt-5 flex flex-col gap-3">
            {data.topAliases.length ? (
              data.topAliases.map((alias) => (
                <div
                  key={alias.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="truncate text-foreground">{alias.alias}</span>
                  <span className="text-muted">{alias.usage_count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No aliases observed yet.</p>
            )}
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Moderation Queue</h2>
          <p className="mt-1 text-sm text-muted">
            Candidates remain unverified until a SUPER_ADMIN approves them.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {data.foods
            .filter((food) => food.review_required || food.status === "candidate")
            .map((food) => {
              const confidence = data.confidenceBreakdowns[food.id];
              const isPending = pendingFoodId === food.id;
              return (
                <Card key={food.id} className="p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {food.canonical_name}
                          </h3>
                          <StatusBadge variant={statusVariant(food.status)}>
                            {food.status}
                          </StatusBadge>
                          {food.review_required && (
                            <StatusBadge variant="warning">Review required</StatusBadge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          {food.primary_category ?? "No category"} ·{" "}
                          {food.default_unit ?? "No unit"} · {food.usage_count} observations
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted">
                        <p>Confidence {confidence?.score ?? food.confidence_score}%</p>
                        <p className="text-xs">
                          Category {confidence?.categoryAgreement ?? 0}% · Unit{" "}
                          {confidence?.unitAgreement ?? 0}% · Expiry{" "}
                          {confidence?.shelfLifeAgreement ?? 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="success"
                        disabled={isPending}
                        onClick={() => void runAction(food.id, () => approveCommunityFood(food.id))}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => setEditingFoodId(food.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => void runAction(food.id, () => rejectCommunityFood(food.id))}
                      >
                        Reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        disabled={isPending}
                        onClick={() =>
                          void runAction(food.id, () => lockCommunityFoodEntry(food.id))
                        }
                      >
                        Lock
                      </Button>
                    </div>

                    {editingFoodId === food.id && (
                      <form
                        className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"
                        action={(formData) =>
                          void runAction(food.id, () =>
                            editCommunityFood(food.id, {
                              canonicalName: String(formData.get("canonical_name") ?? ""),
                              primaryCategory:
                                String(formData.get("primary_category") ?? "") || null,
                              secondaryCategory:
                                String(formData.get("secondary_category") ?? "") || null,
                              defaultUnit: String(formData.get("default_unit") ?? "") || null,
                              defaultShelfLifeDays: numberOrNull(
                                formData.get("default_shelf_life_days")
                              ),
                              defaultFridgeLifeDays: numberOrNull(
                                formData.get("default_fridge_life_days")
                              ),
                              defaultFreezerLifeDays: numberOrNull(
                                formData.get("default_freezer_life_days")
                              ),
                            })
                          )
                        }
                      >
                        <input
                          name="canonical_name"
                          defaultValue={food.canonical_name}
                          required
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        />
                        <input
                          name="primary_category"
                          defaultValue={food.primary_category ?? ""}
                          placeholder="Category"
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        />
                        <input
                          name="secondary_category"
                          defaultValue={food.secondary_category ?? ""}
                          placeholder="Subcategory"
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        />
                        <input
                          name="default_unit"
                          defaultValue={food.default_unit ?? ""}
                          placeholder="Unit"
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        />
                        <input
                          name="default_shelf_life_days"
                          type="number"
                          min="0"
                          defaultValue={food.default_shelf_life_days ?? ""}
                          placeholder="Shelf-life days"
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        />
                        <input
                          name="default_fridge_life_days"
                          type="number"
                          min="0"
                          defaultValue={food.default_fridge_life_days ?? ""}
                          placeholder="Fridge days"
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        />
                        <input
                          name="default_freezer_life_days"
                          type="number"
                          min="0"
                          defaultValue={food.default_freezer_life_days ?? ""}
                          placeholder="Freezer days"
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={isPending}>
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingFoodId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}

                    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <span className="text-sm text-muted">Merge into:</span>
                      <select
                        aria-label={`Merge ${food.canonical_name} into another food`}
                        defaultValue=""
                        disabled={isPending}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        onChange={(event) => {
                          if (event.target.value) {
                            void runAction(food.id, () =>
                              mergeCommunityFoods(food.id, event.target.value)
                            );
                          }
                        }}
                      >
                        <option value="">Choose a canonical food</option>
                        {data.foods
                          .filter((target) => target.id !== food.id)
                          .map((target) => (
                            <option key={target.id} value={target.id}>
                              {target.canonical_name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </Card>
              );
            })}
          {!data.foods.some(
            (food) => food.review_required || food.status === "candidate"
          ) && (
            <Card className="p-6 text-sm text-muted">
              No candidates are currently awaiting moderation.
            </Card>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Moderation History
        </h2>
        <Card className="overflow-hidden">
          {data.moderationHistory.length ? (
            <ul className="divide-y divide-border">
              {data.moderationHistory.map((entry) => (
                <li key={entry.id} className="flex justify-between gap-4 px-5 py-4 text-sm">
                  <span className="font-medium capitalize text-foreground">
                    {entry.action}
                  </span>
                  <time className="text-muted">
                    {new Date(entry.created_at).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-sm text-muted">No moderation actions yet.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
