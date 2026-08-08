import type { InventoryLog } from "@/lib/services/inventory.service";

type InventoryHistoryProps = {
  logs: InventoryLog[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleString(
    "en-BD",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export function InventoryHistory({
  logs,
}: InventoryHistoryProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b px-6 py-5">
        <h2 className="text-lg font-semibold">
          Inventory History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-6 py-4 text-left">
                Date
              </th>

              <th className="px-6 py-4 text-center">
                Type
              </th>

              <th className="px-6 py-4 text-right">
                Change
              </th>

              <th className="px-6 py-4 text-right">
                Before
              </th>

              <th className="px-6 py-4 text-right">
                After
              </th>

              <th className="px-6 py-4 text-left">
                Reason
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => {
              const isIn =
                log.movement_type === "in";

              return (
                <tr
                  key={log.id}
                  className="border-t"
                >
                  <td className="px-6 py-4 text-sm">
                    {formatDate(
                      log.created_at
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isIn
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isIn
                        ? "Stock IN"
                        : "Stock OUT"}
                    </span>
                  </td>

                  <td
                    className={`px-6 py-4 text-right font-semibold ${
                      isIn
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {isIn ? "+" : ""}
                    {log.quantity_change}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {log.stock_before}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    {log.stock_after}
                  </td>

                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {log.reason || "-"}
                  </td>
                </tr>
              );
            })}

            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  No inventory movements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}