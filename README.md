# Projeto de Gerenciamento de Times

O objetivo deste sistema é desenvolver uma plataforma de gerenciamento de equipes e projetos que oferece uma API REST para criar, atribuir e acompanhar projetos, tarefas e usuários. A aplicação utiliza TypeScript e integra o PostgreSQL para armazenamento de dados, o Redis para cache e filas de trabalho assíncronas.

Principais recursos:

  - Criação e atribuição de projetos a equipes.
  - Gerenciamento de tarefas em vários níveis de prioridade.
  - Busca avançada de tarefas com filtragem por status, prioridade e atribuição a usuários.
  - Marcação de tarefas como concluídas.
  - Notificações assíncronas de conclusão de tarefas.

## Versões dos Softwares Utilizados
  - Node.js: v18.17.0
  - Yarn: 1.22.19
  - npm: v9.8.1
  - Docker: 20.10.17
  - Docker Compose: 1.25.0

## Como Utilizar o Projeto
Siga os passos abaixo para utilizar o projeto:

1. Altere o nome do arquivo `.env.example` para `.env` e, caso necessario, altere as informações das variáveis de ambiente:
   - `API_PORT`: Porta na qual a API rodará.
   - `DB_HOST`: Host utilizado para acessar o banco de dados.
   - `DB_DATABASE`: Nome do banco de dados.
   - `DB_USER`: Usuário ADM que terá acesso ao banco.
   - `DB_PASSWORD`: Senha do usuário.
   - `TOKEN_SECRET`=token
   - `REDIS_HOST`=redis
   - `REDIS_PORT`=6379
   - `REDIS_PASS`=docker
     
    OBS: Como será utilizado o Dockerfile e docker-compose, os valores presentes já irão funcionar.
     
2. Abra um terminal e execute o seguinte comando na pasta raiz do projeto:  
   - ```docker-compose up```
  
     OBS: Isso iniciará os três contêineres essenciais para o funcionamento da aplicação: o contêiner da aplicação backend, o contêiner do banco de dados PostgreSQL e o contêiner do Redis. Isso é feito com base nas configurações definidas nos arquivos docker-compose.yml e Dockerfile, garantindo que todos os componentes necessários estejam prontos e funcionando.

4. Após a inicialização dos contêineres com sucesso, abra um novo terminal e execute o seguinte comando:
   - ```docker exec -it team-management-app /bin/sh```
   
    OBS: Isso abrirá um terminal dentro do contêiner onde a aplicação está em execução, permitindo que você interaja diretamente com o ambiente da aplicação.

5. Rode o seguinte comando no terminal da aplicação para realizar as migrations no banco de dados:
   - ```yarn typeorm migration:run -d src/shared/database/typeorm/index.ts```  
  
6. Rode o seguinte comando no terminal da aplicação para realizar as seeds no banco de dados:
   - ```yarn seed:run```  
     
## Rotas
  - A documentação das rotas foi desenvolvida no Postman e pode ser encontrada no seguinte link:  
    [Documentação](https://documenter.getpostman.com/view/12036505/2s9Y5eNziC)  
    
  - Além disso ela também pode ser encontrada dentro da raiz do projeto com o nome: *Team Management.postman_collection.json*.  

## Testes
O projeto inclui testes unitários e end-to-end para garantir o correto funcionamento e a qualidade do código. Para executar os testes, utilize o seguinte comando:    
   - ```yarn test```

# Estrutura do Projeto

O projeto está organizado seguindo uma estrutura bem definida para facilitar o desenvolvimento e a manutenção. Abaixo, será explicada a estrutura do projeto:

## src: Página Raiz do Projeto

Dentro da pasta "src", temos os seguintes diretórios:

### @types:
Este diretório serve para realizar tipagens mais fortes e adequadas às necessidades do domínio da aplicação.

### shared:
Neste diretório são salvos os código, classes e funcionalidades que são compartilhadas em toda a aplicação, independentemente de qualquer módulo específico do domínio.
  - config:
  Neste diretório, encontram-se funções e variáveis de configuração da API. Aqui você pode definir as configurações do servidor, como portas, chaves de API, configurações de autenticação, entre outras.

  - container:
  A pasta "container" utiliza o `tsyringe`, que é um injetor de dependências, para realizar a injeção de dependências na aplicação. A injeção de dependências é uma técnica que permite fornecer as dependências de um objeto de forma externa, tornando o código mais modular e facilitando a manutenção e os testes.

  - database:
  A pasta "database" contem toda a lógica para realizar a conexão com o banco de dados e, além disso, contem as migrations e seeds que são utilizadas para popular do banco de dados.

  - middlewares:
  Os middlewares são funções que podem ser executadas antes que as rotas da aplicação sejam processadas. Neste diretório, ficam os middlewares utilizados pelas rotas para executar tarefas comuns, como autenticação, validação de dados ou registro de logs.
  
  - routes:
  Neste diretório, estão definidas as rotas da aplicação. As rotas são responsáveis por mapear as URLs para os controladores apropriados, de acordo com a solicitação do cliente.
  
  - utils:
  A pasta "utils" contém funções auxiliares que podem ser utilizadas em diferentes partes da aplicação. Essas funções normalmente não têm uma relação direta com a lógica de negócio, mas fornecem utilidades que podem ser reutilizadas em vários lugares.

  - workers:
  A pasta "workers" serve para guardar os receivers da fila assincrona.

### modules:
O diretório "modules" contém a lógica da aplicação, seguindo os princípios SOLID. Os princípios SOLID são um conjunto de princípios de design de software que buscam criar um código mais robusto, fácil de manter e escalável. Cada módulo dentro desta pasta representa uma entidade ou recurso específico da aplicação.

Dentro de cada pasta de módulo, temos a seguinte estrutura:

  - Controllers:
  Nesta pasta, estão os controladores da aplicação, que são responsáveis por receber as requisições HTTP, processá-las e retornar as respostas apropriadas. Os controladores interagem com os casos de uso (use cases) para executar as operações solicitadas pelo cliente.

  - DTOs (Data Transfer Objects):
  Os DTOs são objetos que transportam dados entre a camada de serviço (Use Case) e a camada de persistência (Repository). Eles são usados para evitar que entidades específicas do domínio sejam expostas diretamente na API.

  - Entities:
  As entidades representam objetos de negócio da aplicação. Elas encapsulam a lógica e o comportamento das regras de negócio.

  - Repository:
  O diretório "Repository" contém a implementação da camada de persistência da aplicação. Aqui estão os métodos para interagir com o banco de dados, realizar consultas e operações de CRUD nas entidades.

  - UseCase:
  Os casos de uso representam as operações ou funcionalidades da aplicação. Eles contêm a lógica de negócio e utilizam as entidades, os repositórios e outros componentes da aplicação para executar as operações solicitadas pelos controladores.

## Considerações Finais
A estrutura do projeto foi planejada para facilitar a organização do código, tornando-o mais legível, modular e fácil de manter. Ao seguir os princípios SOLID, buscamos criar uma aplicação escalável e de alta qualidade.

Caso você tenha alguma dúvida sobre a estrutura do projeto ou precise de mais informações, fique à vontade para entrar em contato. Agradeço a oportunidade de participar do teste e espero que essa explicação sobre a estrutura do projeto tenha sido útil.


  
