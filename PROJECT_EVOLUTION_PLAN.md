# Local Commerce Platform: Project Evolution Plan

This document outlines the strategic leverage and technical roadmap to transform the "FreshCart" single-vendor application into a hyperlocal, multi-vendor commerce platform for your hometown.

## 1. Vision & Strategy

**Core Value Proposition:**
- **Zero-Fee Entry:** Remove barriers for local businesses by charging 0% commission initially.
- **Smart Logistics:** Utilize existing supermarket free-delivery thresholds (>₹200) to subsidize logistics costs.
- **Hybrid Supply Chain:**
    - **Marketplace:** Connect users to local supermarkets, restaurants, and small sellers.
    - **Direct Inventory:** Platform identifies high-demand items (via data) and stocks them directly for higher margins.

**User Hierarchy:**
1.  **Main Agent (Super Admin):** Platform owner. Controls global settings, user approvals, and platform analytics.
2.  **Sub-Agent (Vendor Admin):** Store owners (Supermarkets, Restaurants). Manage their own catalog, stock, and orders.
3.  **Customer:** End-users who shop from multiple local businesses.

---

## 2. Feature Roadmap

### Phase 1: Foundation (Multi-Vendor Architecture)
*Goal: Enable multiple sellers to exist on the same platform.*

1.  **Store Entity:** Create a `Store` database model.
    *   Fields: Name, Logo, Description, Address, Contact, Type (Grocery/Restaurant), DeliveryRules (Min order for free delivery).
2.  **Product Association:** Update `Product` schema to include `storeId` reference.
    *   *Migration:* Assign all current products to a default "Main Store".
3.  **User Roles:** Update `User` schema.
    *   New Role: `vendor_admin` (Sub-Agent).
    *   Association: A `vendor_admin` is linked to a specific `Store`.

### Phase 2: Vendor Dashboard (Sub-Agent Interface)
*Goal: Give vendors tools to manage their business independently.*

1.  **Dashboard Access:** A dedicated `/vendor` route protected by `vendor_admin` role.
2.  **Stock Management:**
    *   View *their* products only.
    *   Update stock counts and prices.
3.  **Bulk Stock Update (Excel Upload):**
    *   **Feature:** "Upload Stock Sheet".
    *   **Mechanism:** Vendor downloads a template (.csv/.xlsx) -> Fills SKU & Quantity -> Uploads.
    *   **Backend:** Server parses file -> Updates database in bulk based on SKU matches.

### Phase 3: Consumer Experience
*Goal: Allow users to shop from specific local stores.*

1.  **Store Selection:** Homepage changes to a "Select Store" or "Shop by Category" (aggregating all).
2.  **Store Page:** dedicated page `/store/:storeId` listing only that store's products.
3.  **Dine-in Booking (Restaurants):**
    *   New Entity: `Reservation`.
    *   UI: Simple form on Restaurant Store page (Date, Time, Pax).
    *   Backend: Vendor Admin accepts/rejects reservation.

### Phase 4: Smart Delivery Logic
*Goal: Automate the "Free Delivery" logic.*

1.  **Cart Logic:**
    *   Validation: Can a cart contain items from multiple stores?
        *   *MVP Approach:* No. Prompt user to clear cart if switching stores.
        *   *Advanced Approach:* Yes. Split order into `SubOrders`.
2.  **Fee Calculation:**
    *   Check Store's `freeDeliveryThreshold`.
    *   If `cartTotal > threshold`, Delivery Fee = 0. Else, Standard Fee.

---

## 3. Technical Implementation Plan (Next Steps)

### Step 1: Database Schema Updates
- Create `models/Store.js`.
- Update `models/User.js` (add `storeId` field).
- Update `models/Product.js` (add `store` reference).

### Step 2: Backend API for Vendors
- **Excel Upload Endpoint:** `POST /api/vendor/inventory/upload`
    - Logic: Use `multer` for file upload and `xlsx` or `csv-parser` to read data.
    - Validation: Check if SKU belongs to the vendor's store.
- **Store-Specific Queries:** Update `getProducts` to filter by `storeId`.

### Step 3: Frontend - Vendor Dashboard
- Create `src/pages/vendor/VendorDashboard.js`.
- Implement File Upload UI for bulk updates.
- Real-time stock view.

### Step 4: Restaurant Booking System
- Create `models/Reservation.js`.
- Create API routes `POST /api/reservations`.
- Create UI for booking on the frontend.

---

## 4. "Brainstorm" & Recommendations

*   **Data-Driven Inventory:** Your idea to stock high-demand items is excellent.
    *   *Implementation:* Build a "Demand Report" in the Super Admin dashboard that ranks products by `sales_velocity` (units sold per week). Use this to decide what to buy in bulk.
*   **Trust Building:** Since you want to build trust, add a "Verified Local Seller" badge to stores on your platform.
*   **Low-Cost Marketing:** Use WhatsApp API (or simple WhatsApp links) for order updates. It's cheaper than SMS and more personal for a hometown audience.
