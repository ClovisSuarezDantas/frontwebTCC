# AGENTS.md — MVP Front-end Web para Teste de Telemetria Veicular

## Objetivo

Criar um MVP de front-end web em **Next.js** para facilitar os testes do hardware e software de um sistema embarcado de telemetria veicular.

O sistema embarcado é baseado em:

- ESP32;
- interface OBD-II via ELM327;
- módulo GPS;
- armazenamento local em memória não volátil;
- operação offline-first;
- coleta de dados como velocidade, RPM, localização, estado do veículo e eventos.

O objetivo do MVP não é criar uma plataforma completa, mas sim uma interface simples para testar rapidamente se o hardware, o firmware e a comunicação estão funcionando.

---

## Stack obrigatória

Use:

- Next.js;
- TypeScript;
- App Router;
- Tailwind CSS;
- React Hooks;
- componentes simples e reutilizáveis.

Não use Vite.

Não implemente autenticação.

Não implemente banco de dados.

Não implemente dashboard complexo.

Não implemente arquitetura enterprise.

---

## Escopo do MVP

O MVP deve ter apenas uma página principal, em `/`, contendo:

1. Cabeçalho do sistema;
2. Status da conexão com o ESP32;
3. Cards com dados atuais do veículo;
4. Botões para testar comandos básicos;
5. Área de logs;
6. Alternância entre modo mock e modo real;
7. Campo para configurar a URL base do ESP32.

---

## Dados mínimos exibidos

A interface deve exibir os seguintes campos:

- velocidade atual;
- rotação do motor, RPM;
- latitude;
- longitude;
- status do GPS;
- status do veículo;
- quantidade de registros armazenados localmente;
- data e hora da última leitura;
- status de sincronização.

Exemplo de objeto esperado:

```ts
type TelemetryData = {
  speed: number;
  rpm: number;
  latitude: number | null;
  longitude: number | null;
  gpsStatus: "ok" | "sem_sinal" | "indisponivel";
  vehicleStatus: "ligado" | "desligado" | "erro";
  storedRecords: number;
  syncStatus: "sincronizado" | "pendente" | "offline";
  timestamp: string;
};
```

---

## Endpoints esperados no ESP32

Considere que o firmware do ESP32 poderá expor endpoints HTTP simples.

Implemente o front preparado para consumir estes endpoints:

```txt
GET  /status
GET  /telemetry
GET  /logs
POST /command/start
POST /command/stop
POST /command/sync
POST /command/clear-logs
```

Formato esperado para `GET /status`:

```json
{
  "connected": true,
  "deviceName": "ESP32 Telemetria",
  "firmwareVersion": "0.1.0",
  "uptime": 123456
}
```

Formato esperado para `GET /telemetry`:

```json
{
  "speed": 42,
  "rpm": 2100,
  "latitude": -12.9777,
  "longitude": -38.5016,
  "gpsStatus": "ok",
  "vehicleStatus": "ligado",
  "storedRecords": 128,
  "syncStatus": "pendente",
  "timestamp": "2026-05-26T16:30:00Z"
}
```

Formato esperado para `GET /logs`:

```json
[
  {
    "level": "info",
    "message": "Leitura OBD-II realizada com sucesso",
    "timestamp": "2026-05-26T16:30:00Z"
  }
]
```

---

## Modo mock obrigatório

O MVP deve funcionar mesmo sem o ESP32 conectado.

Crie um modo mock ativado por padrão.

No modo mock:

- gerar dados fictícios de telemetria;
- atualizar os dados a cada 2 segundos;
- simular logs;
- simular respostas dos comandos;
- permitir testar a interface sem hardware.

O usuário deve conseguir alternar entre:

- `Modo Mock`;
- `Modo ESP32 Real`.

---

## Comunicação com o ESP32

Criar uma função ou serviço em:

```txt
src/lib/api.ts
```

Responsabilidades:

- armazenar a URL base do ESP32;
- buscar status;
- buscar telemetria;
- buscar logs;
- enviar comandos;
- tratar erros de conexão;
- retornar mensagens amigáveis para a interface.

A URL base deve ser configurável na tela, por exemplo:

```txt
http://192.168.4.1
```

ou

```txt
http://192.168.0.50
```

Guardar a última URL usada no `localStorage`.

Como `localStorage` só existe no navegador, componentes que usam isso devem ter `"use client"`.

---

## Interface desejada

A tela deve ser simples, limpa e prática para teste em laboratório.

Layout sugerido:

- topo com título: `MVP Telemetria Veicular`;
- subtítulo: `Painel de teste para ESP32, OBD-II e GPS`;
- seletor de modo: mock ou real;
- campo de URL do ESP32;
- botão `Testar conexão`;
- cards de telemetria;
- botões de comando;
- painel de logs.

Cards mínimos:

- Velocidade;
- RPM;
- GPS;
- Estado do veículo;
- Registros locais;
- Sincronização.

Botões mínimos:

- Iniciar monitoramento;
- Parar monitoramento;
- Sincronizar dados;
- Limpar logs;
- Atualizar agora.

---

## Estrutura sugerida

Use esta estrutura simples:

```txt
app/
  page.tsx
  layout.tsx
  globals.css

src/
  components/
    StatusBar.tsx
    TelemetryCard.tsx
    TelemetryPanel.tsx
    CommandPanel.tsx
    LogsPanel.tsx
    ConfigPanel.tsx

  hooks/
    useTelemetry.ts

  lib/
    api.ts
    mock.ts

  types/
    telemetry.ts
```

Não crie arquivos desnecessários.

---

## Comportamento esperado

A página deve:

- carregar em modo mock por padrão;
- atualizar a telemetria automaticamente a cada 2 segundos;
- permitir atualização manual;
- mostrar erros de conexão de forma clara;
- manter a interface usável mesmo quando o ESP32 estiver offline;
- exibir logs recentes;
- indicar visualmente se está conectado ou desconectado;
- permitir troca rápida entre mock e ESP32 real.

---

## Requisitos visuais

Usar Tailwind CSS.

Visual simples:

- fundo claro;
- cards com bordas arredondadas;
- boa legibilidade;
- responsivo para notebook e celular;
- sem excesso de animações;
- sem gráficos complexos.

Pode usar ícones somente se já fizer sentido, mas não é obrigatório.

---

## O que NÃO fazer neste MVP

Não implementar:

- login;
- cadastro de usuário;
- banco de dados;
- backend próprio complexo;
- WebSocket;
- Web Serial;
- mapas;
- gráficos históricos;
- exportação CSV;
- autenticação JWT;
- telas múltiplas;
- deploy;
- testes automatizados complexos.

O foco é validar rapidamente a comunicação com o ESP32 e visualizar os dados principais.

---

## README obrigatório

Criar ou atualizar um `README.md` com:

1. descrição do MVP;
2. como instalar;
3. como rodar;
4. como usar modo mock;
5. como usar com ESP32 real;
6. lista dos endpoints esperados no firmware;
7. exemplo de JSON para `/telemetry`.

Comandos esperados:

```bash
npm install
npm run dev
```

---

## Critérios de aceite

O projeto estará correto se:

- rodar com `npm install` e `npm run dev`;
- abrir em `http://localhost:3000`;
- iniciar em modo mock;
- exibir telemetria simulada;
- permitir configurar URL do ESP32;
- permitir testar conexão;
- permitir enviar comandos básicos;
- mostrar logs;
- não quebrar quando o ESP32 estiver indisponível;
- usar Next.js, TypeScript, App Router e Tailwind.
