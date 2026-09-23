export type UploadedImage = {
  content_type: string;
  file_name: string;
  original_name: string;
  size: number;
  url: string;
};

export async function uploadCollectionImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.set("image", file);
  const response = await fetch("/api/game/uploads", {
    body: formData,
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as
    | UploadedImage
    | { detail?: string }
    | null;
  if (!response.ok || !payload || !("url" in payload)) {
    throw new Error(
      payload && "detail" in payload && payload.detail
        ? payload.detail
        : `Image upload failed with status ${response.status}`,
    );
  }
  return payload;
}
