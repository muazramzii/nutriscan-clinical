"use client";

import { useEffect, useState } from "react";
import { FoodItemData } from "@/types";
import { CategoryBadge } from "@/components/ui/Badge";
import { FoodModal } from "@/components/admin/FoodModal";

export default function FoodDatabasePage() {
  const [foods, setFoods] = useState<FoodItemData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: FoodItemData | null }>({ open: false });

  async function fetchFoods() {
    const res = await fetch("/api/food-items");
    const data = await res.json();
    setFoods(data.foodItems ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFoods();
  }, []);

  async function toggleActive(item: FoodItemData) {
    await fetch(`/api/food-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    fetchFoods();
  }

  const filtered = foods.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.nameBM.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 overflow-x-hidden animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Food Database</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Hospital food and nutrition catalogue</p>
        </div>
        <button
          onClick={() => setModal({ open: true, item: null })}
          className="inline-flex items-center gap-1.5 text-white text-sm font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-glow tap-scale transition-all"
          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Food</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-full sm:max-w-[400px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search food…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              {/* Mobile: Name 50% / Category 25% / Actions 25% */}
              {/* Desktop: All visible with balanced widths */}
              <col className="w-[40%] sm:w-[22%]" />
              <col className="w-0 sm:w-[20%] hidden sm:table-column" />
              <col className="w-[28%] sm:w-[14%]" />
              <col className="w-0 sm:w-[10%] hidden sm:table-column" />
              <col className="w-0 lg:w-[8%] hidden lg:table-column" />
              <col className="w-0 lg:w-[8%] hidden lg:table-column" />
              <col className="w-0 lg:w-[8%] hidden lg:table-column" />
              <col className="w-[32%] sm:w-[18%] lg:w-[10%]" />
            </colgroup>
            <thead className="bg-gray-50/70 border-b border-gray-100">
              <tr>
                <th className="text-left px-3 sm:px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest align-middle">
                  Name (EN)
                </th>
                <th className="hidden sm:table-cell text-left px-3 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest align-middle">
                  Nama (BM)
                </th>
                <th className="text-left px-2 sm:px-3 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest align-middle">
                  Category
                </th>
                <th className="hidden sm:table-cell text-right px-3 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest align-middle">
                  Kcal
                </th>
                <th className="hidden lg:table-cell text-right px-3 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest align-middle">
                  Carbs
                </th>
                <th className="hidden lg:table-cell text-right px-3 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest align-middle">
                  Protein
                </th>
                <th className="hidden lg:table-cell text-right px-3 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest align-middle">
                  Fat
                </th>
                <th className="text-center px-2 sm:px-3 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest align-middle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((food, idx) => (
                <tr
                  key={food.id}
                  className={`h-14 border-b border-gray-50 last:border-0 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } hover:bg-primary-50/40 ${!food.isActive ? "opacity-50" : ""}`}
                >
                  <td className="px-3 sm:px-4 align-middle truncate" title={`${food.name} / ${food.nameBM}`}>
                    <p className="font-semibold text-gray-900 truncate">{food.name}</p>
                    <p className="sm:hidden text-2xs text-gray-500 truncate">{food.nameBM}</p>
                  </td>
                  <td className="hidden sm:table-cell px-3 align-middle text-gray-600 truncate" title={food.nameBM}>
                    {food.nameBM}
                  </td>
                  <td className="px-2 sm:px-3 align-middle">
                    <CategoryBadge category={food.category} />
                  </td>
                  <td className="hidden sm:table-cell px-3 align-middle text-right text-gray-700 font-semibold tabular-nums">
                    {food.kcalPer100g}
                  </td>
                  <td className="hidden lg:table-cell px-3 align-middle text-right text-gray-600 tabular-nums">
                    {food.carbsPer100g}
                    <span className="text-2xs text-gray-400 ml-0.5">g</span>
                  </td>
                  <td className="hidden lg:table-cell px-3 align-middle text-right text-gray-600 tabular-nums">
                    {food.proteinPer100g}
                    <span className="text-2xs text-gray-400 ml-0.5">g</span>
                  </td>
                  <td className="hidden lg:table-cell px-3 align-middle text-right text-gray-600 tabular-nums">
                    {food.fatPer100g}
                    <span className="text-2xs text-gray-400 ml-0.5">g</span>
                  </td>
                  <td className="px-2 sm:px-3 align-middle">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                      <button
                        onClick={() => setModal({ open: true, item: food })}
                        className="w-8 h-8 rounded-lg bg-primary-50 ring-1 ring-inset ring-primary-100 text-primary-700 flex items-center justify-center hover:bg-primary-100/70 tap-scale transition-all"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleActive(food)}
                        className={`w-8 h-8 rounded-lg ring-1 ring-inset flex items-center justify-center tap-scale transition-all ${
                          food.isActive
                            ? "bg-danger-50 ring-danger-100 text-danger-600 hover:bg-danger-100/60"
                            : "bg-gray-50 ring-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                        title={food.isActive ? "Delete" : "Restore"}
                        aria-label={food.isActive ? "Delete" : "Restore"}
                      >
                        {food.isActive ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-gray-600">No results</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      {modal.open && (
        <FoodModal
          item={modal.item}
          onClose={() => setModal({ open: false })}
          onSaved={fetchFoods}
        />
      )}
    </div>
  );
}
