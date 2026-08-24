export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const pathname = url.pathname.includes('.') ? url.pathname : '/index.html'

    return env.ASSETS.fetch(new Request(new URL(pathname, request.url), request))
  },
}
