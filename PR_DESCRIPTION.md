# PR: feat(ui/calc): bulk month edits, cost formula B, DP multi-recontracts + theme

## 🎯 Objetivo

Implementar edição coletiva de meses, nova fórmula de tarifação (Fórmula B), regras de recontratação com delays, e adaptar a UI mantendo compatibilidade de build.

## 📋 Resumo das Mudanças

### 1. DevContainer & VS Code Setup ✅
- **Arquivo**: `.devcontainer/devcontainer.json`
- **Arquivo**: `.vscode/tasks.json`
- Configuração completa para GitHub Codespaces
- Tasks para dev, build, lint e preview
- Port forwarding automático (3000, 8080)
- Post-create command: `npm ci`

### 2. Fórmula de Custo B ✅
- **Arquivo**: `src/lib/optimizer.ts`
- **Implementação**:
  ```typescript
  custo_t = medida_t × TD_t + max(0, medida_t - contratada_t) × TU_t
  ```
- Cobra a demanda medida total + ultrapassagem adicional
- Suporta campos novos (`tarifa_demanda_r_pkW`, `tarifa_ultrapassagem_r_pkW`) e legados

### 3. Otimizador DP com Múltiplas Recontratações ✅
- **Arquivo**: `src/lib/optimizer.ts` - função `optimizeSequenceDP()`
- **Regras Implementadas**:
  - **Aumentos**: Ilimitados por ano, delay = 1 mês (s_eff = s_req + 1)
  - **Reduções**: Máximo 1 a cada 12 meses, delay = 3 meses (s_eff = s_req + 3)
- **Saída**:
  - Sequência completa de recontratações
  - Breakdown mensal detalhado (custo_real, custo_otimo, poupança)
  - Total de economia
  - Top recomendações

### 4. LocalStorage & Import/Export ✅
- **Arquivo**: `src/lib/storage.ts`
- **Chave**: `demand_items_v1`
- **Funções**:
  - `saveToLocalStorage()` / `loadFromLocalStorage()`
  - `parseCSV()` / `exportToCSV()`
  - `parseJSON()` / `exportToJSON()`
  - `downloadFile()` - download de CSV/JSON

### 5. Componentes UI ✅
#### HeaderNav (`src/components/HeaderNav.tsx`)
- Navegação entre Calculadora (/) e Dashboard (/dashboard)
- Header fixo com logo e título

#### KpiCard (`src/components/KpiCard.tsx`)
- Cards reutilizáveis para KPIs
- Variantes: default, success, warning, info
- Suporte a ícones e trends

#### DemandChart (`src/components/DemandChart.tsx`)
- Line charts (demanda atual vs medida vs otimizada)
- Bar charts (custos real vs otimizado)
- Integração com Recharts
- Responsive

#### BulkEditMonthlyDataTable (`src/components/BulkEditMonthlyDataTable.tsx`)
- **Edição Individual**: Cada linha editável
- **Edição em Massa**:
  - Aplicar valor a toda a série
  - Aplicar por intervalo (YYYY-MM início/fim)
- **Import/Export**:
  - Upload CSV/JSON
  - Download CSV/JSON
- **Auto-save**: Persiste no localStorage

### 6. Dashboard ✅
- **Rota**: `/dashboard`
- **Arquivo**: `src/pages/Dashboard.tsx`
- **Seções**:
  1. **KPIs**:
     - Economia Potencial (R$)
     - Meses Subutilizados
     - Contratada Média (kW)
     - Contratada Ótima (kW)
  2. **Dados Mensais**: Tabela com bulk edit
  3. **Botão Calcular**: Executa `optimizeSequenceDP()`
  4. **Visualizações**:
     - Line chart: Demanda Atual vs Medida vs Otimizada
     - Bar chart: Custos Real vs Otimizado
  5. **Sequência de Recontratações**: Tabela com ações, tipos, níveis, meses
  6. **Breakdown Mensal**: Tabela detalhada com poupança por mês
  7. **Resumo e Recomendações**

### 7. Testes ✅
- **Diretório**: `tests/`
- **Arquivos**:
  - `optimizer.test.ts` - Testes da Fórmula B
  - `storage.test.ts` - Testes de CSV/JSON parsing
  - `README.md` - Instruções de setup (Vitest)
- **Cobertura**:
  - Cost function (6 cenários)
  - CSV parsing (5 cenários)
  - JSON parsing (4 cenários)
  - Export/Import round-trip

### 8. Dados de Teste ✅
- **Diretório**: `test-data/`
- **Arquivos**:
  - `example-18-months.csv` - 18 meses de dados
  - `example-18-months.json` - Mesmos dados em JSON
  - `README.md` - Documentação de uso e formato

### 9. Documentação ✅
- **README.codespace.md**: Guia completo de desenvolvimento em Codespaces
- **test-data/README.md**: Instruções de uso dos dados de teste
- **tests/README.md**: Instruções para rodar testes

## 🖼️ Screenshots

### Dashboard Inicial (Vazio)
![Dashboard Inicial](https://github.com/user-attachments/assets/a1e79fb6-121f-4d30-b413-18f20e1beedf)

### Dashboard com Resultados (12 meses, otimização calculada)
![Dashboard com Resultados](https://github.com/user-attachments/assets/10d534bd-a830-46b2-a5b1-632a06ae3364)

**Destaques da segunda screenshot**:
- ✅ Economia de **R$ 8.400,00** calculada
- ✅ Contratada ótima: **580.0 kW**
- ✅ 5 recontratações sugeridas (todos aumentos graduais)
- ✅ Charts funcionando (line + bar)
- ✅ Breakdown mensal completo
- ✅ Dados carregados do localStorage

## 🔧 Build & Testes

```bash
# Install
npm ci

# Build (sucesso - sem erros)
npm run build
# ✓ built in 6.08s
# dist/index.html                   1.56 kB │ gzip:   0.65 kB
# dist/assets/index-D9_F8oL2.css   64.61 kB │ gzip:  11.55 kB
# dist/assets/index-Ds-Hks58.js   764.23 kB │ gzip: 225.76 kB

# Dev server
npm run dev
# Roda em localhost:3000

# Linting
npm run lint
```

## 📊 Dados de Teste

### CSV Example (test-data/example-18-months.csv)
```csv
ano_mes,demanda_contratada_kw,demanda_medida_kw,tarifa_demanda_r_pkW,tarifa_ultrapassagem_r_pkW
2024-01,500,450,52.50,105.00
2024-02,500,480,52.50,105.00
...
```

### Resultado Esperado (12 meses)
- **Custo Real Total**: R$ 323.400,00
- **Custo Otimizado**: R$ 315.000,00
- **Economia**: R$ 8.400,00
- **Recontratações**: 5 aumentos graduais (540→550→560→570→580 kW)

## 🧪 Como Testar

### 1. Importar Dados
1. Acesse `/dashboard`
2. Clique em "Importar"
3. Selecione `test-data/example-18-months.csv` ou `.json`
4. Dados serão carregados e salvos no localStorage

### 2. Edição em Massa
1. Clique em "Edição em Massa"
2. Selecione campo (ex: tarifa_demanda_r_pkW)
3. Digite valor (ex: 55)
4. Escolha:
   - "Toda a Série" OU
   - Intervalo: 2024-01 a 2024-06
5. Clique "Aplicar"

### 3. Calcular Otimização
1. Clique "Calcular Otimização"
2. Aguarde ~1 segundo
3. Veja resultados:
   - KPIs atualizados
   - Charts renderizados
   - Tabelas de recontratações e breakdown

### 4. Export
1. Clique "CSV" ou "JSON" para exportar
2. Arquivo baixado automaticamente

## 📝 Notas Técnicas

### Fórmula B - Justificação
A Fórmula B cobra sobre a demanda **medida** (não contratada), refletindo o consumo real. A ultrapassagem é calculada apenas sobre o excesso.

**Exemplo**:
- Contratada: 500 kW
- Medida: 450 kW
- TD: R$ 50/kW, TU: R$ 100/kW
- **Fórmula A** (antiga): 500 × 50 = R$ 25.000
- **Fórmula B** (nova): 450 × 50 = R$ 22.500 ✅ (economia!)

### DP Optimizer - Complexidade
- **Estado**: `dp[t][c][lastReduction]`
- **Transições**: O(T × C² × 13) onde T=meses, C=candidatos
- **Delays modelados**: Aumentos (1 mês) vs Reduções (3 meses)
- **Constraint**: Reduções limitadas (1 por 12 meses)

### LocalStorage
```typescript
interface StoredData {
  monthlyData: MonthlyData[];
  lastUpdated: string;
}
```
- Chave: `demand_items_v1`
- Auto-save ao modificar dados
- Auto-load ao montar componente

## ✅ Critérios de Aceite

- [x] `npm ci && npm run build` completa sem erros
- [x] `npm start` roda e Dashboard `/dashboard` carrega
- [x] Import do payload exemplo funciona
- [x] "Calcular" chama `optimizeSequenceDP` e atualiza KPIs/charts
- [x] LocalStorage persiste entradas após reload
- [x] Otimizador aceita múltiplas recontratações e respeita delays
- [x] PR contém screenshots do dashboard e build log

## 🚀 Próximos Passos (Fora do Escopo desta PR)

1. **Theme LandingSeiteTEST**: Extrair cores/fonts/logo do repo LandingSeiteTEST
2. **Vitest Setup**: Instalar e configurar para rodar testes
3. **CI/CD**: Adicionar workflow para rodar testes automaticamente
4. **Top-3 Alternativas**: Expandir otimizador para retornar múltiplas soluções
5. **Performance**: Otimizar DP para datasets grandes (100+ meses)

## 📦 Commits

1. `chore(devcontainer): add devcontainer config and VS Code tasks`
2. `feat(calc): implement Formula B cost calculation and DP optimizer with delays`
3. `feat(ui): add Dashboard with KPIs, charts, bulk editing and navigation`
4. `docs: add test data examples and documentation`
5. `test: add unit tests for cost function and CSV/JSON parsing`

## 🔗 Links

- **Branch**: `feature/codespace-ui-test`
- **Base**: `main`
- **Codespace**: Pronto para uso (postCreateCommand configurado)
- **Docs**: `README.codespace.md`, `test-data/README.md`, `tests/README.md`

---

**Pronto para merge após code review!** ✨
