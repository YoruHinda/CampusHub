# ---------- Estágio 1: build ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cacheia as dependências (só refaz se o pom.xml mudar)
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Estágio 2: runtime ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]