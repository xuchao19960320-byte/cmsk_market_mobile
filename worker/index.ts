import { handleApi } from './api';
interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}
interface Env {
  ASSETS: AssetsBinding;
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) return handleApi(request);
    return env.ASSETS.fetch(request);
  },
};
