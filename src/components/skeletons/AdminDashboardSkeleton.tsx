import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";

export const AdminDashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-hero">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Skeleton className="h-8 w-32" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>

                <div className="bg-card rounded-xl shadow-card p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-9 w-24" />
                    </div>

                    {/* List Items */}
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="border border-border rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-60" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <Skeleton className="h-6 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-20 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
