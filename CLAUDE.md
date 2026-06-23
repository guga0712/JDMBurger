Visão geral

App web interno para uma hamburgueria. Não é um app para clientes finais navegarem — é uma ferramenta fechada para a equipe (atendente, cozinha, admin) anotar pedidos, cadastrar clientes/produtos e acompanhar um resumo em uma dashboard.

Escopo da v1 (respeitar rigorosamente)


Sem Socket.io / tempo real ainda. O painel de pedidos da cozinha usa polling simples (refetch a cada poucos segundos) ou botão de atualizar manual. Tempo real fica para a v2 — não implementar agora, mas estruturar o código (ex: função getPedidosPendentes()) de um jeito que dê para trocar por um listener de socket depois sem reescrever tudo.
Sem redefinição de senha. Só existe criação/edição de usuário (feita por um admin). Não implementar fluxo de "esqueci minha senha", envio de e-mail, nem tokens de recuperação.
App fechado. Toda rota (exceto a de login) exige sessão autenticada. Sem cadastro público — só admin cria usuário.
Sem pagamento online, sem notificação por e-mail/SMS — fora de escopo por enquanto.


Stack


Framework: Next.js 14+ (App Router), TypeScript estrito
UI: Tailwind CSS + shadcn/ui
Banco: PostgreSQL + Prisma ORM
Autenticação: NextAuth.js, provider de Credentials (email/senha)
Validação: Zod em toda rota de API (nunca confiar em dado vindo do client sem validar)
Hash de senha: bcrypt


Modelo de dados (inicial — ajustar conforme necessário)


Usuario: id, nome, email, senhaHash, papel (admin | atendente | cozinha), criadoEm
Cliente: id, nome, telefone, endereco (opcional, para delivery)
Produto: id, nome, categoria, preco, disponivel (boolean)
Pedido: id, clienteId, status (recebido | preparando | pronto | entregue), tipo (mesa | retirada | delivery), formaPagamento, criadoEm
ItemPedido: id, pedidoId, produtoId, quantidade, observacao (opcional)


Segurança (não negociável, mesmo em MVP)


Senha sempre com hash bcrypt — nunca salvar ou logar senha em texto puro
Toda rota de API (/app/api/**) valida entrada com schema Zod antes de tocar no banco
Rotas protegidas por papel: atendente não acessa telas de admin, cozinha só vê o painel de pedidos
Sessão via NextAuth (cookie httpOnly), nunca implementar autenticação manual com JWT cru
Nunca expor senhaHash em nenhuma resposta de API


Identidade visual


Paleta: preto e vermelho, tema escuro, alto contraste
Definir as cores como tokens no tailwind.config (ex: primary = vermelho, background = preto/cinza-escuro quase preto, surface = um tom de cinza-escuro para cards)
Evitar vermelho puro (#FF0000) em fundos grandes — preferir um vermelho mais profundo/queimado para não cansar a vista; manter texto sempre com bom contraste (branco ou cinza claro sobre fundo escuro)
Botões de ação principal (confirmar pedido, marcar como pronto) em vermelho; navegação e estrutura em preto/cinza-escuro


Convenções de código


TypeScript estrito, sem any
Nomes de variáveis e funções em inglês; textos de UI (labels, botões) em português
Componentes pequenos e reutilizáveis (ex: PedidoCard, ProdutoForm)
Commits pequenos e descritivos


O que NÃO fazer agora


Não implementar Socket.io/WebSocket
Não implementar recuperação de senha
Não implementar pagamento online
Não adicionar cadastro público de usuário (só admin cria)
