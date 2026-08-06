# Software Architecture

# Architecture Style

Feature Based Architecture

The application follows Feature Based Architecture to keep the project scalable,
maintainable and reusable.

Each business feature owns its own components, actions, types and utilities.

---

# Technology

Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion

Backend

- Supabase

Database

- PostgreSQL

Authentication

- Supabase Auth

Storage

- Supabase Storage

---

# Routing Structure

Public Website

/

/shop

/products/[slug]

/categories/[slug]

/offers

/cart

/checkout

/search

/about

/contact

Privacy Policy

Terms & Conditions

---

Admin

/admin/login

/admin/dashboard

/admin/products

/admin/categories

/admin/orders

/admin/inventory

/admin/customers

/admin/offers

/admin/settings

---

# Folder Responsibilities

app/

Only Routing

components/

Reusable UI Components

features/

Business Logic

lib/

Framework Utilities

config/

Application Configuration

constants/

Application Constants

types/

Shared Types

hooks/

Reusable Hooks

providers/

React Providers

docs/

Project Documentation

---

# Component Rules

UI Components

Reusable only

Business Components

Feature Folder only

Never write business logic inside app/

---

# Naming Convention

Components

PascalCase

Hooks

camelCase

Folders

kebab-case

Types

PascalCase

Constants

UPPER_CASE

---

# Performance Rules

Server Components by default

Client Components only when required

Image Optimization mandatory

Lazy Loading where possible

No unnecessary re-render

---

END
