type Props = {
  purchaseCost: number;
  regularPrice: number;
  salePrice: number | null;
};

export function ProductProfit({
  purchaseCost,
  regularPrice,
  salePrice,
}: Props) {
  const sellingPrice =
    salePrice ?? regularPrice;

  const profit =
    sellingPrice - purchaseCost;

  return (
    <span
      className={
        profit >= 0
          ? "font-semibold text-green-600"
          : "font-semibold text-red-600"
      }
    >
      ৳{profit.toFixed(2)}
    </span>
  );
}