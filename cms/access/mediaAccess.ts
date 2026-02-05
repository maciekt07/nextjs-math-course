import { headers } from "next/headers";
import type { Access } from "payload";
import { auth } from "@/lib/auth/auth";
import { hasEnrollment } from "@/lib/data/enrollment";

export const mediaReadAccess: Access = async ({ req }): Promise<boolean> => {
  try {
    const url = req.pathname;

    if (req.user?.role === "admin" || req.user?.role === "editor") return true;

    const filename = url.split("/").pop();
    if (!filename) return false;

    const lessons = await req.payload.find({
      collection: "lessons",
      where: { "uploadImage.filename": { equals: filename } },
      select: { uploadImage: true, free: true, course: true },
      depth: 0,
      limit: 1,
    });

    const lesson = lessons.docs[0];
    if (!lesson) return false;

    if (lesson.free) return true;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return false;

    const courseId =
      typeof lesson.course === "string" ? lesson.course : lesson.course?.id;
    if (!courseId) return false;

    return await hasEnrollment(session.user.id, courseId);
  } catch (error) {
    console.error("Media access error:", error);
    return false;
  }
};
