import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Stethoscope } from "lucide-react";
import clsx from "clsx";
import { useDoctors } from "../hooks/useDoctors.js";
import { useSpecialties } from "../hooks/useSpecialties.js";
import { DoctorCard } from "../components/doctors/DoctorCard.js";
import { DoctorCardSkeleton } from "../components/ui/Skeleton.js";
import { EmptyState } from "../components/ui/EmptyState.js";
import { ErrorState } from "../components/ui/ErrorState.js";
import { Button } from "../components/ui/Button.js";
import type { DoctorListParams } from "../hooks/useDoctors.js";

const SORT_OPTIONS: { value: DoctorListParams["sortBy"]; label: string }[] = [
  { value: "rating", label: "Highest Rated" },
  { value: "experience", label: "Most Experienced" },
  { value: "feeAsc", label: "Fee: Low to High" },
  { value: "feeDesc", label: "Fee: High to Low" },
];

export function DoctorsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const specialtySlug = searchParams.get("specialty") ?? undefined;
  const sortBy = (searchParams.get("sort") as DoctorListParams["sortBy"]) ?? "rating";
  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set("search", debouncedSearch);
        else next.delete("search");
        next.delete("page");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data: specialties } = useSpecialties();
  const { data, isLoading, isError, refetch } = useDoctors({
    search: debouncedSearch || undefined,
    specialtySlug,
    sortBy,
    page,
    limit: 9,
  });

  function updateParam(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      return next;
    });
  }

  function goToPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-900">Find a Doctor</h1>
        <p className="mt-2 text-ink-500">Search and filter our network of specialists to find the right fit.</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="flex flex-col gap-6 lg:w-64 lg:shrink-0">
          <div>
            <label htmlFor="doctor-search" className="mb-1.5 block text-sm font-medium text-ink-700">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input
                id="doctor-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Doctor name or specialty"
                className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-700">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Specialty
            </p>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              <button
                type="button"
                onClick={() => updateParam("specialty", undefined)}
                className={clsx(
                  "rounded-lg px-3 py-2 text-left text-sm transition-colors lg:w-full",
                  !specialtySlug ? "bg-brand-100 font-medium text-brand-800" : "text-ink-600 hover:bg-ink-100",
                )}
              >
                All Specialties
              </button>
              {specialties?.map((specialty) => (
                <button
                  key={specialty.id}
                  type="button"
                  onClick={() => updateParam("specialty", specialty.slug)}
                  className={clsx(
                    "rounded-lg px-3 py-2 text-left text-sm transition-colors lg:w-full",
                    specialtySlug === specialty.slug
                      ? "bg-brand-100 font-medium text-brand-800"
                      : "text-ink-600 hover:bg-ink-100",
                  )}
                >
                  {specialty.name}
                  <span className="ml-1.5 text-xs text-ink-400">({specialty.doctorCount})</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-500">
              {isLoading ? "Searching..." : `${data?.pagination.total ?? 0} doctor${data?.pagination.total === 1 ? "" : "s"} found`}
            </p>
            <label className="flex items-center gap-2 text-sm text-ink-600">
              Sort by
              <select
                value={sortBy}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="rounded-lg border border-ink-300 bg-white px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isError && <ErrorState message="We couldn't load doctors right now." onRetry={() => refetch()} />}

          {!isError && isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
            </div>
          )}

          {!isLoading && !isError && data?.doctors.length === 0 && (
            <EmptyState
              icon={Stethoscope}
              title="No doctors match your search"
              description="Try a different specialty or clear your search term."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    setSearchParams({});
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}

          {!isLoading && !isError && data && data.doctors.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                    Previous
                  </Button>
                  <span className="text-sm text-ink-500">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
