import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserDocument } from "@/lib/services/firestore";
import { AppShell } from "@/components/layout/app-shell";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user || !user.uid) {
    redirect("/login");
  }

  const profile = await getUserDocument(user.uid);
  const userName = profile?.fullName || user.name || "Store Owner";

  return (
    <AppShell
      user={{
        name: userName,
        email: user.email,
      }}
    >
      {children}
    </AppShell>
  );
}
