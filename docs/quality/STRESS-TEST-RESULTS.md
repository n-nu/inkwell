# k6 Stress-Test Results

## Status

No hosted stress test was executed during the repository implementation.
The staging and production cloud resources and authorized test target could
not be verified from the local environment.

## Configuration

- Script: `load-tests/feed-stress.k6.js`
- Traffic stages:
  - 30 seconds at 20 virtual users
  - 30 seconds at 100 virtual users
  - 30 seconds at 300 virtual users
  - 30 seconds at 0 virtual users
- Target: staging or an isolated local environment only
- Production targets are prohibited

## Results

No environment, date, response-time data, error-rate data, bottleneck, or
approximate capacity limit has been fabricated.

## Required safe execution

Run the staged script only after confirming the target is isolated or staging,
and never run it against production. Because staging and production may share
the same PostgreSQL database, first confirm database isolation or use the local
Docker Compose stack. Shared-database stress can affect production data and
service availability.
