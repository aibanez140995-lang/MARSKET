import { onRequestGet as __API_state_js_onRequestGet } from "C:\\Users\\aiban\\OneDrive\\Escritorio\\MARSKET\\functions\\API\\state.js"
import { onRequestPost as __API_state_js_onRequestPost } from "C:\\Users\\aiban\\OneDrive\\Escritorio\\MARSKET\\functions\\API\\state.js"

export const routes = [
    {
      routePath: "/API/state",
      mountPath: "/API",
      method: "GET",
      middlewares: [],
      modules: [__API_state_js_onRequestGet],
    },
  {
      routePath: "/API/state",
      mountPath: "/API",
      method: "POST",
      middlewares: [],
      modules: [__API_state_js_onRequestPost],
    },
  ]