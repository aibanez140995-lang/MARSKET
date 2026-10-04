import { onRequestGet as __api_state_js_onRequestGet } from "C:\\Users\\aiban\\OneDrive\\Escritorio\\MARSKET\\functions\\api\\state.js"
import { onRequestPost as __api_state_js_onRequestPost } from "C:\\Users\\aiban\\OneDrive\\Escritorio\\MARSKET\\functions\\api\\state.js"

export const routes = [
    {
      routePath: "/api/state",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_state_js_onRequestGet],
    },
  {
      routePath: "/api/state",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_state_js_onRequestPost],
    },
  ]