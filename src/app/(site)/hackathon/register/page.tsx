import { redirect } from "next/navigation";

/** Teams now register in the Registration section of the Hackathon page; old links land there. */
export default function HackathonRegisterPage() {
  redirect("/hackathon#register");
}
