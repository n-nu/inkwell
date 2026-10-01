const listeners = new Map();

export const EventBus = {
  on(eventName, handler) {
    const handlers = listeners.get(eventName) ?? [];
    handlers.push(handler);
    listeners.set(eventName, handlers);
  },

  emit(eventName, payload) {
    const handlers = listeners.get(eventName) ?? [];
    for (const handler of handlers) {
      handler(payload);
    }
  },
};

export default EventBus;
