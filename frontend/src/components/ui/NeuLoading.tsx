export function NeuLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-sm text-gray-500">
      {label}
    </div>
  );
}
