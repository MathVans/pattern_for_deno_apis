# Mini Tutorial: Docker e Docker Compose para o Projeto Deno API

Este tutorial simplificado mostra como trabalhar com Docker e Docker Compose em seu projeto Deno API.

## 1. Construindo a Imagem Docker

Para construir a imagem Docker do seu projeto:

```bash
# Navegue até a pasta do projeto
cd pattern_for_deno_apis

# Construa a imagem usando o deno.dockerfile
docker build -t mathvans/pattern-deno-api:latest -f deno.dockerfile .
```

## 2. Gerenciando Versões com Tags

Para manter um histórico de versões:

```bash
# Construir versão específica
docker build -t mathvans/pattern-deno-api:v1.0 -f deno.dockerfile .

# Também atualizar a tag "latest"
docker tag mathvans/pattern-deno-api:v1.0 mathvans/pattern-deno-api:latest

# Verificar suas imagens locais
docker images | grep pattern-deno-api
```

## 3. Configurando Docker Compose

Modifique seu docker-compose.yml para incluir tanto o banco de dados quanto a aplicação Deno:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: deno_api_postgres
    environment:
      POSTGRES_USER: deno_user
      POSTGRES_PASSWORD: deno_password
      POSTGRES_DB: deno_api_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - deno_api_network

  mongodb:
    image: mongo:latest
    container_name: deno_api_mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: deno_user
      MONGO_INITDB_ROOT_PASSWORD: deno_password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - deno_api_network
      
  # Adicione a aplicação Deno
  deno_api:
    image: mathvans/pattern-deno-api:latest
    container_name: deno_api_app
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - DATABASE_URL=postgres://deno_user:deno_password@postgres:5432/deno_api_db
      - MONGODB_URI=mongodb://deno_user:deno_password@mongodb:27017
      - MONGODB_DB_NAME=deno_api_db
      - NODE_ENV=development
      - AZURE_TENANT_ID=${AZURE_TENANT_ID}
      - AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
      - AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET}
      - FRONTEND_REDIRECT_URI=${FRONTEND_REDIRECT_URI}
    depends_on:
      - postgres
      - mongodb
    networks:
      - deno_api_network

volumes:
  postgres_data:
  mongodb_data:
  deno_cache

networks:
  deno_api_network:
    driver: bridge
```

## 4. Executando com Docker Compose

```bash
# Iniciar apenas os bancos de dados (como seu readme já sugere)
docker-compose up -d postgres mongodb

# Iniciar toda a stack, incluindo a aplicação Deno
docker-compose up -d

# Ver logs da aplicação
docker-compose logs -f deno_api

# Parar todos os serviços
docker-compose down
```

## 5. Script para Automatizar o Processo de Build

Crie um arquivo `update-docker.sh` para facilitar atualizações:

```bash
#!/bin/bash

VERSION=$1
if [ -z "$VERSION" ]; then
  VERSION="latest"
fi

echo "Construindo imagem mathvans/pattern-deno-api:$VERSION..."
docker build -t mathvans/pattern-deno-api:$VERSION -f deno.dockerfile .

# Se for uma versão específica, também atualize a tag latest
if [ "$VERSION" != "latest" ]; then
  echo "Atualizando tag latest..."
  docker tag mathvans/pattern-deno-api:$VERSION mathvans/pattern-deno-api:latest
fi

echo "Imagem construída com sucesso!"
echo "Para enviar para o Docker Hub: docker push mathvans/pattern-deno-api:$VERSION"
echo "Para iniciar com docker-compose: docker-compose up -d"
```

Para Windows, crie `update-docker.bat`:

```batch
@echo off
set VERSION=%1
if "%VERSION%"=="" set VERSION=latest

echo Construindo imagem mathvans/pattern-deno-api:%VERSION%...
docker build -t mathvans/pattern-deno-api:%VERSION% -f deno.dockerfile .

if not "%VERSION%"=="latest" (
  echo Atualizando tag latest...
  docker tag mathvans/pattern-deno-api:%VERSION% mathvans/pattern-deno-api:latest
)

echo Imagem construída com sucesso!
echo Para enviar para o Docker Hub: docker push mathvans/pattern-deno-api:%VERSION%
echo Para iniciar com docker-compose: docker-compose up -d
```

## 6. Comandos Docker Úteis

```bash
# Reiniciar apenas o container da API (após mudanças)
docker-compose restart deno_api

# Ver logs
docker-compose logs -f deno_api

# Executar comandos dentro do container
docker-compose exec deno_api deno --version

# Verificar uso de recursos
docker stats

# Limpar imagens não utilizadas
docker image prune -a

# Enviar para Docker Hub (após fazer login)
docker push mathvans/pattern-deno-api:latest
```

## 7. Desenvolvimento com Hot Reload

Para desenvolvimento com hot reload, modifique seu `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  deno_api:
    volumes:
      - .:/app
    command: ["deno", "task", "dev"]
```

Este arquivo sobrescreve configurações específicas do docker-compose.yml original quando usado em ambiente de desenvolvimento.

Com este tutorial, você tem o essencial para gerenciar Docker e Docker Compose em seu projeto Deno API sem precisar de registros na nuvem.