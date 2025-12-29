import { ref, watch } from "vue";

const STORAGE_KEY = "ssk_gene_cart_v1";

const cartItems = ref([]);

const loadInitialCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        id: item.id || crypto.randomUUID(),
        label: item.label || "Gene Set",
        genes: Array.isArray(item.genes) ? item.genes : [],
        source: item.source || "custom",
        createdAt: item.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  } catch (err) {
    console.warn("Failed to load gene cart:", err);
    return [];
  }
};

const persistCart = (items) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to persist gene cart:", err);
  }
};

const normalizeGenes = (genes) => {
  if (!genes) return [];
  const list = Array.isArray(genes) ? genes : String(genes).split(/[,\s]+/);
  return [
    ...new Set(
      list
        .map((gene) => gene.trim().toUpperCase())
        .filter((gene) => gene.length > 0)
    ),
  ];
};

if (typeof window !== "undefined") {
  cartItems.value = loadInitialCart();
}

watch(
  cartItems,
  (items) => {
    persistCart(items);
  },
  { deep: true }
);

const createId = () =>
  typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useGeneCart() {
  const addItem = ({ label, genes, source }) => {
    const normalizedGenes = normalizeGenes(genes);
    if (!normalizedGenes.length) return false;

    const item = {
      id: createId(),
      label: label?.trim() || `Gene Set ${cartItems.value.length + 1}`,
      genes: normalizedGenes,
      source: source || "custom",
      createdAt: new Date().toISOString(),
    };

    cartItems.value = [item, ...cartItems.value];
    return item.id;
  };

  const removeItem = (id) => {
    cartItems.value = cartItems.value.filter((item) => item.id !== id);
  };

  const clearCart = () => {
    cartItems.value = [];
  };

  const renameItem = (id, newLabel) => {
    cartItems.value = cartItems.value.map((item) =>
      item.id === id ? { ...item, label: newLabel?.trim() || item.label } : item
    );
  };

  const getItemById = (id) => cartItems.value.find((item) => item.id === id);

  return {
    cartItems,
    addItem,
    removeItem,
    clearCart,
    renameItem,
    getItemById,
  };
}

