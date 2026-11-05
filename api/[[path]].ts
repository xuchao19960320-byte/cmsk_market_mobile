import { handleApi } from '../../worker/api';

export function onRequest(context: { request: Request }): Response {
  return handleApi(context.request);
}
