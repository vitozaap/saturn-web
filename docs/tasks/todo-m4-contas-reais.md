# Task: M4 — Contas reais

**Status:** ⬜ não iniciada
**Criada:** 2026-07-15
**Depende de:** M3.
**Escopo:** `api/` + `web/`. Primeira task que muda a API.
**Referência:** `../plano-frontend.md` (gap 3).

## Objetivo

Login/signup com email/senha. Usuário anônimo que cria conta pelo banner do Resultado mantém as compressões.

## Mudanças

### API — `src/config/auth/auth.config.service.ts`
- Habilitar `emailAndPassword: { enabled: true }`.
- Handler `onLinkAccount` no plugin `anonymous({ ... })` migrando `Compression.userId` do user anônimo pro novo usuário.
  - ⚠️ Sem isso, better-auth deleta o user anônimo após o link e o `onDelete: Cascade` (`prisma/schema.prisma:47`) apaga as compressões junto.

### Web
- `app/login/page.tsx` (ou dialog): sign-in e sign-up com email/senha via `authClient`.
- Banner de convite na tela Resultado (usuário anônimo): email → cria conta → converte a sessão anônima (link) → toast "Conta criada!" → vai pro histórico. Botões "Agora não" / fechar.
- Header: avatar com menu (Histórico, Sair); "Entrar" leva pro login.
- Sign-out via `authClient.signOut()`.

## Verificação

- Comprimir anônimo → criar conta pelo banner → `/history` mostra a compressão feita antes do signup (migração funcionou).
- Login/logout funcionam; sessão persiste após reload.
- Conferir no banco: `Compression.userId` aponta pro user novo; user anônimo removido.

## Checklist

- [ ] API: `emailAndPassword` habilitado
- [ ] API: `onLinkAccount` migra compressões
- [ ] Web: página/dialog de login + signup
- [ ] Web: banner de convite no Resultado (fluxo de conversão)
- [ ] Web: avatar/menu + sign-out
- [ ] Verificação da migração anônimo → conta
