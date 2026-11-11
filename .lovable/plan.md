# SolidAuto (Fabriaço) — protótipo visual navegável

Protótipo só visual, dados fictícios fixos, em português, seguindo o briefing enviado na íntegra.

## Identidade
- Logos enviadas usadas sem alteração (cor, negativo, símbolo, símbolo para fundo escuro); favicon a partir do símbolo.
- Tema MD3 com semente Roxo #410FA0 e todos os tokens do briefing (textos, fundos, status, menu preto, gradiente hero, sombra roxa).
- Fontes Inter + JetBrains Mono. Cantos: cartões 20px, campos 12px, botões pílula, chips 8px.

## Telas (cada uma com sua página)
- `/` Login (com variante primeiro acesso e estado de erro; transição roxa ao entrar)
- `/home` Projetos vinculados (cartão hero, busca, grade, diálogo de remover, estados vazios)
- `/etapa/1` Leitura da montagem
- `/etapa/2` Árvore e quantidades (Lista | Organograma com zoom/arraste)
- `/etapa/3` Comerciais e referências (seletor CM | REF | Projeto, etiqueta "Alterado por você")
- `/etapa/4`, `/5`, `/6` Em breve (ícone animado)
- `/etapa/7` Relatório por severidade
- `/usuarios` Lista + novo usuário
- `/estilo` Página escondida com paleta, tipografia, componentes e animações

Menu lateral preto fixo com projeto ativo, etapas (4–6 bloqueadas), Usuários e rodapé com avatar e Sair.

## Animações
Molas Framer Motion (padrão 400/30, elástica 500/18, tela 260/32), respeitando redução de movimento: ripple e press nos botões, botão que processa (spinner → check), rótulo flutuante e shake em erro, olho da senha com morph, indicadores deslizantes (layoutId) em segmentos e menu, cartões que expandem para o projeto, cascata em linhas, árvore com altura animada, badges com pop, contadores rolando, skeleton com brilho, toasts de baixo, fade-through entre telas.

## Detalhes técnicos
- Instalar `framer-motion`; módulo central `src/lib/theme.ts` (cores, formas, tipografia, molas) + tokens em `styles.css`.
- Componentes próprios MD3 em `src/components/md3/` (Button, TextField, Segmented, Chip, Badge, Counter, Toast, Dialog, Skeleton).
- Dados fictícios em `src/data/mock.ts`; estado de "sessão/projeto ativo" só em memória (contexto React).
- Layout com menu em rota pai pathless `_app` que renderiza `<Outlet />`; head() próprio em cada rota.
- Largura mínima 1040px, sem versão mobile.
