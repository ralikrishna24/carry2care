import React, { useState, useEffect } from "react";

const BREAKFAST_OPTIONS = ["", "Idle", "Dosa", "Uthapam", "Bonda"];
const LUNCH_OPTIONS = ["", "Full Meal", "Chapathi"];

const breakfastMap = {
  "": { pack: "-", price: 0 },
  Idle: { pack: "6 Idle", price: 30 },
  Dosa: { pack: "2 Dosa", price: 30 },
  Uthapam: { pack: "2 Uthapam", price: 30 },
  Bonda: { pack: "6 Bonda", price: 30 },
};

const lunchMap = {
  "": { pack: "-", price: 0 },
  "Full Meal": { pack: "Rice, Papu, Rasam, Curry, Curd, Pickle, 1-Chapathi", price: 60 },
  Chapathi: { pack: "3 Pieces", price: 45 },
};

function emptyRow(id = null) {
  return {
    id: id ?? Date.now() + Math.random(),
    empName: "",
    contact: "",
    altContact: "",
    breakfast: "",
    lunch: "",
    errors: {},
  };
}

function normalizeRow(raw) {
  if (!raw || typeof raw !== "object") return emptyRow();
  return {
    id: raw.id ?? Date.now() + Math.random(),
    empName: typeof raw.empName === "string" ? raw.empName : "",
    contact: typeof raw.contact === "string" ? raw.contact : "",
    altContact: typeof raw.altContact === "string" ? raw.altContact : "",
    breakfast: typeof raw.breakfast === "string" ? raw.breakfast : "",
    lunch: typeof raw.lunch === "string" ? raw.lunch : "",
    errors: typeof raw.errors === "object" && raw.errors !== null ? raw.errors : {},
  };
}

export default function Carry2CareApp() {
  const [rows, setRows] = useState(() => {
    try {
      const raw = localStorage.getItem("carry2care_rows_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((r) => normalizeRow(r));
          return normalized.length ? normalized : [emptyRow(1)];
        }
      }
    } catch (e) {
      console.warn("Failed to parse saved rows, starting fresh.", e);
    }
    return [emptyRow(1)];
  });

  useEffect(() => {
    try {
      localStorage.setItem("carry2care_rows_v2", JSON.stringify(rows));
    } catch (e) {
      console.warn("Failed to save rows to localStorage", e);
    }
  }, [rows]);

  function setRowField(id, field, value) {
    setRows((prev) =>
      prev.map((row) => {
        if (!row || row.id !== id) return row;
        const next = { ...row, [field]: value };
        next.errors = { ...(row.errors || {}) };
        return next;
      })
    );
  }

  function validateAndSet(id, field, value) {
    let error = "";
    if (field === "empName") {
      if (value && !/^[A-Za-z ]+$/.test(value)) error = "Only alphabets (A–Z) and spaces allowed";
    }
    if (field === "contact" || field === "altContact") {
      if (value && !/^\d+$/.test(value)) error = "Only numbers allowed";
    }
    setRows((prev) =>
      prev.map((row) => {
        if (!row || row.id !== id) return row;
        const updated = { ...row, [field]: value, errors: { ...(row.errors || {}), [field]: error } };
        return updated;
      })
    );
  }

  function addRow() {
    setRows((r) => [...r, emptyRow()]);
  }

  function removeRow(id) {
    setRows((r) => r.filter((row) => row && row.id !== id));
  }

  function totalForRow(row) {
    if (!row || typeof row !== "object") return 0;
    const b = breakfastMap[row.breakfast]?.price ?? 0;
    const l = lunchMap[row.lunch]?.price ?? 0;
    return b + l;
  }

  const safe = (row) => normalizeRow(row);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 drop-shadow-md tracking-wide">
            Carry2Care
          </h1>
          <p className="mt-3 text-slate-600 text-lg font-medium">
            Nourishing Your Community — Smart Parcel Management System
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gradient-to-r from-blue-700 to-cyan-500 text-white text-base">
              <tr>
                <th className="p-3">S.No</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Contact Number</th>
                <th className="p-3">Alternative Number</th>
                <th className="p-3 bg-blue-50 text-blue-900">Breakfast</th>
                <th className="p-3 bg-blue-100 text-blue-900">Pack / Price</th>
                <th className="p-3 bg-cyan-50 text-cyan-900">Lunch</th>
                <th className="p-3 bg-cyan-100 text-cyan-900">Pack / Price</th>
                <th className="p-3">Total</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((rawRow, idx) => {
                const row = safe(rawRow);
                const b = breakfastMap[row.breakfast] || breakfastMap[""];
                const l = lunchMap[row.lunch] || lunchMap[""];
                return (
                  <tr
                    key={row.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                    } hover:bg-cyan-100 transition`}
                  >
                    <td className="p-3 font-semibold text-slate-700">{idx + 1}</td>

                    <td className="p-3">
                      <input
                        value={row.empName}
                        onChange={(e) => validateAndSet(row.id, "empName", e.target.value)}
                        placeholder="Employee name"
                        className="w-full border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400"
                      />
                      {row.errors && row.errors.empName ? (
                        <p className="text-red-500 text-xs mt-1">{row.errors.empName}</p>
                      ) : null}
                    </td>

                    <td className="p-3">
                      <input
                        value={row.contact}
                        onChange={(e) => validateAndSet(row.id, "contact", e.target.value)}
                        placeholder="Contact"
                        className="w-full border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400"
                      />
                      {row.errors && row.errors.contact ? (
                        <p className="text-red-500 text-xs mt-1">{row.errors.contact}</p>
                      ) : null}
                    </td>

                    <td className="p-3">
                      <input
                        value={row.altContact}
                        onChange={(e) => validateAndSet(row.id, "altContact", e.target.value)}
                        placeholder="Alternative"
                        className="w-full border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400"
                      />
                      {row.errors && row.errors.altContact ? (
                        <p className="text-red-500 text-xs mt-1">{row.errors.altContact}</p>
                      ) : null}
                    </td>

                    <td className="p-3 bg-blue-50">
                      <select
                        value={row.breakfast}
                        onChange={(e) => setRowField(row.id, "breakfast", e.target.value)}
                        className="w-full border border-blue-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400"
                      >
                        {BREAKFAST_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt || "-- select --"}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 bg-blue-100 text-blue-800">
                      <div>{b.pack || "-"}</div>
                      <div className="font-semibold">₹ {b.price ?? 0}</div>
                    </td>

                    <td className="p-3 bg-cyan-50">
                      <select
                        value={row.lunch}
                        onChange={(e) => setRowField(row.id, "lunch", e.target.value)}
                        className="w-full border border-cyan-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-cyan-400"
                      >
                        {LUNCH_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt || "-- select --"}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 bg-cyan-100 text-cyan-800">
                      <div>{l.pack || "-"}</div>
                      <div className="font-semibold">₹ {l.price ?? 0}</div>
                    </td>

                    <td className="p-3 font-bold text-green-700">₹ {totalForRow(row)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-blue-200">
            <button
              onClick={addRow}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-5 py-2 rounded-full shadow-lg font-semibold"
            >
              + Add User
            </button>

            <button
              onClick={() => {
                const header = [
                  "S.No",
                  "Emp.Name",
                  "Contact",
                  "Alt Contact",
                  "Breakfast",
                  "Pack",
                  "Price",
                  "Lunch",
                  "Pack",
                  "Price",
                  "Total",
                ];
                const csvLines = [header.join(",")];
                rows.forEach((r, i) => {
                  const row = normalizeRow(r);
                  const b = breakfastMap[row.breakfast] || breakfastMap[""];
                  const l = lunchMap[row.lunch] || lunchMap[""];
                  csvLines.push(
                    [
                      i + 1,
                      row.empName,
                      row.contact,
                      row.altContact,
                      row.breakfast,
                      b.pack || "-",
                      b.price || 0,
                      row.lunch,
                      l.pack || "-",
                      l.price || 0,
                      totalForRow(row),
                    ].join(",")
                  );
                });
                const blob = new Blob([csvLines.join("\n")], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "Carry2Care_Report.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white px-5 py-2 rounded-full shadow-lg font-semibold"
            >
              Export CSV
            </button>
          </div>
        </div>

        <footer className="text-center mt-8 text-slate-600 text-sm font-medium">
          © {new Date().getFullYear()} Carry2Care — Designed with ❤️ to Serve Your Community
        </footer>
      </div>
    </div>
  );
}
