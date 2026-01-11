import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden h-full flex flex-col">
            <Skeleton className="aspect-[3/4] w-full bg-muted" />
            <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <div className="mt-auto pt-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
};
