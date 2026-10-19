import { onRequestPost as __api_admin_reset_js_onRequestPost } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\admin\\reset.js"
import { onRequestDelete as __api_catalog_update_js_onRequestDelete } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\catalog\\update.js"
import { onRequestPatch as __api_catalog_update_js_onRequestPatch } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\catalog\\update.js"
import { onRequestPost as __api_catalog_update_js_onRequestPost } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\catalog\\update.js"
import { onRequestPost as __api_moderation_report_js_onRequestPost } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\moderation\\report.js"
import { onRequest as __api_admin_reset_js_onRequest } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\admin\\reset.js"
import { onRequest as __api_catalog_update_js_onRequest } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\catalog\\update.js"
import { onRequest as __api_moderation_report_js_onRequest } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\moderation\\report.js"
import { onRequestDelete as __api_catalog__id__js_onRequestDelete } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\catalog\\[id].js"
import { onRequestPatch as __api_catalog__id__js_onRequestPatch } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\catalog\\[id].js"
import { onRequest as __api_catalog__id__js_onRequest } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\catalog\\[id].js"
import { onRequest as __api_state_js_onRequest } from "C:\\Users\\aiban\\OneDrive\\MARSKET\\functions\\api\\state.js"

export const routes = [
    {
      routePath: "/api/admin/reset",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_reset_js_onRequestPost],
    },
  {
      routePath: "/api/catalog/update",
      mountPath: "/api/catalog",
      method: "DELETE",
      middlewares: [],
      modules: [__api_catalog_update_js_onRequestDelete],
    },
  {
      routePath: "/api/catalog/update",
      mountPath: "/api/catalog",
      method: "PATCH",
      middlewares: [],
      modules: [__api_catalog_update_js_onRequestPatch],
    },
  {
      routePath: "/api/catalog/update",
      mountPath: "/api/catalog",
      method: "POST",
      middlewares: [],
      modules: [__api_catalog_update_js_onRequestPost],
    },
  {
      routePath: "/api/moderation/report",
      mountPath: "/api/moderation",
      method: "POST",
      middlewares: [],
      modules: [__api_moderation_report_js_onRequestPost],
    },
  {
      routePath: "/api/admin/reset",
      mountPath: "/api/admin",
      method: "",
      middlewares: [],
      modules: [__api_admin_reset_js_onRequest],
    },
  {
      routePath: "/api/catalog/update",
      mountPath: "/api/catalog",
      method: "",
      middlewares: [],
      modules: [__api_catalog_update_js_onRequest],
    },
  {
      routePath: "/api/moderation/report",
      mountPath: "/api/moderation",
      method: "",
      middlewares: [],
      modules: [__api_moderation_report_js_onRequest],
    },
  {
      routePath: "/api/catalog/:id",
      mountPath: "/api/catalog",
      method: "DELETE",
      middlewares: [],
      modules: [__api_catalog__id__js_onRequestDelete],
    },
  {
      routePath: "/api/catalog/:id",
      mountPath: "/api/catalog",
      method: "PATCH",
      middlewares: [],
      modules: [__api_catalog__id__js_onRequestPatch],
    },
  {
      routePath: "/api/catalog/:id",
      mountPath: "/api/catalog",
      method: "",
      middlewares: [],
      modules: [__api_catalog__id__js_onRequest],
    },
  {
      routePath: "/api/state",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_state_js_onRequest],
    },
  ]