import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";
import { getServerT } from "@/lib/i18n/server";

export async function POST(req: Request) {
  try {
    const t = await getServerT();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: t("api.noFileUploaded") }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: t("api.unsupportedFileType") },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: t("api.fileTooLarge") },
        { status: 400 }
      );
    }

    // Generate unique filename
    const folder = (formData.get("folder") as string) || "national-ids";
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${folder}/${crypto.randomUUID()}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url, message: t("api.fileUploaded") });
  } catch (error) {
    console.error("Upload error:", error);
    const t = await getServerT();
    return NextResponse.json({ error: t("api.fileUploadFailed") }, { status: 500 });
  }
}
