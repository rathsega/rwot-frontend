// src/utils/roleRoutes.js
export function getDashboardPathByRole(roleid) {
  switch (+roleid) {
    case 1: return "/dashboard/client";        // Individual
    case 2: return "/dashboard";               // Admin: overview/dashboard
    case 3: return "/dashboard/underwriting";
    case 4: return "/dashboard/operations";
    case 5: return "/dashboard/telecallers";
    case 6: return "/dashboard/kam";
    case 7: return "/dashboard/banker";
    default: return "/dashboard";              // fallback
  }
}