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

  useEffect(() => { fetchFoods(); }, []);

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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Food Database</h1>
          <p className="text-sm text-gray-500">Hospital Food Database</p>
        </div>
        <button
          onClick={() => setModal({ open: true, item: null })}
          className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-600"
        >
          + Add Food
        </button>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name (EN)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama (BM)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kcal/100g</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Carbs</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Protein</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fat</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((food) => (
                <tr key={food.id} className={`hover:bg-gray-50 ${!food.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{food.name}</td>
                  <td className="px-4 py-3 text-gray-600">{food.nameBM}</td>
                  <td className="px-4 py-3"><CategoryBadge category={food.category} /></td>
                  <td className="px-4 py-3 text-right text-gray-700">{food.kcalPer100g}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{food.carbsPer100g}g</td>
                  <td className="px-4 py-3 text-right text-gray-500">{food.proteinPer100g}g</td>
                  <td className="px-4 py-3 text-right text-gray-500">{food.fatPer100g}g</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setModal({ open: true, item: food })}
                        className="text-xs text-primary border border-primary-100 px-2 py-1 rounded-md hover:bg-primary-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(food)}
                        className={`text-xs border px-2 py-1 rounded-md ${
                          food.isActive
                            ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                            : "border-primary-100 text-primary hover:bg-primary-50"
                        }`}
                      >
                        {food.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">No results.</p>
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
