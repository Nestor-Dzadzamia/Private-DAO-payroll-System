export function Spinner({ size = 5 }: { size?: number }) {
  return (
    <span
      className={`inline-block w-${size} h-${size} border-2 border-current border-t-transparent rounded-full animate-spin`}
    />
  );
}
