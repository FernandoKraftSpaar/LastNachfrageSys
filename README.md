# LastNachfrageSys

Sistema de cálculo de demanda otimizada para clientes - Calculadora de Otimização de Demanda Contratada de Energia Elétrica

## Sobre o Projeto

Este repositório contém uma aplicação React desenvolvida no Lovable, com o objetivo de ser uma calculadora de otimização de demanda contratada de energia elétrica para empresas.

A aplicação foi importada do repositório [LandingSeiteTEST](https://github.com/FernandoKraftSpaar/LandingSeiteTEST) e está configurada para deploy via GitHub Pages.

## Tecnologias Utilizadas

- **Vite** - Build tool e dev server
- **TypeScript** - Linguagem de programação
- **React** - Framework de UI
- **shadcn-ui** - Componentes de UI
- **Tailwind CSS** - Estilização

## Como Executar Localmente

### Pré-requisitos

- Node.js (versão 20 ou superior)
- npm

### Passos

```sh
# 1. Clone o repositório
git clone https://github.com/FernandoKraftSpaar/LastNachfrageSys.git

# 2. Navegue até o diretório do projeto
cd LastNachfrageSys

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:8080`

## Build para Produção

Para gerar uma build de produção:

```sh
npm run build
```

Os arquivos otimizados serão gerados no diretório `dist/`.

## Deploy

Este projeto está configurado para deploy automático no GitHub Pages via GitHub Actions. Cada push para a branch `main` automaticamente dispara o workflow de build e deploy.

A aplicação pode ser acessada em: `https://fernandokraftspaar.github.io/LastNachfrageSys/`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview da build de produção
- `npm run lint` - Executa o linter

## Licença

Este projeto é privado e de uso interno.

