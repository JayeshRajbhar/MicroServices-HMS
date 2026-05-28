#!/usr/bin/env bash
set -euo pipefail

# start-backend.sh
# Start Eureka -> Gateway -> Auth -> Patient -> Doctor -> Staff in sequence
# Usage: ./scripts/start-backend.sh [path-to-env-file]

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

# Default service directories (override by editing variables below or by providing env file)
EUREKA_DIR="eureka-server"
GATEWAY_DIR="api-gateway"
AUTH_DIR="auth-service"
PATIENT_DIR="patient"
DOCTOR_DIR="doctor"
STAFF_DIR="staff"

# Default ports (match project configs)
EUREKA_PORT=${EUREKA_PORT:-8761}
GATEWAY_PORT=${GATEWAY_PORT:-8080}
AUTH_PORT=${AUTH_PORT:-8084}
PATIENT_PORT=${PATIENT_PORT:-8081}
DOCTOR_PORT=${DOCTOR_PORT:-8082}
STAFF_PORT=${STAFF_PORT:-8083}
EUREKA_HOST=${EUREKA_HOST:-localhost}

# Timeouts
WAIT_TIMEOUT=${WAIT_TIMEOUT:-120}
POLL_INTERVAL=${POLL_INTERVAL:-2}

# Optional .env file to export variables (e.g., JWT_SECRET, DB_PASSWORD)
if [ "$#" -ge 1 ]; then
  ENV_FILE="$1"
  if [ -f "$ENV_FILE" ]; then
    echo "Sourcing env file: $ENV_FILE"
    # shellcheck disable=SC1090
    source "$ENV_FILE"
  else
    echo "Env file not found: $ENV_FILE" >&2
    exit 1
  fi
fi

# Re-apply defaults after sourcing and export to child Spring processes.
EUREKA_PORT=${EUREKA_PORT:-8761}
GATEWAY_PORT=${GATEWAY_PORT:-8080}
AUTH_PORT=${AUTH_PORT:-8084}
PATIENT_PORT=${PATIENT_PORT:-8081}
DOCTOR_PORT=${DOCTOR_PORT:-8082}
STAFF_PORT=${STAFF_PORT:-8083}
EUREKA_HOST=${EUREKA_HOST:-localhost}
export EUREKA_PORT GATEWAY_PORT AUTH_PORT PATIENT_PORT DOCTOR_PORT STAFF_PORT EUREKA_HOST

# Helper: choose mvnw if present, else mvn
choose_mvn_cmd() {
  local dir="$1"
  if [ -x "$dir/mvnw" ]; then
    echo "$dir/mvnw"
  elif command -v mvn >/dev/null 2>&1; then
    echo "mvn -f $dir/pom.xml"
  else
    echo "mvnw_not_found"
  fi
}

# Helper: wait for HTTP health endpoint to return status UP
wait_for_health() {
  local url="$1"
  local name="$2"
  local start_ts now_ts elapsed
  start_ts=$(date +%s)
  echo "Waiting for $name at $url (timeout ${WAIT_TIMEOUT}s)"
  while true; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$name is available"
      return 0
    fi
    now_ts=$(date +%s)
    elapsed=$((now_ts - start_ts))
    if [ "$elapsed" -ge "$WAIT_TIMEOUT" ]; then
      echo "Timed out waiting for $name" >&2
      return 1
    fi
    sleep "$POLL_INTERVAL"
  done
}

# Helper: return success when a TCP port is currently listening
is_port_listening() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$port" 2>/dev/null | grep -qE "[\.:]$port([[:space:]]|$)"
    return $?
  fi
  if command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | grep -qE "[\.:]$port[[:space:]].*(LISTEN|LISTENING)"
    return $?
  fi
  return 1
}

assert_port_free() {
  local name="$1"
  local port="$2"
  if is_port_listening "$port"; then
    echo "Port conflict: $name needs port $port, but it is already in use." >&2
    echo "Stop the process on port $port before starting backend services." >&2
    exit 1
  fi
  echo "Port check OK: $name -> $port"
}

# Helper: run a Spring Boot app (uses mvnw if available) and redirect logs
run_service() {
  local dir="$1"
  local name="$2"
  local logfile="$LOG_DIR/${name}.log"

  local cmd
  cmd=$(choose_mvn_cmd "$ROOT_DIR/$dir")
  if [ "$cmd" = "mvnw_not_found" ]; then
    echo "No mvnw and mvn not available for $name (dir $dir)" >&2
    return 1
  fi

  echo "Starting $name (dir=$dir) -> logs: $logfile"
  if [[ "$cmd" == */mvnw ]]; then
    (cd "$ROOT_DIR/$dir" && nohup ./mvnw spring-boot:run >"$logfile" 2>&1 &) 
  else
    (cd "$ROOT_DIR/$dir" && nohup mvn -f pom.xml spring-boot:run >"$logfile" 2>&1 &)
  fi
  sleep 1
}

# Start sequence
echo "Validating required ports..."
assert_port_free "Eureka" "$EUREKA_PORT"
assert_port_free "API Gateway" "$GATEWAY_PORT"
assert_port_free "Auth Service" "$AUTH_PORT"
assert_port_free "Patient Service" "$PATIENT_PORT"
assert_port_free "Doctor Service" "$DOCTOR_PORT"
assert_port_free "Staff Service" "$STAFF_PORT"

# 1) Eureka
run_service "$EUREKA_DIR" "eureka"
wait_for_health "http://localhost:${EUREKA_PORT}/actuator/health" "Eureka" || exit 1

# 2) API Gateway
run_service "$GATEWAY_DIR" "api-gateway"
wait_for_health "http://localhost:${GATEWAY_PORT}/actuator/health" "API Gateway" || exit 1

# 3) Auth service
run_service "$AUTH_DIR" "auth-service"
wait_for_health "http://localhost:${AUTH_PORT}/actuator/health" "Auth Service" || exit 1

# 4) Backends (patient, doctor, staff)
run_service "$PATIENT_DIR" "patient"
wait_for_health "http://localhost:${PATIENT_PORT}/actuator/health" "Patient Service" || exit 1

run_service "$DOCTOR_DIR" "doctor"
wait_for_health "http://localhost:${DOCTOR_PORT}/actuator/health" "Doctor Service" || exit 1

run_service "$STAFF_DIR" "staff"
wait_for_health "http://localhost:${STAFF_PORT}/actuator/health" "Staff Service" || exit 1

cat <<'SUMMARY'
All backend services started (background). Logs are in the 'logs' directory.
To stop services, find JVM PIDs (e.g. `ps aux | grep java`) and kill them, or use your IDE to stop.
SUMMARY

exit 0
