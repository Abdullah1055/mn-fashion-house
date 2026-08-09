"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CartItem,
  CartState,
} from "@/types/cart";

type AddToCartInput = Omit<
  CartItem,
  "quantity"
> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (
    item: AddToCartInput
  ) => void;
  updateQuantity: (
    key: string,
    quantity: number
  ) => void;
  removeFromCart: (
    key: string
  ) => void;
  clearCart: () => void;
};

const CartContext =
  createContext<CartContextValue | null>(
    null
  );

const STORAGE_KEY =
  "mn-fashion-house-cart";

function getItemKey(item: {
  productId: string;
  variantId: string | null;
}) {
  return `${item.productId}:${item.variantId ?? "default"}`;
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (stored) {
        const parsed: CartState =
          JSON.parse(stored);

        if (
          parsed &&
          Array.isArray(parsed.items)
        ) {
          setItems(parsed.items);
        }
      }
    } catch {
      window.localStorage.removeItem(
        STORAGE_KEY
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const state: CartState = {
      items,
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  }, [items, hydrated]);

  function addToCart(
    input: AddToCartInput
  ) {
    const quantity =
      input.quantity ?? 1;

    const key = getItemKey(input);

    setItems((currentItems) => {
      const existingIndex =
        currentItems.findIndex(
          (item) =>
            getItemKey(item) === key
        );

      if (existingIndex === -1) {
        return [
          ...currentItems,
          {
            ...input,
            quantity,
          },
        ];
      }

      const updated = [
        ...currentItems,
      ];

      const existing =
        updated[existingIndex];

      updated[existingIndex] = {
        ...existing,
        quantity:
          existing.quantity +
          quantity,
      };

      return updated;
    });
  }

  function updateQuantity(
    key: string,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        getItemKey(item) === key
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function removeFromCart(
    key: string
  ) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          getItemKey(item) !== key
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.price *
            item.quantity,
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
}