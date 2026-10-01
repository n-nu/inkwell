import { EventBus } from '../event-bus.js';

let publishedPostCount = 0;

export function getPublishedPostCount() {
  return publishedPostCount;
}

EventBus.on('post.published', () => {
  publishedPostCount += 1;
});
