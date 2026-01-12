export default function Button({ text, variant = "primary" }) {
  const base =
    "px-4 py-2 rounded font-medium transition";

  const styles =
    variant === "secondary"
      ? "bg-gray-200 hover:bg-gray-300 text-black"
      : "bg-blue-600 hover:bg-blue-700 text-white";

  return <button className={`${base} ${styles}`}>{text}</button>;
}
