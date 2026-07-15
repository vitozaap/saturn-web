# Task: M6 — Polish & fidelidade (stretch)

**Status:** ⬜ não iniciada
**Criada:** 2026-07-15 (revisada 2026-07-15: design v2 removeu formato de saída, % real e cancel pós-fila — task encolheu pra polish visual)
**Depende de:** M5.
**Escopo:** só `web/`.
**Referência:** `../plano-frontend.md` + design `Squish - Final.dc.html`.

## Objetivo

Passada final de fidelidade visual e microinterações contra o design.

## Mudanças

- Confetti no Resultado, animação squish no thumbnail, badge −% com popTilt, elementos flutuantes da landing (bob).
- Barra indeterminada da fase Comprimindo com o gradiente roxo→rosa e timing do design (`indet 1.25s`).
- Transições de tela (fadeIn/slideUp), frases de status com `statusIn`.
- Hover states, badges rotacionados, sombras — conferir 1:1 com o design nos dois temas.
- Acessibilidade: foco visível, `aria-live` no status da compressão, contraste no dark mode.

## Verificação

- Comparação lado a lado com o protótipo (telas Landing, Comprimindo nas duas fases, Erro, Resultado, Histórico) em claro e escuro.
- Animações não causam layout shift; `prefers-reduced-motion` respeitado.

## Checklist

- [ ] Confetti + microinterações do Resultado
- [ ] Barra indeterminada fiel (gradiente + timing)
- [ ] Transições e frases animadas
- [ ] Passada visual 1:1 nos dois temas
- [ ] Reduced motion + aria-live
