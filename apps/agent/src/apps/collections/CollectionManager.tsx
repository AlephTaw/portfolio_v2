"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FiAward, FiBox, FiEdit3, FiImage, FiPlus, FiShoppingBag, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";
import { POPULATE_COMPOSER_EVENT, type PopulateComposerDetail } from "./composerEvents";
import { useCollectionItems } from "./useCollectionItems";
import { uploadCollectionImage } from "./uploadImage";
import {
  inventoryCategories,
  type CollectionItem,
  type CollectionItemCreate,
  type CollectionName,
  type InventoryCategory,
} from "./types";

type EditorValues = {
  name: string;
  summary: string;
  description: string;
  thumbnailUrl: string;
  imageUrl: string;
  category: InventoryCategory;
  quantity: string;
  condition: string;
  status: string;
  requirement: string;
  topics: string;
  price: string;
  currency: string;
  available: boolean;
};

const inputClass =
  "w-full border border-black/20 bg-background px-3 py-2 text-sm text-[#191714] outline-none transition-colors placeholder:text-[#9a9289] focus:border-black";
const labelClass =
  "grid gap-1 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#6d6257]";

const singularCollectionName: Record<CollectionName, string> = {
  achievements: "achievement",
  inventory: "inventory item",
  store: "store item",
};

function detailText(item: CollectionItem | null, key: string, fallback = "") {
  const value = item?.details[key];
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
}

function editorValues(item: CollectionItem | null): EditorValues {
  const topics = item?.details.topics;
  const priceCents = item?.details.price_cents;
  return {
    available: item?.details.available !== false,
    category: (detailText(item, "category", "office") || "office") as InventoryCategory,
    condition: detailText(item, "condition"),
    currency: detailText(item, "currency", "USD"),
    description: item?.description || "",
    imageUrl: item?.image_url || "",
    name: item?.name || "",
    price:
      typeof priceCents === "number" ? (priceCents / 100).toFixed(2) : "0.00",
    quantity: detailText(item, "quantity", "1"),
    requirement: detailText(item, "requirement"),
    status: detailText(item, "status", "in-progress"),
    summary: item?.summary || "",
    thumbnailUrl: item?.thumbnail_url || "",
    topics: Array.isArray(topics) ? topics.join(", ") : "",
  };
}

function itemPayload(
  collection: CollectionName,
  values: EditorValues,
): CollectionItemCreate {
  let details: Record<string, unknown>;
  if (collection === "inventory") {
    details = {
      category: values.category,
      condition: values.condition,
      quantity: Math.max(0, Number(values.quantity) || 0),
    };
  } else if (collection === "achievements") {
    details = {
      requirement: values.requirement,
      status: values.status,
      topics: values.topics
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
    };
  } else {
    details = {
      available: values.available,
      currency: values.currency.toUpperCase() || "USD",
      price_cents: Math.max(0, Math.round((Number(values.price) || 0) * 100)),
    };
  }

  return {
    collection,
    description: values.description,
    details,
    image_url: values.imageUrl || null,
    name: values.name.trim(),
    summary: values.summary,
    thumbnail_url: values.thumbnailUrl || null,
  };
}

function ItemImage({ item, large = false }: { item: CollectionItem; large?: boolean }) {
  const source = (large ? item.image_url || item.thumbnail_url : item.thumbnail_url || item.image_url);
  const FallbackIcon =
    item.collection === "achievements"
      ? FiAward
      : item.collection === "store"
        ? FiShoppingBag
        : FiBox;

  return (
    <div
      className={`grid place-items-center overflow-hidden bg-[#eeeae3] text-[#514a43] ${
        large ? "aspect-[16/9] w-full" : "size-7 rounded-sm border border-[#d8d8d8]"
      }`}
    >
      {source ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-full w-full object-cover"
          src={source}
        />
      ) : (
        <FallbackIcon aria-hidden="true" className={large ? "size-12" : "size-3"} />
      )}
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className={labelClass}>
      {label}
      {children}
    </label>
  );
}

function LocalImagePreview({ file, label }: { file: File; label: string }) {
  const source = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(source), [source]);
  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 border border-black/10 p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-12 object-cover" src={source} />
      <div className="min-w-0">
        <p className="text-[0.46rem] font-semibold uppercase tracking-[0.14em] text-[#80766c]">{label}</p>
        <p className="mt-1 truncate text-xs text-[#191714]">{file.name}</p>
      </div>
    </div>
  );
}

function ItemEditor({
  collection,
  initialCategory,
  item,
  onCancel,
  onSave,
}: {
  collection: CollectionName;
  initialCategory?: InventoryCategory;
  item: CollectionItem | null;
  onCancel: () => void;
  onSave: (payload: CollectionItemCreate) => Promise<void>;
}) {
  const [values, setValues] = useState(() => ({
    ...editorValues(item),
    ...(initialCategory ? { category: initialCategory } : {}),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [detailFile, setDetailFile] = useState<File | null>(null);

  function change<K extends keyof EditorValues>(key: K, value: EditorValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let payload = itemPayload(collection, values);
      if (thumbnailFile || detailFile) {
        const [thumbnailUpload, detailUpload] = await Promise.all([
          thumbnailFile ? uploadCollectionImage(thumbnailFile) : null,
          detailFile ? uploadCollectionImage(detailFile) : null,
        ]);
        payload = {
          ...payload,
          image_url:
            detailUpload?.url || thumbnailUpload?.url || payload.image_url,
          thumbnail_url:
            thumbnailUpload?.url || detailUpload?.url || payload.thumbnail_url,
        };
      }
      await onSave(payload);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save item");
      setSaving(false);
    }
  }

  function prepareInComposer() {
    const files = [thumbnailFile, detailFile].filter(
      (file): file is File => file !== null,
    );
    if (!files.length) return;
    const metadata = itemPayload(collection, values);
    const prompt = [
      `Upload the attached image${files.length === 1 ? "" : "s"} and create a new ${singularCollectionName[collection]} record.`,
      "Use the first attached image as the thumbnail and the second as the detail image; if only one image is attached, use it for both.",
      "Apply this metadata:",
      JSON.stringify(
        {
          collection: metadata.collection,
          description: metadata.description,
          details: metadata.details,
          name: metadata.name || `Untitled ${singularCollectionName[collection]}`,
          summary: metadata.summary,
        },
      ),
    ].join(" ");
    window.dispatchEvent(
      new CustomEvent<PopulateComposerDetail>(POPULATE_COMPOSER_EVENT, {
        detail: {
          action: { payload: metadata, type: "create-collection-item" },
          files,
          prompt,
        },
      }),
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[#746b61]">
            {item ? "Edit record" : "New record"}
          </p>
          <h2 className="mt-1 font-serif text-xl text-[#191714]">
            {item ? item.name : `Add ${singularCollectionName[collection]}`}
          </h2>
        </div>
        <button aria-label="Cancel editing" className="p-2" onClick={onCancel} type="button">
          <FiX aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input className={inputClass} maxLength={120} onChange={(event) => change("name", event.target.value)} required value={values.name} />
        </Field>
        <Field label="Summary">
          <input className={inputClass} maxLength={240} onChange={(event) => change("summary", event.target.value)} value={values.summary} />
        </Field>
      </div>
      <Field label="Description">
        <textarea className={`${inputClass} min-h-24 resize-y`} onChange={(event) => change("description", event.target.value)} value={values.description} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Thumbnail URL or public path">
          <input className={inputClass} onChange={(event) => change("thumbnailUrl", event.target.value)} placeholder="/items/example-thumb.webp" value={values.thumbnailUrl} />
        </Field>
        <Field label="Detail image URL or public path">
          <input className={inputClass} onChange={(event) => change("imageUrl", event.target.value)} placeholder="/items/example.webp" value={values.imageUrl} />
        </Field>
      </div>

      <section className="grid gap-3 border-y border-black/10 py-4">
        <div className="flex items-center gap-2">
          <FiImage aria-hidden="true" className="size-4" />
          <p className="text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#6d6257]">Local images</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Thumbnail image">
            <input
              accept="image/gif,image/jpeg,image/png,image/webp"
              className="block w-full text-xs text-[#514a43] file:mr-3 file:border-0 file:bg-black file:px-3 file:py-2 file:text-[0.48rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-white"
              onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)}
              type="file"
            />
          </Field>
          <Field label="Detail image">
            <input
              accept="image/gif,image/jpeg,image/png,image/webp"
              className="block w-full text-xs text-[#514a43] file:mr-3 file:border-0 file:bg-black file:px-3 file:py-2 file:text-[0.48rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-white"
              onChange={(event) => setDetailFile(event.target.files?.[0] || null)}
              type="file"
            />
          </Field>
        </div>
        {thumbnailFile || detailFile ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {thumbnailFile ? <LocalImagePreview file={thumbnailFile} label="Thumbnail" /> : null}
            {detailFile ? <LocalImagePreview file={detailFile} label="Detail image" /> : null}
          </div>
        ) : null}
        <div className="flex justify-end">
          <button
            className="flex items-center gap-2 rounded-full border border-black px-4 py-2 text-[0.48rem] font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!thumbnailFile && !detailFile}
            onClick={prepareInComposer}
            type="button"
          >
            <FiUploadCloud aria-hidden="true" />
            Prepare in composer
          </button>
        </div>
      </section>

      {collection === "inventory" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Category">
            <select className={inputClass} onChange={(event) => change("category", event.target.value as InventoryCategory)} value={values.category}>
              {inventoryCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </Field>
          <Field label="Quantity">
            <input className={inputClass} min="0" onChange={(event) => change("quantity", event.target.value)} type="number" value={values.quantity} />
          </Field>
          <Field label="Condition or location">
            <input className={inputClass} onChange={(event) => change("condition", event.target.value)} value={values.condition} />
          </Field>
        </div>
      ) : collection === "achievements" ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Status">
              <select className={inputClass} onChange={(event) => change("status", event.target.value)} value={values.status}>
                <option value="in-progress">In progress</option>
                <option value="earned">Earned</option>
                <option value="locked">Locked</option>
              </select>
            </Field>
            <Field label="Topics (comma separated)">
              <input className={inputClass} onChange={(event) => change("topics", event.target.value)} value={values.topics} />
            </Field>
          </div>
          <Field label="Requirement">
            <textarea className={`${inputClass} min-h-20 resize-y`} onChange={(event) => change("requirement", event.target.value)} value={values.requirement} />
          </Field>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Price">
            <input className={inputClass} min="0" onChange={(event) => change("price", event.target.value)} step="0.01" type="number" value={values.price} />
          </Field>
          <Field label="Currency">
            <input className={inputClass} maxLength={3} onChange={(event) => change("currency", event.target.value)} value={values.currency} />
          </Field>
          <label className={`${labelClass} content-end`}>
            Availability
            <span className="flex h-[2.375rem] items-center gap-2 border border-black/20 px-3 text-xs">
              <input checked={values.available} onChange={(event) => change("available", event.target.checked)} type="checkbox" />
              Available for purchase
            </span>
          </label>
        </div>
      )}

      {error ? <p className="text-xs text-[#9a342f]">{error}</p> : null}
      <div className="flex justify-end gap-2 border-t border-black/10 pt-4">
        <button className="rounded-full px-4 py-2 text-[0.5rem] font-semibold uppercase tracking-[0.14em]" onClick={onCancel} type="button">Cancel</button>
        <button className="rounded-full bg-black px-5 py-2 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40" disabled={saving || !values.name.trim()} type="submit">
          {saving ? "Saving" : "Save item"}
        </button>
      </div>
    </form>
  );
}

function detailRows(item: CollectionItem) {
  if (item.collection === "inventory") {
    return [
      ["Category", detailText(item, "category", "Uncategorized")],
      ["Quantity", detailText(item, "quantity", "0")],
      ["Condition", detailText(item, "condition", "—")],
    ];
  }
  if (item.collection === "store") {
    const cents = Number(item.details.price_cents) || 0;
    return [
      ["Price", `${detailText(item, "currency", "USD")} ${(cents / 100).toFixed(2)}`],
      ["Availability", item.details.available === false ? "Unavailable" : "Available"],
    ];
  }
  return [
    ["Status", detailText(item, "status", "In progress").replace("-", " ")],
  ];
}

function ItemDetails({
  item,
  onClose,
  onDelete,
  onEdit,
}: {
  item: CollectionItem;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onEdit: () => void;
}) {
  const topics = Array.isArray(item.details.topics)
    ? item.details.topics.filter((topic): topic is string => typeof topic === "string")
    : [];

  return (
    <article>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[#746b61]">{item.collection} details</p>
          <h2 className="mt-1 font-serif text-2xl text-[#191714]">{item.name}</h2>
          {item.summary ? <p className="mt-1 text-sm text-[#746b61]">{item.summary}</p> : null}
        </div>
        <button aria-label="Close details" className="p-2" onClick={onClose} type="button"><FiX aria-hidden="true" /></button>
      </div>
      <div className="mt-5"><ItemImage item={item} large /></div>
      {item.description ? <p className="mt-5 text-sm leading-6 text-[#403a34]">{item.description}</p> : null}
      <dl className="mt-5 grid gap-px bg-black/10 sm:grid-cols-3">
        {detailRows(item).map(([label, value]) => (
          <div className="bg-background p-3" key={label}>
            <dt className="text-[0.46rem] font-semibold uppercase tracking-[0.14em] text-[#80766c]">{label}</dt>
            <dd className="mt-1 text-xs capitalize text-[#191714]">{value}</dd>
          </div>
        ))}
      </dl>
      {item.collection === "achievements" && detailText(item, "requirement") ? (
        <section className="mt-5 border-y border-dashed border-[#c8c0b5] py-4">
          <h3 className="text-[0.5rem] font-semibold uppercase tracking-[0.16em] text-[#71685e]">Requirement</h3>
          <p className="mt-2 text-sm leading-6 text-[#4a453f]">{detailText(item, "requirement")}</p>
          {topics.length ? <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">{topics.map((topic) => <li className="text-xs text-[#4a453f]" key={topic}>— {topic}</li>)}</ul> : null}
        </section>
      ) : null}
      <div className="mt-5 flex justify-end gap-2">
        <button className="flex items-center gap-2 rounded-full px-4 py-2 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#8d312d]" onClick={() => void onDelete()} type="button"><FiTrash2 aria-hidden="true" />Delete</button>
        <button className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-white" onClick={onEdit} type="button"><FiEdit3 aria-hidden="true" />Edit</button>
      </div>
    </article>
  );
}

function CollectionDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-x-0 top-0 bottom-[var(--composer-dock-offset,6.5rem)] z-[10005] grid place-items-center bg-black/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div aria-modal="true" className="pane-scroll max-h-[calc(100dvh-var(--composer-dock-offset,6.5rem)-2rem)] w-full max-w-2xl overflow-y-auto bg-background p-5 shadow-2xl sm:p-7" data-lenis-prevent role="dialog">
        {children}
      </div>
    </div>,
    document.body,
  );
}

function ItemGrid({
  items,
  onAdd,
  onSelect,
}: {
  items: CollectionItem[];
  onAdd: () => void;
  onSelect: (item: CollectionItem) => void;
}) {
  const desktopSlots = Math.max(8, Math.ceil((items.length + 1) / 8) * 8);
  const mobileSlots = Math.max(4, Math.ceil((items.length + 1) / 4) * 4);
  const emptySlots = desktopSlots - items.length;
  const mobileHiddenSlots = desktopSlots - mobileSlots;
  return (
    <div className="grid grid-cols-4 gap-x-1 gap-y-2 sm:grid-cols-8">
      {items.map((item) => (
        <button className="group flex min-w-0 flex-col items-center text-center focus:outline-none" key={item.id} onClick={() => onSelect(item)} type="button">
          <span className="relative transition-transform group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-black group-focus-visible:ring-offset-2"><ItemImage item={item} />
            {item.collection === "inventory" && Number(item.details.quantity) > 1 ? <span className="absolute -right-1 -top-1 grid min-h-3 min-w-3 place-items-center rounded-full bg-black px-0.5 text-[0.36rem] font-semibold leading-none text-white">{String(item.details.quantity)}</span> : null}
          </span>
          <span className="mt-0.5 max-w-full truncate text-[0.42rem] leading-2 text-[#3f3f3f]">{item.name}</span>
        </button>
      ))}
      {Array.from({ length: emptySlots }, (_, index) => (
        <div className={index >= emptySlots - mobileHiddenSlots ? "hidden sm:flex" : "flex"} key={`empty-${index}`}>
          {index === 0 ? (
            <button
              aria-label="Add item to this section"
              className="group mx-auto grid size-7 place-items-center rounded-sm border border-[#d8d8d8] bg-background text-[#686057] transition-colors hover:border-black hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              onClick={onAdd}
              type="button"
            >
              <FiPlus aria-hidden="true" className="size-3" />
            </button>
          ) : (
            <div aria-hidden="true" className="mx-auto size-7 rounded-sm border border-[#e5e5e5] bg-background" />
          )}
        </div>
      ))}
    </div>
  );
}

export function CollectionManager({
  collection,
  showHeading = false,
}: {
  collection: CollectionName;
  showHeading?: boolean;
}) {
  const { createItem, deleteItem, error, items, loading, refresh, updateItem } = useCollectionItems(collection);
  const [category, setCategory] = useState<"all" | InventoryCategory>("all");
  const [creatingCategory, setCreatingCategory] = useState<InventoryCategory | undefined>();
  const [selected, setSelected] = useState<CollectionItem | null>(null);
  const [editing, setEditing] = useState<CollectionItem | "new" | null>(null);
  const visibleItems = useMemo(
    () => category === "all" ? items : items.filter((item) => item.details.category === category),
    [category, items],
  );

  async function save(payload: CollectionItemCreate) {
    const saved = editing === "new"
      ? await createItem(payload)
      : await updateItem(editing!.id, payload);
    setEditing(null);
    setCreatingCategory(undefined);
    setSelected(saved);
  }

  function beginCreate(inventoryCategory?: InventoryCategory) {
    setCreatingCategory(inventoryCategory);
    setEditing("new");
  }

  function cancelEditing() {
    setCreatingCategory(undefined);
    setEditing(null);
  }

  async function removeSelected() {
    if (!selected || !window.confirm(`Delete “${selected.name}”? This cannot be undone.`)) return;
    await deleteItem(selected.id);
    setSelected(null);
  }

  return (
    <div className={showHeading ? "mt-9" : "bg-background px-3 py-2"}>
      <div>
        {showHeading ? <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#6d6d6d]">Achievements</p> : null}
        <p className={`${showHeading ? "mt-2" : ""} text-[0.5rem] uppercase tracking-[0.16em] text-[#80766c]`}>{items.length} {items.length === 1 ? "record" : "records"}</p>
      </div>

      {collection === "inventory" ? (
        <div aria-label="Inventory categories" className="my-4 flex flex-wrap gap-1.5" role="group">
          {(["all", ...inventoryCategories] as const).map((value) => <button aria-pressed={category === value} className={`rounded-full border px-3 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.12em] ${category === value ? "border-black bg-black text-white" : "border-[#bdb4a8] text-[#514a43] hover:border-black"}`} key={value} onClick={() => setCategory(value)} type="button">{value}</button>)}
        </div>
      ) : <div className="h-4" />}

      {loading ? <p className="py-12 text-center text-xs uppercase tracking-[0.14em] text-[#80766c]">Loading records…</p> : error ? (
        <div className="border border-[#b65b54]/30 bg-[#b65b54]/5 p-4 text-xs text-[#71342f]"><p>{error}</p><button className="mt-3 underline" onClick={() => void refresh()} type="button">Try again</button></div>
      ) : collection === "inventory" && category === "all" ? (
        <div className="grid gap-6">
          {inventoryCategories.map((inventoryCategory) => <section key={inventoryCategory}><h3 className="mb-2 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#6d6257]">{inventoryCategory}</h3><ItemGrid items={items.filter((item) => item.details.category === inventoryCategory)} onAdd={() => beginCreate(inventoryCategory)} onSelect={setSelected} /></section>)}
        </div>
      ) : <ItemGrid items={visibleItems} onAdd={() => beginCreate(collection === "inventory" && category !== "all" ? category : undefined)} onSelect={setSelected} />}

      {selected ? <CollectionDialog onClose={() => setSelected(null)}><ItemDetails item={selected} onClose={() => setSelected(null)} onDelete={removeSelected} onEdit={() => { setEditing(selected); setSelected(null); }} /></CollectionDialog> : null}
      {editing ? <CollectionDialog onClose={cancelEditing}><ItemEditor collection={collection} initialCategory={creatingCategory} item={editing === "new" ? null : editing} onCancel={cancelEditing} onSave={save} /></CollectionDialog> : null}
    </div>
  );
}
