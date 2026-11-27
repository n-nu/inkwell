import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:3300";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 300 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  const response = http.get(`${baseUrl}/api/posts?page=1`, {
    timeout: "10s",
  });

  check(response, {
    "posts returned HTTP 200": (result) => result.status === 200,
  });
  sleep(1);
}

export function setup() {
  const warmup = http.get(`${baseUrl}/api/health`, { timeout: "120s" });
  if (warmup.status !== 200) {
    throw new Error(`Warm-up failed with HTTP ${warmup.status}`);
  }
}
