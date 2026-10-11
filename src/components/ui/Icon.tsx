import {
  BriefcaseBusiness,
  CalendarDays,
  CodeXml,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Landmark,
  Mic,
  MonitorPlay,
  Rocket,
  Sparkles,
  Store,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Icons that organisers can pick in the admin (see iconOptions in resources.ts). */
const ICONS: Record<string, LucideIcon> = {
  mic: Mic,
  graduation: GraduationCap,
  monitor: MonitorPlay,
  store: Store,
  trophy: Trophy,
  users: Users,
  calendar: CalendarDays,
  sparkles: Sparkles,
  flask: FlaskConical,
  briefcase: BriefcaseBusiness,
  rocket: Rocket,
  code: CodeXml,
  landmark: Landmark,
  heart: HeartPulse,
};

export function CmsIcon({ name, size = 20, className }: { name?: string; size?: number; className?: string }) {
  const Icon = (name && ICONS[name]) || Sparkles;
  return <Icon size={size} className={className} aria-hidden />;
}
