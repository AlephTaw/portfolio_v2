"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CollectionItem,
  CollectionItemCreate,
  CollectionItemUpdate,
  CollectionName,
} from "./types";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;
    throw new Error(payload?.detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function useCollectionItems(collection: CollectionName) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/game/items?collection=${encodeURIComponent(collection)}`,
        { cache: "no-store" },
      );
      setItems(await readJson<CollectionItem[]>(response));
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to load items",
      );
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    let active = true;
    fetch(`/api/game/items?collection=${encodeURIComponent(collection)}`, {
      cache: "no-store",
    })
      .then((response) => readJson<CollectionItem[]>(response))
      .then((loadedItems) => {
        if (active) setItems(loadedItems);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load items",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [collection]);

  const createItem = useCallback(async (payload: CollectionItemCreate) => {
    const response = await fetch("/api/game/items", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const created = await readJson<CollectionItem>(response);
    setItems((current) => [created, ...current]);
    return created;
  }, []);

  const updateItem = useCallback(
    async (id: string, payload: CollectionItemUpdate) => {
      const response = await fetch(`/api/game/items/${encodeURIComponent(id)}`, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const updated = await readJson<CollectionItem>(response);
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      return updated;
    },
    [],
  );

  const deleteItem = useCallback(async (id: string) => {
    const response = await fetch(`/api/game/items/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) await readJson<never>(response);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  return { createItem, deleteItem, error, items, loading, refresh, updateItem };
}
