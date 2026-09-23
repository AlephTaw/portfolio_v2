import os
from pathlib import Path
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile, status
from fastapi.responses import FileResponse

from app.db.connection import PROJECT_ROOT

router = APIRouter(prefix="/uploads", tags=["uploads"])

MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_VIDEO_BYTES = 100 * 1024 * 1024
ASSET_EXTENSIONS = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/webm": ".webm",
}


def has_valid_asset_signature(content: bytes, content_type: str) -> bool:
    if content_type == "image/png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/jpeg":
        return content.startswith(b"\xff\xd8\xff")
    if content_type == "image/gif":
        return content.startswith((b"GIF87a", b"GIF89a"))
    if content_type == "image/webp":
        return len(content) >= 12 and content.startswith(b"RIFF") and content[8:12] == b"WEBP"
    if content_type in {"video/mp4", "video/quicktime"}:
        return len(content) >= 12 and content[4:8] == b"ftyp"
    if content_type == "video/webm":
        return content.startswith(b"\x1aE\xdf\xa3")
    return False


def resolve_upload_directory(upload_dir: str | Path | None = None) -> Path:
    configured = upload_dir or os.getenv("GAME_UPLOAD_DIR") or PROJECT_ROOT / "data" / "uploads"
    path = Path(configured).expanduser()
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    return path.resolve()


def get_upload_directory(request: Request) -> Path:
    return request.app.state.upload_dir


UploadDirectory = Annotated[Path, Depends(get_upload_directory)]


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_asset(
    upload_dir: UploadDirectory,
    image: Annotated[UploadFile, File()],
) -> dict[str, str | int]:
    content_type = image.content_type or ""
    extension = ASSET_EXTENSIONS.get(content_type)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload must be a PNG, JPEG, WebP, GIF, MP4, MOV, or WebM file",
        )

    maximum_size = MAX_VIDEO_BYTES if content_type.startswith("video/") else MAX_IMAGE_BYTES
    content = await image.read(maximum_size + 1)
    if len(content) > maximum_size:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=(
                "Video must be 100 MB or smaller"
                if content_type.startswith("video/")
                else "Image must be 10 MB or smaller"
            ),
        )
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload is empty")
    if not has_valid_asset_signature(content, content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not match its declared media type",
        )

    upload_dir.mkdir(parents=True, exist_ok=True)
    file_name = f"{uuid4()}{extension}"
    (upload_dir / file_name).write_bytes(content)
    return {
        "content_type": content_type,
        "file_name": file_name,
        "original_name": image.filename or file_name,
        "size": len(content),
        "url": f"/api/game/uploads/{file_name}",
    }


@router.get("/{file_name}")
def get_uploaded_asset(file_name: str, upload_dir: UploadDirectory) -> FileResponse:
    if Path(file_name).name != file_name:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    path = upload_dir / file_name
    if not path.is_file() or path.suffix.lower() not in ASSET_EXTENSIONS.values():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return FileResponse(path, media_type=None, filename=file_name, content_disposition_type="inline")


@router.delete("/{file_name}", status_code=status.HTTP_204_NO_CONTENT)
def delete_uploaded_asset(file_name: str, upload_dir: UploadDirectory) -> Response:
    if Path(file_name).name != file_name:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    path = upload_dir / file_name
    if not path.is_file() or path.suffix.lower() not in ASSET_EXTENSIONS.values():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    path.unlink()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
