"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveCommunityFood,
  createFoodCategory,
  createFoodSubcategory,
  createStorageLocation,
  editCommunityFood,
  lockCommunityFoodEntry,
  mergeCommunityFoods,
  rejectCommunityFood,
  setSubcategorySubstitutable,
  setTaxonomyItemActive,
  type CommunityActionResult,
} from "@/app/actions/community-intelligence";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { UNCLASSIFIED_LABEL } from "@/lib/food-classification";
import type {
  CommunityFoodRecord,
  CommunityIntelligenceDashboardData,
} from "@/types/community-intelligence";
import type { FoodCategory, FoodSubcategory } from "@/types/taxonomy";

const TAXONOMY_SELECT_CLASS =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground";

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

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of data.categories) {
      map.set(category.id, category.name);
    }
    return map;
  }, [data.categories]);

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

  const runTaxonomyAction = async (
    action: () => Promise<CommunityActionResult>
  ) => {
    setMessage(null);
    const result = await action();
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
                          {(food.food_category_id &&
                            categoryNameById.get(food.food_category_id)) ||
                            UNCLASSIFIED_LABEL}{" "}
                          · {food.default_unit ?? "No unit"} · {food.usage_count}{" "}
                          observations
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
                      <EditFoodForm
                        food={food}
                        categories={data.categories}
                        subcategories={data.subcategories}
                        isPending={isPending}
                        onCancel={() => setEditingFoodId(null)}
                        onSubmit={(values) =>
                          void runAction(food.id, () =>
                            editCommunityFood(food.id, values)
                          )
                        }
                      />
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

      <TaxonomyManager
        categories={data.categories}
        subcategories={data.subcategories}
        storageLocations={data.storageLocations}
        run={runTaxonomyAction}
      />

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

type EditFoodFormValues = {
  canonicalName: string;
  foodCategoryId: string | null;
  foodSubcategoryId: string | null;
  defaultUnit: string | null;
  defaultShelfLifeDays: number | null;
  defaultFridgeLifeDays: number | null;
  defaultFreezerLifeDays: number | null;
};

type EditFoodFormProps = {
  food: CommunityFoodRecord;
  categories: FoodCategory[];
  subcategories: FoodSubcategory[];
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: EditFoodFormValues) => void;
};

function EditFoodForm({
  food,
  categories,
  subcategories,
  isPending,
  onCancel,
  onSubmit,
}: EditFoodFormProps) {
  const [categoryId, setCategoryId] = useState(food.food_category_id ?? "");
  const [subcategoryId, setSubcategoryId] = useState(
    food.food_subcategory_id ?? ""
  );

  const availableSubcategories = subcategories.filter(
    (sub) => sub.food_category_id === categoryId
  );

  return (
    <form
      className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"
      action={(formData) =>
        onSubmit({
          canonicalName: String(formData.get("canonical_name") ?? ""),
          foodCategoryId: categoryId || null,
          foodSubcategoryId: subcategoryId || null,
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
      }
    >
      <input
        name="canonical_name"
        defaultValue={food.canonical_name}
        required
        className={TAXONOMY_SELECT_CLASS}
      />
      <input
        name="default_unit"
        defaultValue={food.default_unit ?? ""}
        placeholder="Unit"
        className={TAXONOMY_SELECT_CLASS}
      />
      <select
        aria-label="Category"
        className={TAXONOMY_SELECT_CLASS}
        value={categoryId}
        onChange={(event) => {
          setCategoryId(event.target.value);
          setSubcategoryId("");
        }}
      >
        <option value="">Unclassified</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Subcategory"
        className={TAXONOMY_SELECT_CLASS}
        value={subcategoryId}
        onChange={(event) => setSubcategoryId(event.target.value)}
        disabled={availableSubcategories.length === 0}
      >
        <option value="">No subcategory</option>
        {availableSubcategories.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>
      <input
        name="default_shelf_life_days"
        type="number"
        min="0"
        defaultValue={food.default_shelf_life_days ?? ""}
        placeholder="Shelf-life days"
        className={TAXONOMY_SELECT_CLASS}
      />
      <input
        name="default_fridge_life_days"
        type="number"
        min="0"
        defaultValue={food.default_fridge_life_days ?? ""}
        placeholder="Fridge days"
        className={TAXONOMY_SELECT_CLASS}
      />
      <input
        name="default_freezer_life_days"
        type="number"
        min="0"
        defaultValue={food.default_freezer_life_days ?? ""}
        placeholder="Freezer days"
        className={TAXONOMY_SELECT_CLASS}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          Save
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

type TaxonomyManagerProps = {
  categories: FoodCategory[];
  subcategories: FoodSubcategory[];
  storageLocations: CommunityIntelligenceDashboardData["storageLocations"];
  run: (action: () => Promise<CommunityActionResult>) => Promise<void>;
};

function TaxonomyManager({
  categories,
  subcategories,
  storageLocations,
  run,
}: TaxonomyManagerProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Food categories
        </h2>
        <p className="mt-1 text-sm text-muted">
          Controlled vocabulary. Add categories and promote new subcategories.
        </p>

        <form
          className="mt-4 flex flex-wrap gap-2"
          action={(formData) => {
            const name = String(formData.get("category_name") ?? "");
            const icon = String(formData.get("category_icon") ?? "");
            void run(() => createFoodCategory(name, icon || null));
          }}
        >
          <input
            name="category_icon"
            placeholder="Icon"
            className={`${TAXONOMY_SELECT_CLASS} w-20`}
          />
          <input
            name="category_name"
            placeholder="New category"
            required
            className={`${TAXONOMY_SELECT_CLASS} flex-1`}
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>

        <ul className="mt-4 flex flex-col divide-y divide-border">
          {categories.map((category) => {
            const catSubs = subcategories.filter(
              (sub) => sub.food_category_id === category.id
            );
            return (
              <li key={category.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {category.icon ? `${category.icon} ` : ""}
                    {category.name}
                    {!category.active && (
                      <span className="ml-2 text-xs text-muted">(inactive)</span>
                    )}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void run(() =>
                        setTaxonomyItemActive(
                          "food_categories",
                          category.id,
                          !category.active
                        )
                      )
                    }
                  >
                    {category.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {catSubs.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() =>
                        void run(() =>
                          setSubcategorySubstitutable(sub.id, !sub.substitutable)
                        )
                      }
                      title={
                        sub.substitutable
                          ? "Interchangeable family — click to disable"
                          : "Not interchangeable — click to make this an ingredient family"
                      }
                      className={
                        sub.substitutable
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "rounded-full bg-background px-2 py-0.5 text-xs text-muted"
                      }
                    >
                      {sub.substitutable ? "🔗 " : ""}
                      {sub.name}
                    </button>
                  ))}
                </div>
                <form
                  className="mt-2 flex gap-2"
                  action={(formData) => {
                    const name = String(formData.get("subcategory_name") ?? "");
                    void run(() => createFoodSubcategory(category.id, name));
                  }}
                >
                  <input
                    name="subcategory_name"
                    placeholder="Promote subcategory…"
                    required
                    className={`${TAXONOMY_SELECT_CLASS} flex-1`}
                  />
                  <Button type="submit" size="sm" variant="secondary">
                    Add
                  </Button>
                </form>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Storage locations
        </h2>
        <p className="mt-1 text-sm text-muted">
          User-facing storage locations used to organise pantries.
        </p>

        <form
          className="mt-4 flex flex-wrap gap-2"
          action={(formData) => {
            const name = String(formData.get("storage_name") ?? "");
            const icon = String(formData.get("storage_icon") ?? "");
            void run(() => createStorageLocation(name, icon || null));
          }}
        >
          <input
            name="storage_icon"
            placeholder="Icon"
            className={`${TAXONOMY_SELECT_CLASS} w-20`}
          />
          <input
            name="storage_name"
            placeholder="New storage location"
            required
            className={`${TAXONOMY_SELECT_CLASS} flex-1`}
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>

        <ul className="mt-4 flex flex-col divide-y divide-border">
          {storageLocations.map((location) => (
            <li
              key={location.id}
              className="flex items-center justify-between gap-2 py-3"
            >
              <span className="text-sm font-medium text-foreground">
                {location.icon ? `${location.icon} ` : ""}
                {location.name}
                {!location.active && (
                  <span className="ml-2 text-xs text-muted">(inactive)</span>
                )}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  void run(() =>
                    setTaxonomyItemActive(
                      "storage_locations",
                      location.id,
                      !location.active
                    )
                  )
                }
              >
                {location.active ? "Deactivate" : "Activate"}
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
