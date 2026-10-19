export { onRequestPatch, onRequestDelete } from './[id].js';
import { onRequestPatch, onRequestDelete } from './[id].js';

export const onRequestPost = onRequestPatch;

export async function onRequest(context) {
  if (context.request.method === 'DELETE') return onRequestDelete(context);
  return onRequestPatch(context);
}
