import type { NextRequest } from "next/server";
import { toPlain } from "@/lib/content/normalize";
import { demoItemCount } from "@/lib/demo-content";
import { Activity, Enquiry, getCollectionModel, HackathonRegistration, Registration } from "@/lib/models";
import { COLLECTIONS } from "@/lib/schema/resources";
import { requireAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";
import { mailConfigured } from "@/lib/server/mail";

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [workshop, workshopWeek, teams, enquiriesNew, enquiriesTotal, byCategory, recentRegs, recentEnquiries, counts, demoItems, toReview] = await Promise.all([
    Registration.countDocuments(),
    Registration.countDocuments({ createdAt: { $gte: weekAgo } }),
    HackathonRegistration.countDocuments(),
    Enquiry.countDocuments({ status: "new" }),
    Enquiry.countDocuments(),
    Registration.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$category", n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    Registration.find({}, { regId: 1, name: 1, organisation: 1, category: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(6).lean(),
    Enquiry.find({}, { type: 1, name: 1, organisation: 1, status: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(6).lean(),
    Promise.all(COLLECTIONS.map(async (c) => [c.key, await getCollectionModel(c.key).countDocuments()] as const)),
    demoItemCount(),
    user.role === "admin" ? Activity.countDocuments({ reviewed: false }) : 0,
  ]);
  return json({
    data: {
      workshop,
      workshopWeek,
      teams,
      enquiriesNew,
      enquiriesTotal,
      byCategory: byCategory.map((c) => ({ category: c._id, count: c.n })),
      recentRegs: recentRegs.map((r) => toPlain(r)),
      recentEnquiries: recentEnquiries.map((r) => toPlain(r)),
      counts: Object.fromEntries(counts),
      mail: mailConfigured(),
      demoItems,
      toReview,
    },
  });
}
