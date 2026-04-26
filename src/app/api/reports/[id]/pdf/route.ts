import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Generate a simple PDF-like response from report data
// In production, use a library like puppeteer or jspdf on the server
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            property: true,
            user: { select: { id: true, name: true } },
            provider: { select: { id: true, name: true, specialty: true } },
          },
        },
        author: { select: { id: true, name: true, specialty: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "التقرير غير موجود" }, { status: 404 });
    }

    // Authorization check
    const req = report.request;
    if (user.role === "CLIENT" && req.userId !== user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    if (user.role === "EXPERT" && req.providerId !== user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // Build a rich HTML report for print/PDF
    const typeLabel = report.type === "LEGAL" ? "قانوني" : "فني / هندسي";
    const packageLabel =
      req.packageName === "FULL" ? "الأمان الشامل" :
      req.packageName === "LEGAL" ? "المراجعة القانونية" : "الفحص الهندسي";

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${report.title} - أمانك العقاري</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', sans-serif; background: #fff; color: #1a1a2e; padding: 40px; line-height: 1.8; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: 700; color: #f59e0b; }
    .logo span { color: #1a1a2e; }
    .badge { background: #fef3c7; color: #92400e; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .report-title { font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
    .report-meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: 700; color: #f59e0b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item label { display: block; font-size: 11px; color: #94a3b8; font-weight: 600; }
    .info-item span { font-size: 14px; font-weight: 600; }
    .content-block { white-space: pre-wrap; font-size: 14px; line-height: 2; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px; }
    .stamp { display: inline-block; border: 2px solid #f59e0b; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; text-align: center; color: #f59e0b; font-weight: 700; font-size: 14px; margin-top: 20px; }
    @media print { body { padding: 20px; } .section { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">أمانك <span>العقاري</span></div>
    <div>
      <span class="badge">تقرير ${typeLabel}</span>
    </div>
  </div>

  <h1 class="report-title">${report.title}</h1>
  <div class="report-meta">
    رقم التقرير: ${report.id.slice(-8).toUpperCase()} &nbsp;|&nbsp;
    تاريخ الإصدار: ${new Date(report.createdAt).toLocaleDateString("ar-EG", { dateStyle: "long" })} &nbsp;|&nbsp;
    رقم ال��لب: ${req.id.slice(-6).toUpperCase()}
  </div>

  <div class="section">
    <div class="section-title">معلومات العقار</div>
    <div class="info-grid">
      <div class="info-item"><label>العنوان</label><span>${req.property?.location || "---"}</span></div>
      <div class="info-item"><label>المنطقة</label><span>${req.property?.area || "---"}</span></div>
      <div class="info-item"><label>نوع العقار</label><span>${req.property?.type || "---"}</span></div>
      <div class="info-item"><label>الباقة</label><span>${packageLabel}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">معلومات الأطراف</div>
    <div class="info-grid">
      <div class="info-item"><label>العميل</label><span>${req.user?.name || "---"}</span></div>
      <div class="info-item"><label>الخبير</label><span>${report.author?.name || "---"} (${report.author?.specialty === "ENGINEER" ? "مهندس" : "محامي"})</span></div>
    </div>
  </div>

  ${report.summary ? `
  <div class="section">
    <div class="section-title">ملخص التقرير</div>
    <div class="content-block">${report.summary}</div>
  </div>
  ` : ""}

  ${report.content ? `
  <div class="section">
    <div class="section-title">التفاصيل والنتائج</div>
    <div class="content-block">${report.content}</div>
  </div>
  ` : ""}

  <div class="footer">
    <div class="stamp">أمانك</div>
    <p style="margin-top:16px;">هذا التقرير صادر من منصة أمانك العقاري — المنصة الأولى للأمان العقاري في مصر</p>
    <p>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-EG", { dateStyle: "long" })}</p>
    <p style="margin-top:8px; font-size:10px; color:#cbd5e1;">هذا المستند إلكتروني ولا يحتاج إلى توقيع. يمكن التحقق من صحته عبر رقم التقرير.</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="report-${report.id.slice(-8)}.html"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
