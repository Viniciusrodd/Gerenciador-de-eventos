
# 🎉 Gerenciador de Eventos

Esse é o projeto do **Gerenciador de Eventos**, criado como parte de uma atividade extensionista da faculdade. A ideia é criar uma plataforma simples e prática para organizar e participar de eventos.

---

## 🌟 Qual é o propósito desse projeto?

O **Gerenciador de Eventos** foi feito para facilitar a criação e a participação em eventos. Ele tem um foco social, ajudando na organização de eventos e promovendo a interação entre os participantes. Além disso, o projeto pode ser alinhado com os **Objetivos de Desenvolvimento Sustentável (ODS)**, como:

- **📚 ODS 4** - Educação de Qualidade
- **⚖️ ODS 16** - Paz, Justiça e Instituições Eficazes

---

## 🏫 O que são atividades extensionistas?

Atividades extensionistas são iniciativas da faculdade que ajudam a integrar o pessoal da universidade com a comunidade externa. Esse projeto auxilia na **divulgação e organização de eventos**, tornando tudo mais acessível e eficiente.

---

## 🛠️ Funcionalidades principais

### 🙋‍♂️ Gerenciar seu perfil
- **Cadastro e login:** Sistema de login para manter as contas organizadas e seguras.
- **Editar perfil:** Possibilidade de atualizar informações pessoais e foto de perfil.
- **Logout:** Sair da conta com segurança.

### 📅 Criar e gerenciar eventos
- **Criar eventos:** Usuários autenticados podem criar eventos com data, horário, local e descrição.
- **Ver eventos:** Todos os eventos são exibidos de forma visual e organizada.
- **Pesquisar eventos:** Busca de eventos por nome.
- **Editar eventos:** Organizadores podem editar informações dos eventos criados.

### 🎟️ Participação nos eventos
- **Se inscrever em eventos:** Inscrição fácil para participação.
- **Ver eventos inscritos:** Acompanhamento dos eventos em que o usuário está cadastrado.
- **Meus eventos:** Organizadores podem visualizar seus eventos criados.

### 👥 Funcionalidade de Grupos
- **Criar grupos:** Usuários podem criar grupos para eventos específicos.
- **Participar de grupos:** Entrada fácil em grupos de interesse.
- **Eventos privados:** Grupos podem ter eventos exclusivos para membros.
- **Pesquisar grupos:** Busca de grupos por nome.
- **Editar grupos:** Criadores podem modificar informações do grupo.

---

## 🖥️ Tecnologias utilizadas

- **Node.js** - Backend eficiente para a aplicação.
- **Express** - Framework para rotas e estrutura do backend.
- **MySQL** - Banco de dados relacional.
- **Sequelize** - ORM para interação com o banco de dados.
- **Moment.js** - Manipulação de datas e horários.
- **EJS** - Template engine para páginas dinâmicas.
- **Session** - Gerenciamento de sessão do usuário.
- **Multer** - Upload de arquivos (imagens de eventos e perfis).
- **Bcrypt** - Criptografia de senhas.
- **FS (File System)** - Manipulação de arquivos no servidor.

---

## 🚀 Como rodar o projeto localmente

### 🛠️ 1. Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão LTS recomendada)
- **MySQL**
- **Git** (opcional, mas recomendado para clonar o repositório)

### 📥 2. Clonar o repositório

```bash
# Clonando o repositório
git clone https://github.com/Viniciusrodd/Gerenciador-de-eventos.git

# Acesse a pasta do projeto
cd gerenciador-de-eventos
```

### 📦 3. Instalar as dependências

```bash
npm install
```

Isso instalará todas as bibliotecas necessárias, como Express, Sequelize, EJS, entre outras.

### 🛢️ 4. Configurar o banco de dados

Abra o MySQL e crie um banco de dados para o projeto:

```sql
CREATE DATABASE gerenciador_eventos;
```

Configure o arquivo **.env** na raiz do projeto:

```env
DB_NAME=gerenciador_eventos
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_DIALECT=mysql
SESSION_SECRET=sua_chave_secreta_aqui
PORT=7070   
```

Execute as migrações para criar as tabelas no banco:

```bash
npx sequelize db:migrate
```

### ▶️ 5. Rodar o servidor

```bash
npm start
```

Se tudo estiver certo, o terminal mostrará algo como:

```
Servidor rodando na porta 7070
```

### 🌍 6. Acessar a aplicação

Abra o navegador e vá até:

```
http://localhost:7070/registro
```

Agora o projeto está pronto para ser usado localmente! 🚀
