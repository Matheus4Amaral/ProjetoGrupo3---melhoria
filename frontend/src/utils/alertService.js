let handlers = null;

export const alertService = {
  _register(impl) {
    handlers = impl;
  },

  show(message, type = "info") {
    if (!handlers) {
      console.warn("AlertProvider ainda não foi montado.")
      return
    }
    handlers.show(message, type);
  },

  confirm(message) {
    if (!handlers) {
      console.warn("AlertProvider ainda não foi montado.")
      return Promise.resolve(false)
    }
    return handlers.confirm(message)
  },
}
