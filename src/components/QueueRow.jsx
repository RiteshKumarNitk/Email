import { useEffect, useRef } from "react"
import Button from "./Button"

export default function QueueRow({
  row,
  isSelected,
  isActive,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
}) {
  const rowRef = useRef(null)

  /* 🔥 Active row scroll into view (UX polish) */
  useEffect(() => {
    if (isActive && rowRef.current) {
      rowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [isActive])

  return (
    <tr
      ref={rowRef}
      onClick={() => onSelect(row._id)}
      className={`
        border-t cursor-pointer transition
        ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}
      `}
    >
      {/* CHECKBOX + ACTIVE DOT */}
      <td className="p-2 relative">
        {/* Active pulse dot */}
        {isActive && (
          <span className="absolute left-1 top-1/2 -translate-y-1/2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
            </span>
          </span>
        )}

        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(row._id)}
          onClick={(e) => e.stopPropagation()}
          className="ml-3"
        />
      </td>

      {/* EMAIL */}
      <td className="p-2">
        <div className="font-medium text-sm">{row.email}</div>
      </td>

      {/* SUBJECT */}
      <td className="p-2 text-sm">
        {row.subject || <span className="text-gray-400">—</span>}
      </td>

      {/* STATUS */}
      <td className="p-2 text-xs">
        <span
          className={`
            px-2 py-1 rounded-full
            ${
              row.status === "DRAFT"
                ? "bg-yellow-100 text-yellow-700"
                : row.status === "SENT"
                ? "bg-green-100 text-green-700"
                : row.status === "FAILED"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }
          `}
        >
          {row.status}
        </span>
      </td>

      {/* SOURCE */}
      <td className="p-2 text-xs">
        {row.source === "csv" ? "📄 CSV" : "✍️ Manual"}
      </td>

      {/* ACTIONS */}
      <td
        className="p-2 text-right space-x-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="sm"
          text="Preview"
          onClick={onPreview}
        />
        <Button
          size="sm"
          text="Edit"
          onClick={onEdit}
        />
        <Button
          size="sm"
          variant="secondary"
          text="Delete"
          onClick={onDelete}
        />
      </td>
    </tr>
  )
}
