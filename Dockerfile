FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY database/migrations database/migrations

RUN mvn -B -f backend/pom.xml -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --uid 10001 appuser
COPY --from=build /workspace/backend/target/milk-essentials-api-0.1.0-SNAPSHOT.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70.0", "-jar", "/app/app.jar"]
