import { Skeleton } from "@/components/ui/skeleton";

export const ProductDetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            {/* Header Skeleton */}
            <div className="h-16 border-b border-border mb-6">
                <div className="container mx-auto h-full flex items-center justify-between px-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Gallery */}
                    <div className="w-full lg:w-1/2 space-y-4">
                        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            <Skeleton className="aspect-square rounded-xl" />
                            <Skeleton className="aspect-square rounded-xl" />
                            <Skeleton className="aspect-square rounded-xl" />
                            <Skeleton className="aspect-square rounded-xl" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="w-full lg:w-1/2 space-y-8">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-8 w-32" />
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-6 w-20" />
                            <div className="flex gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-6 w-20" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-16 rounded-xl" />
                                <Skeleton className="h-10 w-16 rounded-xl" />
                                <Skeleton className="h-10 w-16 rounded-xl" />
                            </div>
                        </div>

                        {/* Form Skeleton */}
                        <div className="bg-card rounded-2xl border p-6 space-y-6 mt-8">
                            <div className="flex gap-4">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full rounded-md" />
                                <Skeleton className="h-10 w-full rounded-md" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-10 w-full rounded-md" />
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            </div>

                            <Skeleton className="h-14 w-full rounded-xl mt-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
