# Máquina do uploader

Máquina de estado XState v5 que conduz todo o fluxo de compressão: criar → upload →
confirmar → comprimir → baixar.

Este README é em português (exceção documentada no `CLAUDE.md`: READMEs de módulo podem
ser em português). O código continua em inglês. Strings voltadas ao usuário dentro da
máquina ficam em português.

## Por que uma máquina

O fluxo não é uma sequência linear de fetches. Ele tem regras que um booleano `isLoading`
não expressa:

- **Cancelar só existe durante o upload para o S3.** `CANCEL` é uma transição que só
  existe em `uploading`, então um cancelamento ilegal é impossível em vez de ser um bug a
  se proteger.
- **Duas barras de progresso diferentes.** `uploading` tem porcentagem real; `compressing`
  é indeterminada. Qual barra renderiza é derivado do estado, não de flags.
- **O retry recomeça do zero**, reaproveitando o arquivo já em contexto.
- **Todo recurso assíncrono está atrelado a um estado.** Sair de um estado para o ator
  invocado nele, o que aborta o XHR e fecha o `EventSource` sem limpeza manual.

## Organização dos arquivos

| Arquivo | Contém |
|---|---|
| `setup.ts` | `setup()` — tipos de contexto/eventos/emitidos, registro de atores |
| `actors.ts` | Lógica dos atores, envolvendo `lib/api.ts` |
| `actions.ts` | Ações nomeadas (escritas no contexto) e o contexto inicial |
| `states.ts` | Uma configuração de estado exportada por estado |
| `index.ts` | `createMachine` — monta os estados na máquina final |

> **`setup.ts` não pode importar `states.ts` nem `actions.ts`.** Os dois importam `machine`
> de volta, e o ciclo quebra em runtime: quando `setup.ts` começa a executar, seus imports
> rodam primeiro e chamam `machine.assign(...)` com o `const machine` ainda na zona morta
> temporal — `ReferenceError: Cannot access 'machine' before initialization`. O `tsc` não
> pega isso, porque tipos não enxergam ciclo de execução. Por isso a montagem mora em
> `index.ts`, que é folha: ninguém o importa de volta.

`states.ts` usa `machine.createStateConfig(...)`, que em runtime é função identidade —
existe só para cada estado receber os tipos do `setup`.

---

## Contexto

| Campo | Tipo | Escrito por |
|---|---|---|
| `file` | `File \| null` | evento `SUBMIT` |
| `preset` | `Preset` | evento `SUBMIT` |
| `compressionId` | `string \| null` | `onDone` de `createCompressionLogic` |
| `uploadUrl` | `string \| null` | `onDone` de `createCompressionLogic` |
| `uploadedPercent` | `number` | evento `UPLOAD_PROGRESS` |
| `compression` | `Compression \| null` | evento `STATUS` (payload do SSE) |
| `error` | `string \| null` | todo caminho de erro — em português, pronto para a UI |

Os tipos vêm de `lib/types.ts`. Não redeclare.

> `file` precisa ser `File | null`. A máquina começa em `idle`, sem arquivo. Tipar como
> não-nulo faz do contexto inicial uma mentira.

**Não existe `downloadUrl` no contexto**, de propósito. A URL presigned de download vai
direto do `event.output` para o `emit`, porque nada na tela a lê e ela expira em 3000s —
guardada, viraria link morto silencioso numa aba deixada aberta. A regra geral: guarde no
contexto o que alguma tela lê.

## Eventos

**Da UI** (`send`): `SUBMIT` (`{ file, preset }`), `CANCEL`, `RETRY`, `RESET`, `DOWNLOAD`.

**Dos atores filhos** (`sendBack`): `UPLOAD_PROGRESS` (`{ percent }`), `UPLOAD_DONE`,
`UPLOAD_ERROR` (`{ message }`), `STATUS` (`{ compression }`), `STREAM_ERROR`.

A máquina não distingue as origens — mesma caixa de entrada, mesma tabela de transições.
Por isso compartilham uma union.

**Por que só os atores de callback têm evento de erro:** `fromPromise` gera `onError`
sozinho (um `xstate.error.actor.*`, que não está — nem deve estar — na union). `fromCallback`
não tem `onError`, então o erro precisa ser um evento declarado e enviado por `sendBack`.
Daí existirem `UPLOAD_ERROR` e `STREAM_ERROR`, e não existirem `CREATE_ERROR` ou
`DOWNLOAD_ERROR`.

E `UPLOAD_ERROR` carrega `message` porque `uploadToS3` rejeita com mensagem já pronta para
a UI; `STREAM_ERROR` não carrega nada porque o `onerror` do `EventSource` entrega um
`Event` opaco, sem nada aproveitável.

## Emitidos

| Evento | Quem consome |
|---|---|
| `notify` (`{ message }`) | componente chama o `sonner` |
| `download` (`{ url }`) | componente faz `window.location.href = url` |

Efeitos de DOM saem por `emit` em vez de virarem ações, para a máquina continuar rodando
em Node e testável sem browser.

---

## Estados

```
idle
 └─ SUBMIT ─→ creating                     [guarda file + preset]

creating                                   [invoke createCompressionLogic]
 ├─ entry: clearRun
 ├─ onDone  ─→ uploading                   [guarda compressionId + uploadUrl]
 └─ onError ─→ error

uploading                                  [invoke uploadFileLogic]
 ├─ entry: resetProgress
 ├─ UPLOAD_PROGRESS   (sem target)
 ├─ UPLOAD_DONE  ─→ confirming
 ├─ UPLOAD_ERROR ─→ error
 └─ CANCEL       ─→ idle                   ← único estado onde CANCEL existe

confirming                                 [invoke confirmUploadLogic]
 ├─ onDone  ─→ compressing
 └─ onError ─→ error

compressing                                [invoke streamCompressionLogic]
 ├─ initial: streaming
 │   streaming     ─ STREAM_ERROR ─→ reconnecting
 │   reconnecting  ─ STREAM_ERROR (interno)
 │                 └─ after 15s ─→ #uploader.error
 ├─ STATUS(COMPLETED)        ─→ completed
 ├─ STATUS(FAILED|EXPIRED)   ─→ error
 └─ STATUS(outros)           ─→ .streaming     (interno ao pai)

downloading                                [invoke downloadLogic]
 ├─ onDone  ─→ completed                   [emit download]
 └─ onError ─→ completed                   [emit notify]

completed
 ├─ DOWNLOAD ─→ downloading
 └─ RESET    ─→ idle

error
 ├─ RETRY ─→ creating                      (reaproveita context.file)
 └─ RESET ─→ idle
```

**Por que `uploading` e `compressing` não usam `onDone`/`onError`:** ambos invocam atores
de callback, e a [documentação](https://stately.ai/docs/callback-actors) é explícita:

> "Callback actors currently do not produce output – they are active indefinitely until
> they are stopped or an error occurs."

Sem output, não há `onDone`. Um `onDone` ali compila e nunca dispara.

**Por que o SSE é invocado no pai `compressing`:** transitar entre filhos não reinicia os
atores do pai. É o que permite `streaming ⇄ reconnecting` sem derrubar a conexão.

**Por que `creating` / `uploading` / `confirming` são três estados:** a API modela os três
como uma única linha `PENDING_UPLOAD`, mas são três telas distintas. Os estados espelham a
UI, não o enum do banco.

**Por que não existem filhos `queued`/`processing`:** a API filtra `QUEUED` fora do stream
(`compressor.service.ts`, comentário no `filter`) — o cliente já sabe que está na fila
porque acabou de chamar o `confirm-upload`. A primeira `STATUS` que chega já é
`PROCESSING`, então os dois filhos representariam uma fase que o backend não emite e que
renderiza a mesma tela. O lugar foi dado à saúde da conexão, que muda o que o usuário vê.

**Por que `RETRY` sempre volta para `creating`:** a API expira linhas `PENDING_UPLOAD` ou
`FAILED` depois de 5 minutos (`cleanup.service.ts`, cron a cada minuto). O card de erro
fica na tela enquanto o usuário decide, então retomar do passo exato apontaria para uma
linha possivelmente morta. Criar uma compressão nova é o único caminho que não depende do
relógio. Custo aceito: falha em `compressing` re-envia o arquivo inteiro.

---

## Atores

Cada ator envolve uma função de `lib/api.ts`. Nenhum `fetch` cru mora na máquina.

| Ator | Tipo | Envolve |
|---|---|---|
| `createCompressionLogic` | `fromPromise` | `requestCompression` |
| `uploadFileLogic` | `fromCallback` | `uploadToS3` |
| `confirmUploadLogic` | `fromPromise` | `confirmUpload` |
| `streamCompressionLogic` | `fromCallback` | `streamCompression` |
| `downloadLogic` | `fromPromise` | `requestDownload` |

Regra de escolha: **reporta mais de uma vez?** Sim → `fromCallback`, que fala por
`sendBack`. Não → `fromPromise`, que fala por `return` / `throw`.

### Como `CANCEL` chega no `AbortController`

O ator nunca vê `CANCEL`. A ligação é indireta, pelo ciclo de vida do estado, nesta ordem:

1. A UI envia `CANCEL`.
2. `uploading` tem uma transição `CANCEL` com `target: "idle"`.
3. A máquina **sai** de `uploading`.
4. Sair do estado para o ator invocado; o XState chama a função de limpeza que ele retornou.
5. A limpeza é `() => controller.abort()`, e o XHR morre.
6. O `.catch` dispara, vê `signal.aborted === true` e retorna sem enviar `UPLOAD_ERROR`.

O ator segura o `AbortController` (o botão); `uploadToS3` recebe só `controller.signal`
(o fio). O `return` de um `fromCallback` é a **função de limpeza**, não o resultado —
retornar a promise é erro de tipo e deixa o upload sem como ser cancelado.

`fromCallback` também expõe `receive`, que manda eventos *para dentro* do ator. Não use
para cancelamento: você teria que manter o estado vivo e gerenciar o aborto na mão,
perdendo a garantia que a limpeza dá de graça.

### `streamCompressionLogic`: parse, limpeza e guarda

Três armadilhas, todas necessárias:

**`event.data` é sempre string.** Pela especificação do SSE, `data` chega como texto.
Anotar o handler como `MessageEvent<Compression>` mente para o TypeScript: compila, mas em
runtime `compression.status` é `undefined` e nenhuma transição dispara.

**Sem função de limpeza, o `EventSource` vaza.** Ele **não** fecha quando o stream termina
— pelo [spec](https://html.spec.whatwg.org/multipage/server-sent-events.html), o servidor
fechar faz o navegador *reconectar* depois de alguns segundos. Só `.close()` ou uma falha
fatal (status ≠ 200, ou `Content-Type` ≠ `text/event-stream`) o encerram. Sem a limpeza,
uma compressão terminada reabre a conexão a cada ~3s pra sempre.

**A flag `done` cala o erro esperado.** A API completa o observable em status terminal
(`takeWhile` + `isTerminal`, que é exatamente `COMPLETED || FAILED`), e o navegador não
distingue esse fechamento normal de queda de rede. Sem a guarda, todo sucesso vem seguido
de um `STREAM_ERROR` espúrio.

`done` e `close()` fazem trabalhos diferentes: `close()` para a reconexão e vem de *sair do
estado*; `done` só evita o evento falso. Os dois são necessários.

A API emite eventos **sem nome** (`{ data }`, sem campo `type`), então `onmessage` está
correto — eventos nomeados exigiriam `addEventListener(nome, ...)`.

---

## Ações

| Ação | Onde | Faz |
|---|---|---|
| `resetAll` | `entry` de `idle` | volta o contexto ao inicial |
| `clearRun` | `entry` de `creating` | limpa tudo menos `file` e `preset` |
| `resetProgress` | `entry` de `uploading` | zera `uploadedPercent` |
| `storeCompression` | `STATUS` | atribui `compression` |
| `storeStatusError` | `STATUS(FAILED\|EXPIRED)` | mensagem própria para cada caso |
| `storeStreamError` | desistência do `reconnecting` | mensagem de conexão perdida |

`createInitialContext` é a fonte única do contexto em branco: serve ao `createMachine` e ao
`resetAll`. `createRetryContext` deriva dela preservando só os inputs — assim, campo novo
adicionado ao `Context` passa a ser limpo no retry sem ninguém lembrar de voltar aqui.
É por isso que ela retorna `Context` cheio e não `Partial<Context>`: com `Partial`, o
compilador nunca avisaria sobre um campo esquecido.

### `assign` vs `machine.assign`

- **`machine.assign`** tipa `event` como a union `Events`. Serve quando a ação ignora o
  evento, e serve com `assertEvent` para os eventos da própria máquina.
- **O `assign` importado** pega o tipo pela posição, então dentro de `onDone` ele enxerga
  `DoneActorEvent` e `event.output` fica tipado.

`machine.assign` **não pode** ser usado em `onDone`/`onError`: o `xstate.done.actor.*` não
faz parte da union declarada, então `event.output` não existe e `assertEvent` não tem para
o que estreitar. Mantenha esses inline.

### Ordem de execução

Numa transição: `exit` da origem → ações da transição → `entry` do destino. E o `entry` do
estado inicial roda na inicialização.

Isso é o que faz o `clearRun` funcionar: no `SUBMIT`, a ação da transição grava `file` e
`preset`, e só depois o `entry` de `creating` limpa o resto preservando os dois.

### Transições sem target

`UPLOAD_PROGRESS` e o `STREAM_ERROR` de `reconnecting` não têm `target`. O motivo é
declarar intenção — e, no caso do `reconnecting`, evitar um bug real.

Na v5, transição com target para o próprio estado **não** o reentra por padrão. A
[documentação](https://stately.ai/docs/transitions) diz:

> "By default, when a state machine transitions from some state to the same state or from
> a parent state to a descendent (child, grandchild, etc.) of that parent state, it will
> not re-enter the state"

Em v4 era o contrário (self-transitions eram externas por padrão), então cuidado ao trazer
intuições antigas. É essa mesma regra que faz `target: ".streaming"` preservar o
`EventSource` invocado no pai.

Onde isso morde: o `onerror` do `EventSource` dispara a cada tentativa falha. Se o
`STREAM_ERROR` de `reconnecting` tivesse target, cada erro reiniciaria o `after` e a
máquina **nunca** desistiria.

---

## Reconexão do stream

`compressing` tem dois filhos porque o `EventSource` já reconecta sozinho — o que falta não
é reconexão, é **teto e feedback**. Sem isso ele tentaria pra sempre, calado.

- `streaming` → normal.
- `reconnecting` → conexão caiu, o navegador está tentando por baixo, a UI avisa.
- Qualquer `STATUS` devolve para `.streaming` e, ao sair de `reconnecting`, o timer de
  desistência se cancela sozinho (*"Delayed transition timers are canceled when the state
  is exited"*).
- 15s sem nada → `#uploader.error`. O alvo é absoluto porque, de dentro de um filho,
  `"error"` procuraria um irmão dentro de `compressing`.

`EXPIRED` precisa de ramo próprio no `STATUS`: a API **não** o considera terminal, então o
stream não fecha sozinho nesse caso — quem sai de `compressing` é a máquina.

---

## Download

O botão em `completed` só envia `send({ type: "DOWNLOAD" })`. O trabalho está do outro lado:

A URL presigned é assinada pela API com `ResponseContentDisposition: attachment` e o nome
original do arquivo (RFC 5987, porque nomes em pt-BR costumam ter acento e header HTTP é
ASCII). Sem isso o S3 serve o objeto como `video/mp4` e o navegador **toca o vídeo** em vez
de baixar.

Isso não tem conserto no cliente: o atributo `download` de uma âncora é ignorado em URL
cross-origin, e baixar como blob carregaria o vídeo inteiro na memória.

Com o header no lugar, `window.location.href = url` basta — o navegador reconhece o anexo,
baixa, e não sai da página.

---

## Ligação com o React

```ts
const [snapshot, send] = useMachine(uploaderMachine)
```

O ator é criado e iniciado na **montagem**, não no submit. É isso que torna `idle`, `RESET`
e `RETRY` possíveis.

- Renderize por `snapshot.matches("uploading")`. Com os filhos de `compressing`,
  `snapshot.value` vira `{ compressing: "streaming" }`, mas `matches("compressing")`
  continua funcionando; use `matches({ compressing: "reconnecting" })` para a cópia
  específica.
- Gate de botões com `snapshot.can({ type: "CANCEL" })`, para a regra viver só na máquina.
- Assine os emitidos com `actor.on("notify", ...)` e `actor.on("download", ...)`.

---

## Testes

Os atores são registrados como **strings** no `setup`, nunca inline no `invoke`. É o que os
torna substituíveis:

```ts
const testMachine = uploaderMachine.provide({
    actors: {
        createCompressionLogic: fromPromise(async () => ({
            compressionId: "abc",
            uploadUrl: "https://s3.test/put",
            sourceKey: "k",
        })),
    },
})
```

Depois `createActor(testMachine)`, envie eventos e verifique `snapshot.value` — sem rede.

Para testar a desistência do `reconnecting` sem esperar 15 segundos reais, extraia o delay
para `delays: { streamGiveUp: 15000 }` no `setup` e injete um relógio simulado.

---

## Pendências

- [x] `setup.ts`, `actors.ts`, `actions.ts`, `states.ts`, `index.ts` completos
- [x] máquina montada e dando boot (`createActor(uploaderMachine).start()` → `"idle"`)
- [ ] nenhum componente consome a máquina; `uploader/` só contém `machine/`
- [ ] guardas de validação (`withinSizeLimit`, `isSupportedType`, `hasFile`) — a validação
      hoje vive só no react-hook-form (`../../validation.ts`)
- [ ] nenhum teste, e nenhum runner instalado no `package.json`

## Riscos em aberto

- **Stream que não volta.** O `reconnecting` desiste em 15s, mas não há fallback de polling
  via `listCompressions()`. Não assuma que o stream sempre entrega `COMPLETED`.
- **`CANCEL` apaga o arquivo.** `resetAll` no `entry` de `idle` limpa `file`, então cancelar
  devolve o usuário ao dropzone vazio. Decisão de produto ainda não confirmada contra o
  design.
- **Tamanhos são strings.** `sourceSize`/`outputSize` são BigInt serializados. Converta
  antes de passar para `formatBytes` (`lib/format.ts`).
- **`uploadedPercent` não é arredondado.** `uploadToS3` reporta `(loaded / total) * 100`,
  então chega como `43.7213…`. Arredonde na UI.
- **Sessão.** `ensureSession()` só é chamado em `requestCompression`. Se a sessão morrer no
  meio do fluxo, o SSE toma 401 e a máquina só vê um `STREAM_ERROR` genérico.
