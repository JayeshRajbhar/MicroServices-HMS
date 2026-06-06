FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY eureka-server/pom.xml eureka-server/pom.xml
COPY auth-service/pom.xml auth-service/pom.xml
COPY patient/pom.xml patient/pom.xml
COPY doctor/pom.xml doctor/pom.xml
COPY staff/pom.xml staff/pom.xml
COPY api-gateway/pom.xml api-gateway/pom.xml

COPY eureka-server/src eureka-server/src
COPY auth-service/src auth-service/src
COPY patient/src patient/src
COPY doctor/src doctor/src
COPY staff/src staff/src
COPY api-gateway/src api-gateway/src

RUN mvn -B -f eureka-server/pom.xml -DskipTests package \
    && mvn -B -f auth-service/pom.xml -DskipTests package \
    && mvn -B -f patient/pom.xml -DskipTests package \
    && mvn -B -f doctor/pom.xml -DskipTests package \
    && mvn -B -f staff/pom.xml -DskipTests package \
    && mvn -B -f api-gateway/pom.xml -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/eureka-server/target/*.jar /app/eureka-server.jar
COPY --from=build /workspace/auth-service/target/*.jar /app/auth-service.jar
COPY --from=build /workspace/patient/target/*.jar /app/patient.jar
COPY --from=build /workspace/doctor/target/*.jar /app/doctor.jar
COPY --from=build /workspace/staff/target/*.jar /app/staff.jar
COPY --from=build /workspace/api-gateway/target/*.jar /app/api-gateway.jar
COPY scripts/render-start.sh /app/render-start.sh

RUN sed -i 's/\r$//' /app/render-start.sh && chmod +x /app/render-start.sh

ENV EUREKA_HOST=localhost
ENV EUREKA_PORT=8761
ENV AUTH_PORT=8084
ENV PATIENT_PORT=8081
ENV DOCTOR_PORT=8082
ENV STAFF_PORT=8083
ENV GATEWAY_PORT=10000

EXPOSE 10000

CMD ["sh", "/app/render-start.sh"]
