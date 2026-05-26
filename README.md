# MVP Telemetria Veicular

Front-end web em Next.js para testar um sistema embarcado de telemetria veicular com ESP32, OBD-II, GPS e armazenamento local offline-first.

O MVP possui uma única página em `/`, inicia em modo mock e permite alternar para comunicação HTTP com um ESP32 real.

## Stack

- Next.js com App Router
- TypeScript
- Tailwind CSS
- React Hooks

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

Depois abra:

```txt
http://localhost:3000
```

## Modo mock

O projeto inicia em `Modo Mock`.

Nesse modo, a interface funciona sem ESP32 conectado:

- gera telemetria fictícia;
- atualiza os dados a cada 2 segundos;
- simula logs;
- simula os comandos de iniciar, parar, sincronizar e limpar logs.

## Modo ESP32 real

Na tela principal:

1. Selecione `Modo ESP32 Real`.
2. Informe a URL base do ESP32, por exemplo `http://192.168.4.1` ou `http://192.168.0.50`.
3. Clique em `Testar conexão`.

A URL informada é salva no `localStorage` do navegador.

O firmware deve aceitar requisições HTTP vindas do navegador. Se a página e o ESP32 estiverem em origens diferentes, habilite CORS no firmware.

## Endpoints esperados no firmware

```txt
GET  /status
GET  /telemetry
GET  /logs
POST /command/start
POST /command/stop
POST /command/sync
POST /command/clear-logs
```

### GET /status

```json
{
  "connected": true,
  "deviceName": "ESP32 Telemetria",
  "firmwareVersion": "0.1.0",
  "uptime": 123456
}
```

### GET /telemetry

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

### GET /logs

```json
[
  {
    "level": "info",
    "message": "Leitura OBD-II realizada com sucesso",
    "timestamp": "2026-05-26T16:30:00Z"
  }
]
```

## Observações do MVP

Este projeto não implementa autenticação, banco de dados, WebSocket, Web Serial, mapas ou gráficos históricos. O foco é validar rapidamente a comunicação com o ESP32 e visualizar os dados principais de hardware/software.
