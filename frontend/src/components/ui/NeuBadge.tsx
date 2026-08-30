const STATUS_STYLES: Record<string, string> = {
  ready: "bg-green-100 text-green-700",
  processing: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  archived: "bg-gray-100 text-gray-600",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
