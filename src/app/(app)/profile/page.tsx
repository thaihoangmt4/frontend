import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile";

export const metadata: Metadata = {
  title: "Your profile — AI English Learning Platform",
};

export default function ProfileRoute() {
  return <ProfilePage />;
}
