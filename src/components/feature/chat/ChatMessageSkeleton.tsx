import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  count: number;
};

export default function ChatMessageSkeleton({ count }: Props) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => {
        return (
          <div key={`${idx}`} className="flex items-start gap-3 p-3">
            <div className="w-fit shrink-0 flex flex-col">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex-grow">
              <Skeleton className="h-5 w-28 mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
