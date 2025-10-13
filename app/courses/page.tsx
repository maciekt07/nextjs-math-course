"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function CoursesPage() {
  const { data: session, isPending: loading } = authClient.useSession();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!session) {
    return <div>Please log in to view courses.</div>;
  }
  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
      <Button
        size="lg"
        variant="destructive"
        onClick={() => {
          authClient.signOut();
          router.push("/");
          toast.success("Signed out successfully");
        }}
      >
        Sign Out
      </Button>
    </div>
  );
}
