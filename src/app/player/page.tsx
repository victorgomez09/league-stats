"use client";

import { useState } from "react";
import { Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@heroui/react";

const formSchema = z
  .object({
    summonerName: z.string().min(1, {
      message: "Summoner name is required",
    }),
  });

type formType = z.infer<typeof formSchema>;

export default function PlayerPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<formType>({
    defaultValues: {
      summonerName: "",
    },
    resolver: zodResolver(formSchema),
  });


  const onSubmit = async (values: { summonerName: string }) => {
    const trimmedName = values.summonerName.trim();
    if (!trimmedName || loading) return;

    setLoading(true);

    const url = `/player/${encodeURIComponent(trimmedName)}`;
    router.push(url);
  };


  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Search Player
          </h1>
          <p className="text-default-500">
            Enter Riot ID (e.g., PlayerName#TAG) or summoner name
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="summonerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Riot ID or Summoner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: kami#BR1 ou mrkirito13#365" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={loading}
                  isDisabled={!form.formState.errors}
                  startContent={!loading ? <Search className="w-4 h-4" /> : undefined}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

      </main>
    </div >
  );
}