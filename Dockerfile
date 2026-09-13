# =========================================================
# Stage 1: Build Frontend (Vite + React + Tailwind)
# =========================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# =========================================================
# Stage 2: Build Spring Boot Backend (Java 21 + Maven)
# =========================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app

COPY backend/pom.xml ./backend/pom.xml
COPY backend/src ./backend/src

# Copy built frontend into Spring Boot static resources
RUN mkdir -p backend/src/main/resources/static
COPY --from=frontend-builder /app/dist/ ./backend/src/main/resources/static/

RUN mvn -f backend/pom.xml clean package -DskipTests -B

# =========================================================
# Stage 3: Minimal Production Runtime Container
# =========================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install procps (ps command) and curl for diagnostics & healthchecks
RUN apk add --no-cache procps bash curl

COPY --from=backend-builder /app/backend/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
