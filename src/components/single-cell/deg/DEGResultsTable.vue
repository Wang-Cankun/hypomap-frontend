<template>
  <div
    class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
    style="height: 450px"
  >
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <div>
        <h3 class="font-semibold text-gray-900">
          DEG Table
          <span
            v-if="degResults?.summary"
            class="text-sm font-normal text-gray-600"
          >
            ({{ degResults.summary.significant_genes }} significant /
            {{ degResults.genes?.length || 0 }} total)
          </span>
        </h3>
        <p
          v-if="degResults?.summary?.comparison_description"
          class="text-xs text-gray-500 mt-1 max-w-md truncate"
          :title="degResults.summary.comparison_description"
        >
          {{ degResults.summary.comparison_description }}
        </p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <template v-if="degResults?.genes">
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="Search genes..."
            class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 w-28"
          />
          <div class="flex items-center gap-1">
            <button
              :disabled="
                !degResults ||
                !degResults.genes ||
                degResults.genes.length === 0
              "
              @click="downloadDEGTableCSV"
              class="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download DEG results to local CSV file"
            >
              📥 CSV
            </button>
            <button
              @click="$emit('saveGenesToCart', 'up')"
              :disabled="upregulatedCount === 0"
              class="px-2 py-1 border border-red-200 rounded text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save upregulated genes to gene cart"
            >
              ↑ {{ upregulatedCount }}
            </button>
            <button
              @click="$emit('saveGenesToCart', 'down')"
              :disabled="downregulatedCount === 0"
              class="px-2 py-1 border border-blue-200 rounded text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save downregulated genes to gene cart"
            >
              ↓ {{ downregulatedCount }}
            </button>
            <button
              @click="$emit('saveGenesToCart', 'all')"
              :disabled="filteredGenes.length === 0"
              class="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save all genes to gene cart"
            >
              Save All
            </button>
          </div>
        </template>
        <button
          v-else
          :disabled="
            !degResults || !degResults.genes || degResults.genes.length === 0
          "
          @click="downloadDEGTableCSV"
          class="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download DEG results to local CSV file"
        >
          📥 CSV
        </button>
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      <div
        v-if="isRunningDEG"
        class="h-full flex flex-col items-center justify-center text-gray-500"
      >
        <svg
          class="animate-spin h-8 w-8 text-primary-600 mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="text-sm font-medium">Calculating DEG results...</p>
      </div>
      <table v-else-if="sortedGenes.length > 0" class="w-full text-sm">
        <thead class="bg-gray-50 sticky top-0">
          <tr>
            <th
              @click="handleSort('gene')"
              class="px-2 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none text-xs"
            >
              Gene
              {{
                sortColumn === "gene"
                  ? sortDirection === "asc"
                    ? "↑"
                    : "↓"
                  : ""
              }}
            </th>
            <th
              @click="handleSort('logFC')"
              class="px-2 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none text-xs"
            >
              Log2FC
              {{
                sortColumn === "logFC"
                  ? sortDirection === "asc"
                    ? "↑"
                    : "↓"
                  : ""
              }}
            </th>
            <th class="px-2 py-2 text-left font-semibold text-gray-700 text-xs">
              Mean G1
            </th>
            <th class="px-2 py-2 text-left font-semibold text-gray-700 text-xs">
              Mean G2
            </th>
            <th class="px-2 py-2 text-left font-semibold text-gray-700 text-xs">
              Pct G1
            </th>
            <th class="px-2 py-2 text-left font-semibold text-gray-700 text-xs">
              Pct G2
            </th>
            <th
              @click="handleSort('adjPvalue')"
              class="px-2 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none text-xs"
            >
              Adj P
              {{
                sortColumn === "adjPvalue"
                  ? sortDirection === "asc"
                    ? "↑"
                    : "↓"
                  : ""
              }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(gene, idx) in sortedGenes"
            :key="idx"
            class="border-b border-gray-100 hover:bg-gray-50 text-xs"
          >
            <td class="px-2 py-1.5 font-medium">{{ gene.gene }}</td>
            <td
              class="px-2 py-1.5"
              :class="gene.logFC > 0 ? 'text-red-600' : 'text-blue-600'"
            >
              {{ gene.logFC?.toFixed(3) || "N/A" }}
            </td>
            <td class="px-2 py-1.5 text-gray-600">
              {{ gene.meanExprGroup1?.toFixed(2) || "N/A" }}
            </td>
            <td class="px-2 py-1.5 text-gray-600">
              {{ gene.meanExprGroup2?.toFixed(2) || "N/A" }}
            </td>
            <td class="px-2 py-1.5 text-gray-600">
              {{
                gene.pctGroup1 ? (gene.pctGroup1 * 100).toFixed(1) + "%" : "N/A"
              }}
            </td>
            <td class="px-2 py-1.5 text-gray-600">
              {{
                gene.pctGroup2 ? (gene.pctGroup2 * 100).toFixed(1) + "%" : "N/A"
              }}
            </td>
            <td class="px-2 py-1.5">
              {{
                typeof gene.adjPvalue === "number"
                  ? gene.adjPvalue.toExponential(2)
                  : "N/A"
              }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="h-full flex items-center justify-center text-gray-400">
        Run DEG analysis to see table
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import DownloadButtons from "../DownloadButtons.vue";

const props = defineProps({
  degResults: {
    type: Object,
    default: null,
  },
  isRunningDEG: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: "",
  },
  sortColumn: {
    type: String,
    default: null,
  },
  sortDirection: {
    type: String,
    default: "asc",
  },
  degParams: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "update:searchQuery",
  "update:sortColumn",
  "update:sortDirection",
  "saveGenesToCart",
]);

const filteredGenes = computed(() => {
  if (!props.degResults?.genes) return [];
  const search = props.searchQuery.toLowerCase().trim();
  if (!search) return props.degResults.genes;
  return props.degResults.genes.filter((g) =>
    g.gene.toLowerCase().includes(search)
  );
});

const sortedGenes = computed(() => {
  const genes = [...filteredGenes.value];
  if (!props.sortColumn) return genes;
  return genes.sort((a, b) => {
    let aVal, bVal;
    switch (props.sortColumn) {
      case "gene":
        aVal = a.gene.toLowerCase();
        bVal = b.gene.toLowerCase();
        break;
      case "logFC":
        aVal = a.logFC;
        bVal = b.logFC;
        break;
      case "adjPvalue":
        aVal = a.adjPvalue || a.pvalue;
        bVal = b.adjPvalue || b.pvalue;
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return props.sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return props.sortDirection === "asc" ? 1 : -1;
    return 0;
  });
});

const upregulatedCount = computed(() => {
  if (!props.degResults?.genes) return 0;
  return props.degResults.genes.filter(
    (g) =>
      Math.abs(g.logFC) >= props.degParams.minLogFC &&
      (g.adjPvalue || g.pvalue) <= props.degParams.maxPvalue &&
      g.logFC > 0
  ).length;
});

const downregulatedCount = computed(() => {
  if (!props.degResults?.genes) return 0;
  return props.degResults.genes.filter(
    (g) =>
      Math.abs(g.logFC) >= props.degParams.minLogFC &&
      (g.adjPvalue || g.pvalue) <= props.degParams.maxPvalue &&
      g.logFC < 0
  ).length;
});

const handleSort = (column) => {
  if (props.sortColumn === column) {
    emit(
      "update:sortDirection",
      props.sortDirection === "asc" ? "desc" : "asc"
    );
  } else {
    emit("update:sortColumn", column);
    emit("update:sortDirection", "asc");
  }
};

// Download function
const downloadDEGTableCSV = () => {
  if (!props.degResults?.genes || props.degResults.genes.length === 0) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const headers = [
      "gene",
      "log2_fold_change",
      "mean_expr_group1",
      "mean_expr_group2",
      "pct_group1",
      "pct_group2",
      "p_value",
      "p_value_adj",
      "significant",
    ];
    rows.push(headers.join(","));

    // Helper function to escape CSV values
    const escapeCSVValue = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Use sorted genes for CSV export
    sortedGenes.value.forEach((gene) => {
      const row = [
        escapeCSVValue(gene.gene || ""),
        escapeCSVValue(gene.logFC || gene.log2_fold_change || ""),
        escapeCSVValue(gene.meanExprGroup1 || gene.mean_expr_group1 || ""),
        escapeCSVValue(gene.meanExprGroup2 || gene.mean_expr_group2 || ""),
        escapeCSVValue(gene.pctGroup1 || gene.pct_group1 || ""),
        escapeCSVValue(gene.pctGroup2 || gene.pct_group2 || ""),
        escapeCSVValue(gene.pvalue || gene.p_value || ""),
        escapeCSVValue(gene.adjPvalue || gene.p_value_adj || ""),
        escapeCSVValue(gene.significant || false),
      ];
      rows.push(row.join(","));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `deg_results_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};
</script>
