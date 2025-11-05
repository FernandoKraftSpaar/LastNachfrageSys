# Codespaces Development Guide

## Quick Start

Este projeto está configurado para desenvolvimento via GitHub Codespaces.

### Iniciar o Ambiente

1. **Abrir no Codespace**: Clique em "Code" > "Codespaces" > "Create codespace on feature/codespace-ui-test"
2. **Aguardar Setup**: O postCreateCommand rodará automaticamente `npm ci` para instalar dependências
3. **Portas**: As portas 3000 (dev) e 8080 (preview) serão automaticamente encaminhadas

### Comandos Disponíveis

Você pode rodar os comandos usando o VS Code Task Runner (Ctrl+Shift+P > "Tasks: Run Task") ou no terminal:

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

### Estrutura do Projeto

```
LastNachfrageSys/
├── .devcontainer/          # Configuração do Codespace
│   └── devcontainer.json
├── .vscode/                # Tasks do VS Code
│   └── tasks.json
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes shadcn/ui
│   │   ├── MonthlyDataTable.tsx
│   │   ├── OptimizationForm.tsx
│   │   └── ResultsDisplay.tsx
│   ├── lib/               # Lógica de negócio
│   │   └── optimizer.ts   # Algoritmos de otimização
│   ├── pages/             # Páginas da aplicação
│   │   ├── Index.tsx
│   │   └── Dashboard.tsx  (novo)
│   └── styles/            # Estilos globais
│       └── theme.css      (novo)
└── package.json
```

### Novos Recursos Implementados

#### 1. Edição em Massa de Dados Mensais

- **Intervalo**: Selecione início e fim (YYYY-MM) e aplique valores
- **Toda Série**: Botão para aplicar valor a todos os meses
- **CSV/JSON Import**: Upload/colagem de dados estruturados

#### 2. Fórmula de Custo (Opção B)

```
custo_t = medida_t × TD_t + max(0, medida_t - contratada_t) × TU_t
```

#### 3. Otimizador com Múltiplas Recontratações

- **Aumentos**: Ilimitados por ano
- **Reduções**: Máximo 1 a cada 12 meses
- **Delays**:
  - Aumento: entra em vigor no mês subsequente (s_eff = s_req + 1)
  - Redução: entra em vigor em 3 meses (s_eff = s_req + 3)

#### 4. Dashboard com Visualizações

- KPI Cards: Economia potencial, meses com subutilização, contratada ótima
- Charts: Line chart (contratada vs medida vs otimizada), bar chart (custos)
- Tabela detalhada mensal com breakdown de custos
- Simulação de cenários (top-3 alternativas)

### LocalStorage

Os dados são automaticamente salvos no localStorage com a chave `demand_items_v1`:

```typescript
// Estrutura dos dados salvos
interface StoredData {
  monthlyData: MonthlyData[];
  lastUpdated: string;
}
```

### Exemplo de Dados para Teste

#### CSV Format

```csv
ano_mes,demanda_contratada_kw,demanda_medida_kw,tarifa_demanda_r_pkW,tarifa_ultrapassagem_r_pkW
2024-01,500,450,50,100
2024-02,500,480,50,100
2024-03,500,520,50,100
```

#### JSON Format

```json
[
  {
    "ano_mes": "2024-01",
    "demanda_contratada_kw": 500,
    "demanda_medida_kw": 450,
    "tarifa_demanda_r_pkW": 50,
    "tarifa_ultrapassagem_r_pkW": 100
  }
]
```

### Testes

Para rodar os testes unitários (quando implementados):

```bash
npm test
```

Cobertura de testes inclui:
- Função de custo (fórmula B)
- Otimizador DP (delays e múltiplas recontratações)
- Parser CSV/JSON

### Troubleshooting

#### Build Falha

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Porta Ocupada

Se a porta 3000 estiver em uso, você pode especificar outra:

```bash
npm run dev -- --port 3001
```

#### ESLint Errors

```bash
# Auto-fix
npm run lint -- --fix
```

### Deploy

O projeto usa GitHub Actions para deploy automático no GitHub Pages. Cada push para `main` dispara o workflow.

URL de produção: `https://fernandokraftspaar.github.io/LastNachfrageSys/`

### Suporte

Para problemas ou dúvidas, abra uma issue no repositório.
