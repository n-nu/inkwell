import { EventBus } from '../event-bus.js';

EventBus.on('post.published', (payload) => {
  console.log('[event] post.published:', payload);
});
