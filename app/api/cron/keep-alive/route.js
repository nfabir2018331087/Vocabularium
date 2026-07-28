import prisma from "../../../../lib/prisma";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.count();
    return Response.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
