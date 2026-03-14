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
import { signUpSchema } from "@/lib/auth/auth-validation";

const updateNameSchema = z.object({
  name: signUpSchema.shape.name,
});

type UpdateNameSchema = z.infer<typeof updateNameSchema>;

export function UpdateNameForm({ name }: { name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateNameSchema>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: { name },
  });

  const hasChanged = form.watch("name").trim() !== name;

  async function onSubmit(values: UpdateNameSchema) {
    setLoading(true);

    const { error } = await authClient.updateUser({ name: values.name });

    if (error) {
      if (error.status === 429) return;
      // toast.error(error.message ?? "Failed to update name.");
      form.setError("name", {
        message: error.message,
      });
      setLoading(false);
      return;
    }

    router.refresh();
    toast.success("Name updated successfully.");
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                  className="shrink-0"
                  disabled={!hasChanged || loading}
                >
                  <LoadingSwap isLoading={loading}>Update</LoadingSwap>
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
