<div align="center">

# 🎓 CampusHub

**Plataforma acadêmica inspirada no Reddit: publique, comente, vote e organize conversas por comunidades.**

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

</div>

---

## 📌 Sobre o projeto

O **CampusHub** é uma plataforma de discussão para o ambiente acadêmico. Estudantes podem criar comunidades por assunto, publicar ideias e dúvidas, comentar e votar nas publicações mais relevantes.

Nesta primeira etapa o foco está nas **publicações** e nas **comunidades**. Usuários e autenticação ficam para as próximas versões.

## ✨ Funcionalidades

### Publicações
- Criar, listar, visualizar, editar e excluir
- Fixar e desafixar (fixadas aparecem primeiro)
- Votar positivamente ou negativamente, com placar calculado
- Adicionar e listar comentários

### Comunidades
- Criar, listar, editar e excluir
- Nome único (sem diferenciar maiúsculas de minúsculas)
- Bloqueio de exclusão quando existem publicações
- Página própria com publicações fixadas, abas (Recentes e Populares) e busca
- Página **Explorar** com busca, ordenação e paginação

## 🛠️ Tecnologias

| Camada | Tecnologias |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Hibernate, Bean Validation |
| Banco de dados | MySQL 8.4 |
| Frontend | HTML, CSS e JavaScript (sem frameworks) |
| Infraestrutura | Docker e Docker Compose (build multi-stage) |

## 🗂️ Estrutura do projeto

```
campushub/
├── Dockerfile
├── compose.yaml
├── .env
├── pom.xml
└── src/main/
    ├── java/com/campushub/
    │   ├── CampusHubApplication.java
    │   ├── config/         CorsConfig
    │   ├── controller/     Post, Comment, Vote, Community
    │   ├── service/        regras de negócio
    │   ├── repository/     Spring Data JPA
    │   ├── model/          Post, Comment, Vote, Community
    │   ├── dto/            requests e responses (records)
    │   ├── enums/          VoteType
    │   └── exception/      tratamento global de erros
    └── resources/
        ├── application.properties
        └── static/         index, explore, community, post + css/ e js/
```

## 🚀 Como executar

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) com Docker Compose

### Com Docker (recomendado)

```bash
git clone https://github.com/SEU-USUARIO/campushub.git
cd campushub
cp .env.example .env      # ajuste as senhas, se quiser
docker compose up -d --build
```

Acesse **http://localhost:8080/index.html**.

```bash
docker compose logs -f app   # acompanhar os logs
docker compose down          # parar (mantém os dados)
docker compose down -v       # parar e apagar o banco
```

### Sem Docker para a aplicação (desenvolvimento)

Requer **Java 17** e **Maven**.

```bash
docker compose up -d mysql   # sobe só o banco (porta 3307 no host)

export DB_URL="jdbc:mysql://localhost:3307/campushub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo"
export DB_USER=campushub
export DB_PASSWORD=campushub123

mvn spring-boot:run
```

### ⚙️ Variáveis de ambiente (`.env`)

```properties
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=campushub
MYSQL_USER=campushub
MYSQL_PASSWORD=campushub123
MYSQL_HOST_PORT=3307
APP_PORT=8080
```

> ⚠️ Troque as senhas em qualquer ambiente que não seja local e **não** versione o `.env`.

## 🔌 API

### Publicações

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/posts` | Cria publicação |
| `GET` | `/api/posts` | Lista (aceita `?communityId=`) |
| `GET` | `/api/posts/{id}` | Visualiza |
| `PUT` | `/api/posts/{id}` | Edita título e conteúdo |
| `DELETE` | `/api/posts/{id}` | Exclui, junto com comentários e votos |
| `PATCH` | `/api/posts/{id}/pin` | Fixa |
| `PATCH` | `/api/posts/{id}/unpin` | Desafixa |

### Comentários e votos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/posts/{id}/comments` | Lista comentários |
| `POST` | `/api/posts/{id}/comments` | Adiciona comentário |
| `GET` | `/api/posts/{id}/votes` | Consulta o placar |
| `POST` | `/api/posts/{id}/votes` | Vota (`UP` ou `DOWN`) |

### Comunidades

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/communities` | Cria comunidade |
| `GET` | `/api/communities` | Lista |
| `GET` | `/api/communities/{id}` | Visualiza |
| `PUT` | `/api/communities/{id}` | Edita |
| `DELETE` | `/api/communities/{id}` | Exclui (409 se houver publicações) |

### Exemplo

```bash
curl -X POST localhost:8080/api/communities \
  -H "Content-Type: application/json" \
  -d '{"name":"Engenharia de Software","description":"Dúvidas e materiais do curso"}'

curl -X POST localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Bem-vindos","content":"Primeiro post do CampusHub","communityId":1}'
```

Os erros seguem um formato padronizado:

```json
{
  "timestamp": "2026-11-19T03:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Dados inválidos",
  "path": "/api/posts",
  "fieldErrors": { "title": "O título é obrigatório" }
}
```

## 🖥️ Frontend

As páginas ficam em `src/main/resources/static/` e são servidas pelo próprio Spring Boot, na mesma origem da API.

| Página | Função |
|---|---|
| `index.html` | Feed com publicações e comunidades |
| `explore.html` | Busca e descoberta de comunidades |
| `community.html` | Página de uma comunidade |
| `post.html` | Publicação completa com comentários |

> Se o frontend for servido separadamente (Live Server, por exemplo), use `const BASE = 'http://localhost:8080/api'` em `js/api.js` e mantenha o `CorsConfig` ativo. Quando estiver dentro de `static/`, use `const BASE = '/api'`.

## 🧭 Roadmap

- [ ] Usuários e autenticação
- [ ] Participar de comunidades (membros)
- [ ] Um voto por usuário, com opção de desfazer
- [ ] Categorias e regras das comunidades
- [ ] Upload de imagens e vídeos
- [ ] Paginação no backend e queries agregadas
- [ ] Migrations com Flyway

## ⚠️ Limitações atuais

- Sem autenticação, cada clique em voto registra um novo voto.
- O Hibernate usa `ddl-auto=update`, adequado para desenvolvimento. Em produção, prefira `validate` com migrations.

## 👤 Autor

Desenvolvido por **SEU NOME** como projeto acadêmico.

[![GitHub](https://img.shields.io/badge/GitHub-SEU--USUARIO-181717?logo=github)](https://github.com/SEU-USUARIO)