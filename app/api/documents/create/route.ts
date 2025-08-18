import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
  const { projectId, title, code, mime, sizeBytes } = await req.json();
  if (!projectId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const storageBucket = "erp-docs";
  const storagePath = `${projectId}/${crypto.randomUUID()}`;

  const doc = await prisma.document.create({
    data: {
      projectId, title, code, mime, sizeBytes,
      storageBucket, storagePath, status: "SUBMITTED", submittedAt: new Date(),
    },
  });

  const s = supabaseServer();
  const { data, error } = await s.storage.from(storageBucket).createSignedUploadUrl(storagePath);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ doc, uploadUrl: data.signedUrl });
}
