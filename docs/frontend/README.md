# AFabricaDePins Frontend

Painel web de gestão para a operação da **A Fabrica de Pins**, com foco em cadastro, pedidos, estoque, cupons e relatórios gerenciais.

## Sobre o projeto

Este frontend centraliza os principais fluxos administrativos do negócio:

- autenticação de usuários;
- gestão de clientes, produtos e categorias;
- criação e acompanhamento de pedidos (tabela e Kanban);
- gestão de cupons;
- dashboard analítico com visão de estoque, receita, produção e planejamento.

O projeto consome APIs REST e possui tratamento de fallback em alguns pontos para manter a interface funcional quando determinadas respostas de relatório estão incompletas.

## Tecnologias principais

- `React 19`
- `TypeScript`
- `Vite`
- `React Router`
- `@tanstack/react-query`
- `react-hook-form` + `zod` (validação e formulários)
- `Tailwind CSS`
- `Radix UI`
- `Recharts` (gráficos)
- `xlsx` (exportação para Excel)

## Estrutura funcional (módulos)

- `src/modules/auth`: login e proteção de rotas.
- `src/modules/customers`: cadastro e edição de clientes.
- `src/modules/products`: produtos e categorias.
- `src/modules/orders`: pedidos, cupons e fluxo operacional.
- `src/modules/dashboard` e `src/modules/reports`: indicadores e análises.
- `src/services`: camada de API e mapeamento de dados.

## Requisitos

- `Node.js` 20+ (recomendado)
- `npm` 10+

## Configuração

Crie o arquivo `.env` na raiz com:

```env
VITE_API_URL=https://fabricapins-api.onrender.com
```

## Como rodar localmente

```bash
npm install
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

## Scripts disponíveis

- `npm run dev`: inicia ambiente de desenvolvimento.
- `npm run build`: gera build de produção.
- `npm run preview`: serve build localmente.
- `npm run lint`: executa lint do projeto.

## Build de produção

```bash
npm run build
```

Arquivos finais são gerados na pasta `dist/`.

## Observações

- O dashboard utiliza endpoints de relatório (`/gestao/relatorio/*`) e pode combinar dados da API com fallback local conforme disponibilidade das respostas.
- Para consistência dos relatórios, recomenda-se que o backend mantenha contratos estáveis para os blocos de vendas, receita, produção e estoque.
