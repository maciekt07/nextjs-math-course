"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { nameSchema } from "@/lib/auth/auth-validation";
import { cn } from "@/lib/ui";

const updateNameSchema = z.object({
  name: nameSchema,
});

type UpdateNameSchema = z.infer<typeof updateNameSchema>;

const STATUS_DISPLAY_MS = 1400;

type Phase = "idle" | "loading" | "success" | "error";

export function UpdateNameForm({ name }: { name: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");

  const form = useForm<UpdateNameSchema>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: { name },
  });

  const [submittedName, setSubmittedName] = useState(name);

  const hasChanged =
    form.watch("name").trim() !== name &&
    form.watch("name").trim() !== submittedName;

  async function onSubmit(values: UpdateNameSchema) {
    setPhase("loading");

    const { error } = await authClient.updateUser({ name: values.name });

    if (error) {
      form.setError("name", { message: error.message });
      setPhase("error");
      setTimeout(() => setPhase("idle"), STATUS_DISPLAY_MS);
      return;
    }

    setSubmittedName(values.name);
    router.refresh();
    toast.success("Name updated successfully.");
    setPhase("success");
    setTimeout(() => setPhase("idle"), STATUS_DISPLAY_MS);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2!">
        <Label htmlFor="name">Name</Label>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-2">
                <FormControl>
                  <Input id="name" {...field} className="flex-1" />
                </FormControl>
                <Button
                  type="submit"
                  variant="outline"
                  className={cn(
                    "shrink-0 cursor-pointer",
                    (phase === "success" || phase === "error") &&
                      "opacity-100!",
                  )}
                  disabled={
                    !hasChanged ||
                    phase !== "idle" ||
                    !form.watch("name").trim()
                  }
                >
                  <LoadingSwap
                    isLoading={phase === "loading"}
                    isSuccess={phase === "success"}
                    isError={phase === "error"}
                  >
                    Update
                  </LoadingSwap>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs text-muted-foreground">
          This is the name displayed on your account.
        </p>
      </form>
    </Form>
  );
}
