import mongoose, { Schema, type Model, type SchemaDefinition } from "mongoose";
import { ACTIVITY_ACTIONS, type ActivityAction, type ActivityChange } from "@/lib/activity";
import type { Role } from "@/lib/permissions";
import type { FieldDef } from "@/lib/schema/fields";
import { COLLECTION_MAP, COLLECTIONS } from "@/lib/schema/resources";

/* ---------------------------------------------------------------------------
   Content collections: schemas are generated from the admin field
   definitions so the CMS form, validation and storage never drift apart.
   ------------------------------------------------------------------------- */

function schemaFromFields(fields: FieldDef[]): SchemaDefinition {
  const def: SchemaDefinition = {};
  for (const f of fields) {
    switch (f.type) {
      case "number":
        def[f.name] = { type: Number, default: null };
        break;
      case "boolean":
        def[f.name] = { type: Boolean, default: false };
        break;
      case "multiselect":
      case "stringList":
        def[f.name] = { type: [String], default: [] };
        break;
      case "objectList":
        def[f.name] = { type: [Schema.Types.Mixed], default: [] };
        break;
      case "group":
        def[f.name] = { type: Schema.Types.Mixed, default: {} };
        break;
      case "ref":
        def[f.name] = { type: Schema.Types.ObjectId, ref: COLLECTION_MAP[f.resource]?.model, default: null };
        break;
      case "refList":
        def[f.name] = { type: [{ type: Schema.Types.ObjectId, ref: COLLECTION_MAP[f.resource]?.model }], default: [] };
        break;
      default:
        def[f.name] = { type: String, default: "", trim: true };
    }
  }
  return def;
}

const collectionModels: Record<string, Model<Record<string, unknown>>> = {};
for (const c of COLLECTIONS) {
  const schema = new Schema(schemaFromFields(c.fields), { timestamps: true, minimize: false });
  if (c.slugFrom) schema.index({ slug: 1 });
  schema.index({ published: 1, order: 1 });
  collectionModels[c.key] =
    (mongoose.models[c.model] as Model<Record<string, unknown>>) ?? mongoose.model<Record<string, unknown>>(c.model, schema);
}

export function getCollectionModel(key: string): Model<Record<string, unknown>> {
  const m = collectionModels[key];
  if (!m) throw new Error(`Unknown collection: ${key}`);
  return m;
}

/* ------------------------------------------------------------ Singletons -- */

export interface SingletonDoc {
  key: string;
  data: Record<string, unknown>;
  updatedAt?: Date;
}
const singletonSchema = new Schema<SingletonDoc>(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);
export const Singleton = (mongoose.models.Singleton as Model<SingletonDoc>) ?? mongoose.model<SingletonDoc>("Singleton", singletonSchema);

/* --------------------------------------------------------- Registrations -- */

export interface RegistrationDoc {
  regId: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  designation: string;
  category: string;
  city: string;
  country: string;
  interests: string[];
  tutorials: boolean;
  hackathonInterest: boolean;
  dietary: string;
  accessibility: string;
  heardFrom: string;
  message: string;
  consent: boolean;
  status: "registered" | "confirmed" | "waitlisted" | "cancelled";
  emailSent: boolean;
  notes: string;
  createdAt?: Date;
}
const registrationSchema = new Schema<RegistrationDoc>(
  {
    regId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    phone: { type: String, default: "" },
    organisation: { type: String, default: "" },
    designation: { type: String, default: "" },
    category: { type: String, default: "other" },
    city: { type: String, default: "" },
    country: { type: String, default: "India" },
    interests: { type: [String], default: [] },
    tutorials: { type: Boolean, default: false },
    hackathonInterest: { type: Boolean, default: false },
    dietary: { type: String, default: "" },
    accessibility: { type: String, default: "" },
    heardFrom: { type: String, default: "" },
    message: { type: String, default: "" },
    consent: { type: Boolean, default: false },
    status: { type: String, enum: ["registered", "confirmed", "waitlisted", "cancelled"], default: "registered" },
    emailSent: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);
export const Registration =
  (mongoose.models.Registration as Model<RegistrationDoc>) ?? mongoose.model<RegistrationDoc>("Registration", registrationSchema);

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  role: string;
}
export interface HackathonRegistrationDoc {
  regId: string;
  teamName: string;
  teamKey: string;
  track: string;
  members: TeamMember[];
  leaderEmail: string;
  ideaTitle: string;
  ideaSummary: string;
  githubUrl: string;
  consent: boolean;
  status: "registered" | "shortlisted" | "not-shortlisted" | "withdrawn";
  emailSent: boolean;
  notes: string;
  createdAt?: Date;
}
const hackathonRegistrationSchema = new Schema<HackathonRegistrationDoc>(
  {
    regId: { type: String, required: true, unique: true },
    teamName: { type: String, required: true, trim: true },
    teamKey: { type: String, required: true, unique: true },
    track: { type: String, default: "" },
    members: {
      type: [
        new Schema<TeamMember>(
          {
            name: { type: String, required: true },
            email: { type: String, required: true, lowercase: true },
            phone: { type: String, default: "" },
            organisation: { type: String, default: "" },
            role: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    leaderEmail: { type: String, required: true, lowercase: true, index: true },
    ideaTitle: { type: String, default: "" },
    ideaSummary: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    consent: { type: Boolean, default: false },
    status: { type: String, enum: ["registered", "shortlisted", "not-shortlisted", "withdrawn"], default: "registered" },
    emailSent: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);
export const HackathonRegistration =
  (mongoose.models.HackathonRegistration as Model<HackathonRegistrationDoc>) ??
  mongoose.model<HackathonRegistrationDoc>("HackathonRegistration", hackathonRegistrationSchema);

/* ------------------------------------------------------------- Enquiries -- */

export interface EnquiryDoc {
  type: "contact" | "exhibitor" | "sponsor";
  name: string;
  email: string;
  organisation: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "closed";
  notes: string;
  createdAt?: Date;
}
const enquirySchema = new Schema<EnquiryDoc>(
  {
    type: { type: String, enum: ["contact", "exhibitor", "sponsor"], default: "contact", index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    organisation: { type: String, default: "" },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "in-progress", "closed"], default: "new" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);
export const Enquiry = (mongoose.models.Enquiry as Model<EnquiryDoc>) ?? mongoose.model<EnquiryDoc>("Enquiry", enquirySchema);

/* ----------------------------------------------------------------- Users -- */

export interface UserDoc {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  /** Volunteers only: what they are responsible for, and what they may do (src/lib/permissions.ts). */
  responsibility: string;
  permissions: string[];
  active: boolean;
  lastLoginAt: Date | null;
  createdAt?: Date;
}
const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor", "volunteer"], default: "editor" },
    responsibility: { type: String, default: "" },
    permissions: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);
export const User = (mongoose.models.User as Model<UserDoc>) ?? mongoose.model<UserDoc>("User", userSchema);

/* -------------------------------------------------------------- Sessions -- */

/**
 * A signed-in browser. The session cookie (a signed JWT) names one of these by
 * its random id: signing out deletes it, and a password change, a disabled or
 * deleted account deletes the account's others, so a copied cookie stops
 * working at once. Expired ones are removed by MongoDB (TTL index).
 */
export interface SessionDoc {
  _id: string;
  userId: mongoose.Types.ObjectId;
  userAgent: string;
  lastSeenAt: Date;
  expiresAt: Date;
  createdAt?: Date;
}
const sessionSchema = new Schema<SessionDoc>(
  {
    _id: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userAgent: { type: String, default: "" },
    lastSeenAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true },
  },
  // Not "Session"/"sessions": that is the programme's sessions (talks).
  { timestamps: { createdAt: true, updatedAt: false }, collection: "admin_sessions" },
);
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AdminSession = (mongoose.models.AdminSession as Model<SessionDoc>) ?? mongoose.model<SessionDoc>("AdminSession", sessionSchema);

/* -------------------------------------------------------------- Activity -- */

/** What a volunteer did, for the task tracker. Name and e-mail are copied so entries outlive the account. */
export interface ActivityDoc {
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorEmail: string;
  action: ActivityAction;
  area: string;
  target: string;
  targetId: string;
  changes: ActivityChange[];
  reviewed: boolean;
  reviewedBy: string;
  reviewedAt: Date | null;
  createdAt?: Date;
}
const activitySchema = new Schema<ActivityDoc>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, default: "" },
    actorEmail: { type: String, default: "" },
    action: { type: String, enum: ACTIVITY_ACTIONS, required: true },
    area: { type: String, required: true },
    target: { type: String, default: "" },
    targetId: { type: String, default: "" },
    changes: {
      type: [new Schema<ActivityChange>({ field: { type: String, required: true }, from: { type: String, default: "" }, to: { type: String, default: "" } }, { _id: false })],
      default: [],
    },
    reviewed: { type: Boolean, default: false },
    reviewedBy: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
activitySchema.index({ actorId: 1, _id: -1 });
activitySchema.index({ reviewed: 1, _id: -1 });
export const Activity = (mongoose.models.Activity as Model<ActivityDoc>) ?? mongoose.model<ActivityDoc>("Activity", activitySchema);

/* ----------------------------------------------------------------- Media -- */

export function mediaBucket() {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database not connected");
  return new mongoose.mongo.GridFSBucket(db, { bucketName: "media" });
}
