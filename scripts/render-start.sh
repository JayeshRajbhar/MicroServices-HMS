#!/bin/sh
set -eu

JAVA_OPTS="${JAVA_OPTS:-}"

java $JAVA_OPTS -jar /app/eureka-server.jar &
EUREKA_PID=$!

sleep 25

java $JAVA_OPTS -jar /app/auth-service.jar &
AUTH_PID=$!
java $JAVA_OPTS -jar /app/patient.jar &
PATIENT_PID=$!
java $JAVA_OPTS -jar /app/doctor.jar &
DOCTOR_PID=$!
java $JAVA_OPTS -jar /app/staff.jar &
STAFF_PID=$!

trap 'kill "$EUREKA_PID" "$AUTH_PID" "$PATIENT_PID" "$DOCTOR_PID" "$STAFF_PID" 2>/dev/null || true' TERM INT

sleep 35

exec java $JAVA_OPTS -jar /app/api-gateway.jar
