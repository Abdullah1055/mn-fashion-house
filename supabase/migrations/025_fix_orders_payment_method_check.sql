/*
=========================================================
025 - FIX ORDERS PAYMENT METHOD CHECK
=========================================================

Purpose:
- Remove outdated payment_method constraint
- Recreate the constraint according to the
  current orders schema
=========================================================
*/

alter table public.orders
drop constraint if exists orders_payment_method_check;


alter table public.orders
add constraint orders_payment_method_check
check (
    payment_method in (
        'cash_on_delivery',
        'online',
        'bank_transfer'
    )
);