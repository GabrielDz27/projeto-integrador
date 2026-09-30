# Estágio de Build e Runtime Java
FROM eclipse-temurin:17-jdk-alpine
LABEL authors="gabriel"

WORKDIR /app

# Copia o arquivo .jar gerado no build para dentro do container
COPY target/*.jar app.jar

# Define a porta padrão exposta
EXPOSE 8081

# Executa a aplicação Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]