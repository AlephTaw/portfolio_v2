"use client";

import { useCallback, useEffect, useState } from "react";
import { FiImage, FiPlus, FiTrash2, FiUpload, FiVideo } from "react-icons/fi";

type ArcAsset = {
  content_type: string;
  file_name: string;
  original_name: string;
  size: number;
  url: string;
};

type ArcPanel = {
  id: string;
  thumbnail: ArcAsset | null;
  video: ArcAsset | null;
};

type ArcRow = {
  created_at: string;
  id: string;
  panels: ArcPanel[];
  position: number;
  title: string;
  updated_at: string;
};

type PanelAssetKind = "thumbnail" | "video";

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | T
    | { detail?: string }
    | null;
  if (!response.ok) {
    throw new Error(
      payload && typeof payload === "object" && "detail" in payload
        ? payload.detail || "Request failed"
        : `Request failed with status ${response.status}`,
    );
  }
  return payload as T;
}

async function uploadAsset(file: File): Promise<ArcAsset> {
  const body = new FormData();
  body.set("image", file);
  return readJson<ArcAsset>(
    await fetch("/api/game/uploads", { body, method: "POST" }),
  );
}

async function discardAsset(asset: ArcAsset) {
  await fetch(`/api/game/uploads/${encodeURIComponent(asset.file_name)}`, {
    method: "DELETE",
  });
}

function rowAssets(row: ArcRow) {
  const uniqueAssets = new Map<string, ArcAsset>();
  row.panels.forEach((panel) => {
    if (panel.thumbnail) uniqueAssets.set(panel.thumbnail.file_name, panel.thumbnail);
    if (panel.video) uniqueAssets.set(panel.video.file_name, panel.video);
  });
  return [...uniqueAssets.values()];
}

export function ArcTimeline() {
  const [rows, setRows] = useState<ArcRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/game/arc/rows", { cache: "no-store" })
      .then((response) => readJson<ArcRow[]>(response))
      .then((loadedRows) => {
        if (!active) return;
        setRows(loadedRows);
        setSelectedId(loadedRows[0]?.id ?? null);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load Arc rows",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateRow = useCallback(
    async (
      rowId: string,
      changes: Partial<Pick<ArcRow, "panels" | "title">>,
    ) => {
      const updated = await readJson<ArcRow>(
        await fetch(`/api/game/arc/rows/${encodeURIComponent(rowId)}`, {
          body: JSON.stringify(changes),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        }),
      );
      setRows((current) =>
        current.map((row) => (row.id === rowId ? updated : row)),
      );
      return updated;
    },
    [],
  );

  const renameRow = async (row: ArcRow, title: string) => {
    if (!title || title === row.title) return;
    setError(null);
    try {
      await updateRow(row.id, { title });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to rename row",
      );
    }
  };

  const addRow = async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await readJson<ArcRow>(
        await fetch("/api/game/arc/rows", {
          body: JSON.stringify({
            title: `Arc ${String(rows.length + 1).padStart(2, "0")}`,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
      );
      setRows((current) => [...current, created]);
      setSelectedId(created.id);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to add row",
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteRow = async (row: ArcRow) => {
    if (!window.confirm(`Delete ${row.title} and all of its media?`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/game/arc/rows/${encodeURIComponent(row.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) await readJson<never>(response);
      const remainingRows = rows.filter(({ id }) => id !== row.id);
      setRows(remainingRows);
      setSelectedId(remainingRows[0]?.id ?? null);
      await Promise.allSettled(rowAssets(row).map(discardAsset));
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to delete row",
      );
    } finally {
      setBusy(false);
    }
  };

  const replacePanelAsset = async (
    row: ArcRow,
    panelId: string,
    kind: PanelAssetKind,
    file: File | undefined,
  ) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    let uploaded: ArcAsset | null = null;
    try {
      uploaded = await uploadAsset(file);
      const panel = row.panels.find(({ id }) => id === panelId);
      const previous = panel?.[kind] ?? null;
      const panels = row.panels.map((currentPanel) =>
        currentPanel.id === panelId
          ? { ...currentPanel, [kind]: uploaded }
          : currentPanel,
      );
      await updateRow(row.id, { panels });
      if (previous) await discardAsset(previous);
    } catch (requestError) {
      if (uploaded) await discardAsset(uploaded);
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to update ${kind}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const removePanelAsset = async (
    row: ArcRow,
    panelId: string,
    kind: PanelAssetKind,
  ) => {
    const panel = row.panels.find(({ id }) => id === panelId);
    const previous = panel?.[kind];
    if (!previous) return;
    setBusy(true);
    setError(null);
    try {
      const panels = row.panels.map((currentPanel) =>
        currentPanel.id === panelId
          ? { ...currentPanel, [kind]: null }
          : currentPanel,
      );
      await updateRow(row.id, { panels });
      await discardAsset(previous);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to remove ${kind}`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="After Action Reports" className="mt-8" id="arc-timeline">
      <div className="mb-4 flex justify-end">
        <button
          className="inline-flex items-center gap-2 rounded-full border border-black px-3 py-1.5 text-[0.48rem] font-semibold uppercase tracking-[0.14em] hover:bg-black hover:text-background disabled:opacity-40"
          disabled={busy}
          onClick={addRow}
          type="button"
        >
          <FiPlus aria-hidden="true" /> Add row
        </button>
      </div>

      {error ? (
        <p
          className="mb-4 border border-black px-3 py-2 text-[0.52rem] uppercase tracking-[0.1em] text-black"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid min-h-64 place-items-center border-[6px] border-black bg-[#e5e5e5] text-[0.5rem] uppercase tracking-[0.18em] text-[#6d6d6d]">
          Loading Arc
        </div>
      ) : null}

      {!loading && rows.length === 0 ? (
        <button
          className="grid min-h-64 w-full place-items-center border-[6px] border-dashed border-black bg-[#e5e5e5] text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-black"
          disabled={busy}
          onClick={addRow}
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <FiPlus /> Add first Arc row
          </span>
        </button>
      ) : null}

      <div className="space-y-6">
        {rows.map((row, index) => {
          const selected = selectedId === row.id;
          const template = row.position % 3;

          const panelView = (panel: ArcPanel | undefined, className: string) => {
            if (!panel) return null;
            return (
            <div
              className={`group/panel relative grid place-items-center overflow-hidden border-[6px] border-black bg-[#e5e5e5] ${className}`}
              key={panel.id}
            >
              {panel.video ? (
                <video
                  className="size-full bg-black object-cover"
                  controls
                  playsInline
                  poster={panel.thumbnail?.url}
                  preload="metadata"
                  src={panel.video.url}
                />
              ) : panel.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={panel.thumbnail.original_name}
                  className="size-full object-cover"
                  src={panel.thumbnail.url}
                />
              ) : (
                <div className="grid place-items-center gap-2 text-[#9a9a9a]">
                  <FiVideo aria-hidden="true" className="size-6" />
                  <span className="text-[0.44rem] uppercase tracking-[0.14em]">
                    Video panel
                  </span>
                </div>
              )}

              {selected ? (
                <div className="absolute right-2 top-2 grid gap-1">
                  {([
                    ["thumbnail", "Thumbnail", FiImage],
                    ["video", "Video", FiUpload],
                  ] as const).map(([kind, label, Icon]) => {
                    const asset = panel[kind];
                    return (
                      <div className="flex justify-end gap-1" key={kind}>
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-[0.42rem] font-semibold uppercase tracking-[0.1em] text-background">
                          <Icon aria-hidden="true" />
                          {asset ? `Replace ${label}` : `Add ${label}`}
                          <input
                            accept={
                              kind === "video"
                                ? "video/mp4,video/quicktime,video/webm"
                                : "image/gif,image/jpeg,image/png,image/webp"
                            }
                            className="sr-only"
                            disabled={busy}
                            onChange={(event) => {
                              void replacePanelAsset(
                                row,
                                panel.id,
                                kind,
                                event.currentTarget.files?.[0],
                              );
                              event.currentTarget.value = "";
                            }}
                            type="file"
                          />
                        </label>
                        {asset ? (
                          <button
                            aria-label={`Remove ${label.toLowerCase()} from ${row.title}`}
                            className="grid size-7 place-items-center rounded-full bg-black text-background"
                            disabled={busy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void removePanelAsset(row, panel.id, kind);
                            }}
                            type="button"
                          >
                            <FiTrash2 aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
            );
          };

          return (
            <article
              aria-label={`${row.title} media row`}
              className="relative"
              key={row.id}
              onClick={() => setSelectedId(row.id)}
            >
              <div
                className={`mb-2 flex items-center gap-2 px-2 py-1 transition-colors ${
                  selected ? "bg-black text-background" : "text-black"
                }`}
              >
                <span className="text-[0.48rem] font-semibold uppercase tracking-[0.16em]">
                  Row {String(index + 1).padStart(2, "0")}
                </span>
                <input
                  aria-label={`Title for row ${index + 1}`}
                  className="min-w-0 flex-1 border-0 bg-transparent text-[0.55rem] font-semibold uppercase tracking-[0.14em] outline-none placeholder:text-[#8a8a8a]"
                  defaultValue={row.title}
                  key={`${row.id}-${row.title}`}
                  onBlur={(event) => {
                    const title = event.currentTarget.value.trim();
                    if (title) void renameRow(row, title);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                />
                {selected ? (
                  <button
                    aria-label={`Delete ${row.title}`}
                    className="grid size-7 place-items-center rounded-full hover:bg-background hover:text-black disabled:opacity-40"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteRow(row);
                    }}
                    type="button"
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              {template === 0 ? (
                <div className="grid grid-cols-[2fr_1fr] items-start gap-2">
                  {panelView(row.panels[0], "aspect-[16/9]")}
                  {panelView(row.panels[1], "aspect-[3/4]")}
                </div>
              ) : null}

              {template === 1 ? (
                <div className="grid grid-cols-[1fr_1.45fr] gap-2">
                  {panelView(row.panels[0], "aspect-square")}
                  <div className="grid grid-rows-2 gap-2">
                    {panelView(row.panels[1], "")}
                    {panelView(row.panels[2], "")}
                  </div>
                </div>
              ) : null}

              {template === 2 ? (
                <div className="grid grid-cols-[1fr_2fr] items-end gap-2">
                  {panelView(row.panels[0], "aspect-[3/4]")}
                  {panelView(row.panels[1], "aspect-[16/9]")}
                </div>
              ) : null}

              {row.panels.length > (template === 1 ? 3 : 2) ? (
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {row.panels
                    .slice(template === 1 ? 3 : 2)
                    .map((panel) => panelView(panel, "aspect-square"))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
