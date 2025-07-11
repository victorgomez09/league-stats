"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from "lucide-react";

const formSchema = z
    .object({
        summonerName: z.string().min(1, {
            message: "Summoner name is required",
        }),
    });

export default function SummonerSearch() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            summonerName: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const trimmedName = values.summonerName.trim();
        if (!trimmedName || loading) return;

        setLoading(true);

        const url = `/summoner/${encodeURIComponent(trimmedName)}`;
        router.push(url);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Search Player</CardTitle>
                <CardDescription>Enter Riot ID (e.g., PlayerName#TAG) or summoner name</CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="summonerName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="shadcn" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={!form.formState.errors || loading}>
                            {!loading && <Search className="size-4" />}
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}