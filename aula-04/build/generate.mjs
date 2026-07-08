/* =====================================================================
   Gerador estático da AULA 04 · Squads de Agentes.
   Fonte única da verdade: o array `squads` abaixo + cada prompt-montagem.md
   lido do disco (embutido verbatim no botão "Copiar prompt").
   Roda local: `node build/generate.mjs`. Não vai para produção.
   ===================================================================== */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..');                 // .../aula-04
const SQUADS_DIR = 'D:\\VibeCode\\Aula\\squads';      // fonte dos prompts

/* ---------- ícones (Lucide-style, 24x24, stroke=currentColor) ---------- */
export const I = {
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 15-5-5L5 21"/>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-11.6 7.8L3 21l1.7-6.4A8.4 8.4 0 1 1 21 11.5Z"/>',
  clipboard: '<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  tag: '<path d="M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0L3.6 11.6A2 2 0 0 1 3 10.2V4a1 1 0 0 1 1-1h6.2a2 2 0 0 1 1.4.6Z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-3Z"/><path d="m9.5 12 2 2 3.5-3.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  star: '<path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 2.6 1.2-6L3.3 9.4l6.1-.8L12 3Z"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.5 12.5 8-8M16 5l3 3M14 7l2.5 2.5"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1.5v3M15 1.5v3M9 19.5v3M15 19.5v3M1.5 9h3M1.5 15h3M19.5 9h3M19.5 15h3"/><rect x="10" y="10" width="4" height="4" rx=".5"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="13.5" r="1.2"/><circle cx="15" cy="13.5" r="1.2"/>',
  wrench: '<path d="M14.5 5.5a4 4 0 0 0 5 5l-1.8 1.8 4 4a2.1 2.1 0 0 1-3 3l-4-4-1.8 1.8a4 4 0 0 1-5-5L4 16 8 12l-1.9-5.6L9.5 4Z"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  play: '<path d="M7 4.5 19 12 7 19.5v-15Z"/>',
  plug: '<path d="M9 2v6M15 2v6M7 8h10v2a5 5 0 0 1-10 0V8ZM12 15v7"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  sparkles: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z"/>',
};
export const svg = (k, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${w ? ` style="width:${w}px;height:${w}px"` : ''}>${I[k]}</svg>`;

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* =====================================================================
   DADOS DOS 10 SQUADS
   ===================================================================== */
export const squads = [
  {
    n: '01', slug: '01-prospeccao', icon: 'target',
    title: 'Prospecção B2B Local',
    tagline: 'Google Maps + E-mail + WhatsApp',
    card: 'Captura leads qualificados direto do Google Maps, dispara e-mails de apresentação e follow-up e gera um painel de WhatsApp pronto pra usar.',
    whatIs: 'Um squad que automatiza a prospecção comercial B2B local de ponta a ponta. Ele varre o Google Maps por estabelecimentos do seu segmento, coleta os contatos, valida tudo e prepara as mensagens — você só aprova e dispara.',
    forWho: 'Equipes comerciais, freelancers e agências que precisam prospectar negócios locais (clínicas, restaurantes, salões, escritórios) sem comprar bases de dados nem fazer raspagem manual.',
    agents: [
      ['validador', 'Checa Playwright + Chromium (instala se faltar) e valida a chave do Composio — só se você for usar e-mail.'],
      ['captador', 'Coleta leads no Maps (headless): nome, e-mail, celular, site, nota e avaliações; deduplica e sinaliza fora do segmento.'],
      ['disparador', 'Envia os e-mails via Composio — só o template que você aprovou, com teste de fumaça opcional e trava de envio.'],
      ['whatsapp', 'Gera um painel HTML com botões wa.me por lead, busca e contador — para envio manual.'],
    ],
    skills: [
      ['validar-playwright', 'Confere e instala Playwright + Chromium se faltarem.'],
      ['prospectar-playwright', 'Varredura headless do Google Maps.'],
      ['enviar-email-composio', 'Disparo de e-mail via Composio com trava humana.'],
      ['gerar-painel-whatsapp', 'Cria o painel estático com wa.me por lead.'],
    ],
    premises: [
      { kind: 'key', title: 'COMPOSIO_API_KEY — só se for enviar e-mail', html: 'Para disparar e-mails, preencha <span class="keytag">COMPOSIO_API_KEY</span> em <code>config/.env</code>. Pegue a chave em <a href="https://composio.dev" target="_blank" rel="noopener">composio.dev</a> e conecte sua conta de e-mail lá. Se você for usar <b>só WhatsApp</b>, a chave é opcional.' },
      { kind: 'dep', title: 'Python 3.10+ e Playwright', html: 'O squad usa Playwright headless para ler o Google Maps. Se faltar Playwright ou Chromium, o próprio <code>validador</code> instala no Passo 0.' },
    ],
    start: 'iniciar squad',
    gates: [
      { kind: 'warn', title: 'Aprovação obrigatória do template', html: 'Nenhum e-mail é disparado sem você escolher e aprovar o modelo. O disparador nunca decide o texto sozinho.' },
    ],
    outputs: ['output/leads.csv — leads coletados e validados', 'Tabela visual dos leads para revisão', 'output/painel-whatsapp.html — botões de WhatsApp por lead'],
  },

  {
    n: '02', slug: '02-espionagem-youtube', icon: 'eye',
    title: 'Espionagem YouTube',
    tagline: 'TranscriptAPI via MCP',
    card: 'Espiona canais concorrentes, analisa o que performa e reescreve tudo em roteiros e posts 100% originais — YouTube, Reels, Stories e legendas.',
    whatIs: 'Um squad de inteligência competitiva para conteúdo. Ele coleta os vídeos recentes de um canal concorrente pela TranscriptAPI, entende os padrões de performance e reescreve o conteúdo em roteiros e posts originais para vários formatos.',
    forWho: 'Produtores de conteúdo, social media e agências que querem análise competitiva e um pacote de conteúdo reescrito numa rodada só.',
    agents: [
      ['espiao', 'Coleta vídeos + transcrições via MCP da TranscriptAPI e analisa os padrões de performance.'],
      ['roteirista', 'Reescreve a análise em 3 roteiros originais: YouTube longo, Reel vertical e Stories de 6 cenas.'],
      ['redator-social', 'Gera posts para X/Threads, legendas de Instagram/LinkedIn e os títulos, a descrição e as tags do YouTube.'],
      ['diretor-de-arte', 'Cria prompts de imagem (texto) para thumbnails, capas e posts sociais.'],
    ],
    skills: [
      ['transcriptapi-coletar', 'Integra com as ferramentas MCP da TranscriptAPI.'],
      ['reescrita-roteiro', 'Reescreve a análise em roteiros originais (com checagem de originalidade).'],
      ['posts-legendas-youtube', 'Gera posts, legendas e metadados do YouTube.'],
      ['prompts-imagem-thumbnail', 'Escreve prompts de imagem para thumbnails e sociais.'],
    ],
    premises: [
      { kind: 'key', title: 'Chave da TranscriptAPI', html: 'A TranscriptAPI precisa de chave de API para puxar os vídeos e as transcrições. Coloque a sua em <code>config/.env</code> — você só diz qual configurar.' },
      { kind: 'account', title: 'Conector TranscriptAPI', html: 'Conecte a <b>TranscriptAPI</b> no Claude (Configurações → Conectores). Ranquear por histórico de views consome créditos e é opcional.' },
    ],
    start: 'iniciar squad',
    gates: [
      { kind: 'info', title: 'Só texto — nada é publicado', html: 'O squad entrega inteligência + conteúdo reescrito. Ele não publica, não chama API de imagem e não edita vídeo.' },
    ],
    outputs: ['output/concorrente/<canal>/ — vídeos coletados + análise', 'output/roteiros/<canal>/ — roteiros de YouTube, Reel e Stories', 'output/social/<canal>/ — posts e legendas para redes sociais', 'output/imagens/<canal>/ — prompts de imagem'],
  },

  {
    n: '03', slug: '03-imagem-google-ai', icon: 'image',
    title: 'Imagem Profissional',
    tagline: 'Google AI Studio · Gemini',
    card: 'De um briefing a um pacote de imagens profissionais, já ranqueadas por QA visual e com um contato-sheet HTML pronto.',
    whatIs: 'Um squad de geração de imagem com qualidade de direção de arte. Você passa um briefing (objetivo, estilo, paleta, texto) e ele devolve variações profissionais geradas pela API do Google AI Studio, já avaliadas e ranqueadas, com um contato-sheet visual.',
    forWho: 'Designers, criadores de conteúdo, produtoras e agências que querem variações profissionais sem ficar tentando prompt no escuro.',
    agents: [
      ['diretor-criativo', 'Orquestrador: valida pré-requisitos, conduz o briefing (7 perguntas) e coordena o fluxo.'],
      ['engenheiro-de-prompt', 'Traduz o briefing em um prompt técnico estruturado em 9 blocos (EN + PT-BR).'],
      ['artista-visual', 'Chama a API do Google AI Studio e gera as N variações em PNG com metadata.'],
      ['curador', 'Abre cada imagem, aplica QA visual ponderado, ranqueia o Top 3 e gera o contato-sheet.'],
    ],
    skills: [
      ['prompt-estruturado-imagem', 'Organiza o briefing em 9 blocos canônicos de prompt.'],
      ['google-ai-studio-gerar', 'Encapsula a chamada à API do Google AI Studio.'],
      ['qa-curadoria-imagem', 'Critérios de QA, ranking ponderado e contato-sheet HTML.'],
    ],
    premises: [
      { kind: 'key', title: 'GOOGLE_AI_API_KEY', html: 'Preencha <span class="keytag">GOOGLE_AI_API_KEY</span> em <code>config/.env</code>. Gere a chave (grátis) em <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> com sua conta Google. Sem ela, o squad para antes de qualquer pergunta.' },
      { kind: 'dep', title: 'Python + 2 pacotes', html: 'Instale os pacotes com <code>pip install google-genai python-dotenv</code>. O Passo 0 confere isso pra você.' },
    ],
    start: 'iniciar squad',
    gates: [],
    outputs: ['output/imagens-profissionais/<id>/ — as imagens profissionais geradas (PNG), prontas pra usar', 'output/imagens-profissionais/<id>/ranking.md — avaliação de QA com o Top 3 ranqueado', 'output/imagens-profissionais/<id>/index.html — contato-sheet visual pra comparar as variações'],
  },

  {
    n: '04', slug: '04-instagram-respostas', icon: 'message',
    title: 'Respostas no Instagram',
    tagline: 'Comentários via Composio',
    card: 'Coleta os comentários novos, classifica em 5 categorias e redige a resposta no tom da marca — você revisa e aprova num dashboard antes de publicar.',
    whatIs: 'Um squad que cuida do engajamento dos comentários do Instagram. Ele puxa os comentários novos via Composio, classifica cada um, escreve a resposta no tom do perfil e monta um dashboard visual para você aprovar antes de qualquer publicação.',
    forWho: 'Criadores e social media que recebem muitos comentários e querem responder rápido, no tom certo, sem perder o controle humano.',
    agents: [
      ['coletor', 'Puxa os comentários ainda não respondidos via Composio.'],
      ['classificador', 'Categoriza cada comentário em 5 tipos, com score de confiança.'],
      ['redator', 'Redige a resposta no tom da marca, lendo a knowledge-base do perfil.'],
      ['sinalizador', 'Filtra ruído, separa o que pode auto-responder do que precisa de revisão e gera o dashboard.'],
    ],
    skills: [
      ['validar-composio-instagram', 'Passo 0: valida a chave e a conexão do Instagram.'],
      ['composio-instagram-comentarios', 'Lista mídias e comentários via Composio.'],
      ['classificar-comentario-ig', 'Classifica o comentário em 5 categorias.'],
      ['redigir-resposta-ig', 'Escreve a resposta no tom da marca.'],
      ['gerar-dashboard-ig', 'Monta o dashboard HTML + resumo.'],
      ['publicar-resposta-ig', 'Publica via Composio — só após sua aprovação.'],
    ],
    premises: [
      { kind: 'key', title: 'COMPOSIO_API_KEY', html: 'Preencha <span class="keytag">COMPOSIO_API_KEY</span> em <code>config/.env</code> (pegue em <a href="https://app.composio.dev" target="_blank" rel="noopener">app.composio.dev</a>).' },
      { kind: 'account', title: 'Instagram conectado no Composio', html: 'Conecte sua conta do Instagram no painel do Composio — ele resolve o token internamente. Sem conexão ativa, rode em <b>modo DEMO</b> (usa um exemplo, não envia nada).' },
      { kind: 'data', title: 'Knowledge-base do perfil', html: 'O arquivo <code>knowledge-base/perfil-*.md</code> define tom de voz, pilares e o que NÃO dizer. Os agentes leem esse arquivo — você só ajusta ao seu perfil.' },
    ],
    start: 'iniciar squad',
    gates: [
      { kind: 'gate', title: 'Nada é publicado sem aprovação', html: 'O squad coleta, classifica e redige. A publicação só acontece depois que você revisa no dashboard e libera.' },
    ],
    outputs: ['output/comentarios-<data>.json — comentários coletados', 'output/classificados-<data>.json — com categorias', 'output/respostas-<data>.json — respostas redigidas', 'output/dashboard-<data>.html — painel de aprovação'],
  },

  {
    n: '05', slug: '05-rh-triagem', icon: 'clipboard',
    title: 'RH · Triagem de CVs',
    tagline: 'Matriz decisória com pesos',
    card: 'Pontua cada currículo contra a vaga numa matriz de pesos e devolve um ranking auditável — com evidência textual e gaps por candidato.',
    whatIs: 'Um squad que transforma a triagem subjetiva de currículos em um processo reproduzível. Ele lê a vaga, pontua cada CV em 10 critérios técnicos (0–10, com a evidência que justifica a nota) e aplica uma matriz de pesos para gerar um ranking final.',
    forWho: 'Recrutadores e times técnicos que precisam priorizar entrevistas com critérios claros, auditáveis e iguais para todos.',
    agents: [
      ['triagem', 'Orquestrador: conduz o onboarding, carrega a vaga e os CVs, define a matriz e dispara o fluxo.'],
      ['avaliador', 'Lê cada CV e atribui nota 0–10 por critério, sempre com evidência textual.'],
      ['ponderador', 'Aplica os pesos, calcula o score ponderado final e monta o ranking em markdown.'],
    ],
    skills: [
      ['parsear-vaga-md', 'Extrai obrigatórios e diferenciais do arquivo da vaga.'],
      ['scoring-curriculo', 'Aplica a rubrica 0–10 por critério em cada CV.'],
      ['matriz-ponderada', 'Calcula Σ(nota×peso)/Σ(peso) e gera o ranking.'],
    ],
    premises: [
      { kind: 'free', title: 'Sem API key paga', html: '100% offline — o cálculo é aritmética simples. Não precisa de chave nem internet.' },
      { kind: 'data', title: 'Coloque a vaga e os CVs', html: 'Ponha 1 vaga em <code>vagas/</code> e os currículos em <code>cvs/</code> (o squad já vem com 20 CVs de exemplo e 1 vaga modelo para você testar na hora).' },
    ],
    start: 'iniciar squad',
    gates: [
      { kind: 'info', title: 'Pesos customizáveis', html: 'A matriz vem com 10 critérios padrão, mas você pode trocar os pesos no onboarding. Tudo fica registrado para auditoria.' },
    ],
    outputs: ['output/scores-<data>.json — notas + evidências por candidato', 'output/ranking-<vaga>-<data>.md — Top N, ranking completo e gaps'],
  },

  {
    n: '06', slug: '06-oferta-hormozi', icon: 'tag',
    title: 'Oferta Hormozi',
    tagline: 'Planejamento ponta a ponta',
    card: 'Aplica o framework $100M Offers e entrega ângulos de oferta completos — do avatar à entrega — num HTML navegável estilo Hormozi.',
    whatIs: 'O squad mais robusto da turma: 14 agentes e 13 skills que aplicam o framework de Alex Hormozi ($100M Offers) para construir ofertas irrecusáveis. Ele monta o avatar, a dor, a equação de valor, bônus, preço, funil, tráfego, vendas e operação — e consolida tudo num HTML bonito e navegável.',
    forWho: 'Infoprodutores, freelancers, agências e prestadores de serviço que querem testar ângulos de oferta com plano operacional completo.',
    agents: [
      ['maestro', 'Onboarding (8 perguntas), define os ângulos e dispara as cadeias.'],
      ['avatar-hunter', 'Define o avatar: demografia, psicografia e sintomas.'],
      ['dor-bleeding-neck', 'Acha a dor raiz, o custo de não resolver e as falsas crenças.'],
      ['veiculo-solucao', 'Formula a promessa, o mecanismo único e a transformação.'],
      ['equacao-valor', 'Aplica a equação de valor (sonho ↑, probabilidade ↑, tempo ↓, esforço ↓).'],
      ['bonus-stacker', 'Empilha bônus que multiplicam o valor percebido.'],
      ['scarcity-urgency', 'Escassez, urgência, garantia e reversão de risco.'],
      ['naming-hook', 'Nome da oferta, headlines e pitch de uma frase.'],
      ['pricing-architect', 'Preço, ancoragem, tiers e upsell/downsell.'],
      ['funnel-architect', 'VSL, opt-in, OTO, order bump e sequência de e-mail.'],
      ['traffic-strategist', 'Canais, budget, criativos e cronograma.'],
      ['sales-closer', 'Discovery, pitch, 20 objeções e follow-up.'],
      ['fulfillment-ops', 'Entrega, KPIs, churn e stack técnica.'],
      ['consolidador-html', 'Monta o HTML final estilo Hormozi (abas, Mermaid, tabelas).'],
    ],
    skills: [
      ['cavar-avatar', 'Define o avatar completo.'],
      ['mapear-dor', 'Acha a dor raiz e o custo de não resolver.'],
      ['definir-veiculo', 'Promessa + mecanismo único + transformação.'],
      ['calcular-equacao-valor', 'Aplica a fórmula de valor de Hormozi.'],
      ['empilhar-bonus', 'Empilha bônus com valor ancorado (10:1).'],
      ['gatilhos-garantia', 'Escassez, urgência e garantia.'],
      ['nomear-oferta', 'Nome, headlines e pitch.'],
      ['arquitetar-preco', 'Preço, ancoragem, tiers e upsell.'],
      ['mapear-funil', 'Funil, copy das páginas, VSL e e-mails.'],
      ['planejar-trafego', 'Canais, budget, criativos e métricas.'],
      ['roteirizar-close', 'Discovery, pitch, objeções e fechamento.'],
      ['planejar-ops', 'Onboarding, entrega, KPIs e churn.'],
      ['consolidar-html-ofertas', 'Gera o HTML final com Mermaid via CDN.'],
    ],
    premises: [
      { kind: 'free', title: 'Sem API key paga', html: '100% generativo local — não usa integração externa. Só gera arquivos Markdown e HTML.' },
      { kind: 'dep', title: 'Internet na 1ª carga do HTML', html: 'O HTML final usa Mermaid.js via CDN para desenhar os diagramas de funil. Sem internet, os diagramas aparecem como código (fallback).' },
    ],
    start: 'iniciar squad demo',
    startNote: 'Use <code>iniciar squad demo</code> (1 ângulo, rápido — ideal para começar). O modo completo <code>iniciar squad</code> roda 3 ângulos (A/B/C + comparativo, ~36 arquivos) e é bem mais pesado.',
    gates: [
      { kind: 'warn', title: 'Dois modos: demo vs completo', html: 'O <b>demo</b> entrega 1 ângulo com a cadeia completa de 12 agentes — perfeito para entender. O <b>completo</b> gera 3 ângulos em paralelo; deixe para quando quiser o pacote inteiro.' },
    ],
    outputs: ['output/<produto>/briefing.md — o resumo do onboarding', 'output/<produto>/angulo-A-*/ — os 12 entregáveis da cadeia', 'output/<produto>/plano-mestre.html — o plano navegável estilo Hormozi'],
  },

  {
    n: '07', slug: '07-deep-research', icon: 'search',
    title: 'Deep Research',
    tagline: 'Pesquisa de mercado com fontes',
    card: 'Transforma uma pergunta de negócio num relatório executivo multi-seção onde cada afirmação tem uma fonte citada.',
    whatIs: 'Um squad de pesquisa de mercado profunda. Você faz uma pergunta de negócio e um planejador a quebra em sub-perguntas; vários pesquisadores rodam em paralelo (WebSearch + WebFetch), um verificador descarta o que não tem fonte e um redator monta o relatório final com citações numeradas.',
    forWho: 'Empreendedores, times de produto e marketing que precisam de um panorama de mercado confiável antes de decidir (abrir loja, lançar produto, entrar num nicho).',
    agents: [
      ['maestro-pesquisa', 'Orquestrador: onboarding, dispara os pesquisadores em paralelo e encadeia verificação → redação.'],
      ['planejador', 'Quebra a pergunta em 4–7 sub-perguntas independentes.'],
      ['pesquisador', 'Recebe UMA sub-pergunta, busca, abre as fontes e devolve achados fichados.'],
      ['verificador', 'Descarta afirmações sem fonte, marca confiança e remove duplicatas.'],
      ['redator-relatorio', 'Sintetiza tudo num relatório executivo com citações [n], em HTML e Markdown.'],
    ],
    skills: [
      ['planejar-pesquisa', 'Quebra a pergunta cobrindo TAM, personas, concorrentes e tendências.'],
      ['buscar-e-fichar', 'Pipeline WebSearch → WebFetch → fichamento com fonte obrigatória.'],
      ['verificar-fontes', 'Critérios de credibilidade, níveis de confiança e deduplicação.'],
      ['montar-relatorio-html', 'Template HTML responsivo + espelho em Markdown.'],
    ],
    premises: [
      { kind: 'free', title: 'Sem API key paga', html: 'Usa WebSearch e WebFetch, que já são nativos do Claude Code. Não há <code>.env</code> nem segredos para configurar.' },
    ],
    start: 'iniciar squad',
    gates: [
      { kind: 'info', title: 'Nunca inventa números', html: 'Todo achado precisa de fonte (URL). O que não tiver fonte é sinalizado ou removido pelo verificador.' },
    ],
    outputs: ['output/relatorios/<id>/plano.json — as sub-perguntas', 'output/relatorios/<id>/achados/ — fichamentos por sub-pergunta', 'output/relatorios/<id>/relatorio.html — o relatório final responsivo'],
  },

  {
    n: '08', slug: '08-dossie-concorrencia', icon: 'shield',
    title: 'Dossiê de Concorrência',
    tagline: 'Competitive intelligence',
    card: 'De 2 a 4 URLs de concorrentes a um dossiê estilo consultoria: matriz comparativa, SWOT, gaps de mercado e battle cards.',
    whatIs: 'Um squad que transforma os sites dos seus concorrentes em um dossiê comparativo profissional. Ele "abre" cada site com Playwright headless, pesquisa a reputação externa com WebSearch e monta matriz comparativa, SWOT por concorrente, gaps de mercado e battle cards de diferenciação.',
    forWho: 'Founders, times de produto/marketing, consultores e agências que precisam mapear o terreno competitivo sem ferramentas pagas.',
    agents: [
      ['maestro-dossie', 'Orquestrador: onboarding e coordenação paralela do pipeline.'],
      ['validador', 'Passo 0: checa Python, Playwright, Chromium e a pasta output.'],
      ['coletor-site', 'Lê 1 URL com Playwright headless e extrai proposta, ofertas e preços.'],
      ['pesquisador-externo', 'Busca reputação externa (reviews, notícias) com fontes.'],
      ['analista', 'Monta a matriz comparativa, o SWOT e identifica os gaps.'],
      ['redator-dossie', 'Gera o entregável final: battle cards, ângulos e HTML + Markdown.'],
    ],
    skills: [
      ['validar-playwright', 'Checa e instala Python, Playwright e Chromium.'],
      ['ler-site-concorrente', 'Abre a URL headless e extrai dados em JSON.'],
      ['pesquisar-reputacao-externa', 'Coleta reputação/notícias com a fonte incluída.'],
      ['montar-matriz-swot', 'Cruza coleta + reputação em matriz, SWOT e gaps.'],
      ['gerar-dossie-html', 'Renderiza o HTML estilo consultoria + Markdown.'],
    ],
    premises: [
      { kind: 'free', title: 'Sem API key paga', html: 'Usa só Playwright local (headless) e WebSearch nativo. Nenhuma chave necessária.' },
      { kind: 'data', title: 'Tenha as URLs em mãos', html: 'A entrada é de 2 a 4 URLs de concorrentes (e, opcionalmente, o seu próprio site). Precisa de internet para abrir os sites e pesquisar.' },
    ],
    start: 'iniciar squad',
    gates: [
      { kind: 'info', title: 'Headless e factual', html: 'A janela do navegador nunca aparece e nada é inventado: campos sem fonte ficam vazios no relatório.' },
    ],
    outputs: ['output/dossies/<id>/concorrentes/ — dados extraídos de cada site', 'output/dossies/<id>/analise.json — matriz + SWOT + gaps', 'output/dossies/<id>/dossie.html — o dossiê final'],
  },

  {
    n: '09', slug: '09-calendario-social', icon: 'calendar',
    title: 'Calendário Social',
    tagline: '30 dias de conteúdo prontos',
    card: 'Transforma um nicho num calendário editorial de 30 dias com cada legenda já escrita no tom da marca — num grid visual colorido.',
    whatIs: 'Um squad que acaba com o "o que eu posto amanhã?". A partir de um nicho/marca, ele pesquisa tendências reais, define os pilares de conteúdo, distribui 30 dias equilibrados e escreve cada legenda — entregando um mês inteiro planejado e redigido numa rodada.',
    forWho: 'Criadores, social media, agências e pequenos negócios que precisam de presença consistente sem travar na página em branco.',
    agents: [
      ['maestro-conteudo', 'Orquestrador: conduz o onboarding e encadeia os subagentes.'],
      ['pesquisador-tendencias', 'Pesquisa temas quentes do nicho via WebSearch, com fontes.'],
      ['estrategista-pilares', 'Define 4–5 pilares de conteúdo e o mix de formatos.'],
      ['planejador-calendario', 'Distribui os 30 dias equilibrando pilares e frequência.'],
      ['redator-posts', 'Escreve cada legenda em PT-BR, com hashtags e sugestão visual.'],
      ['consolidador-html', 'Monta o grid visual de 30 dias com os posts expansíveis.'],
    ],
    skills: [
      ['pesquisar-tendencias-nicho', 'Busca tendências do nicho com fonte.'],
      ['definir-pilares', 'Deriva pilares e mix de formatos por plataforma.'],
      ['montar-calendario', 'Distribui os 30 dias.'],
      ['escrever-legendas', 'Redige as legendas no tom da marca.'],
      ['gerar-calendario-html', 'Gera o grid colorido por pilar.'],
    ],
    premises: [
      { kind: 'free', title: 'Sem API key paga', html: 'As tendências vêm do WebSearch nativo do Claude Code. Só valida que o WebSearch está disponível e que a pasta output é gravável.' },
    ],
    start: 'iniciar squad',
    gates: [
      { kind: 'info', title: 'Data de início obrigatória', html: 'O squad nunca chuta datas — você informa a data de início e ele monta o calendário a partir dela.' },
    ],
    outputs: ['output/calendarios/<id>/calendario.md — o calendário legível', 'output/calendarios/<id>/posts.md — todas as legendas prontas', 'output/calendarios/<id>/calendario.html — grid visual colorido por pilar'],
  },

  {
    n: '10', slug: '10-guardiao-reputacao', icon: 'star',
    title: 'Guardião da Reputação',
    tagline: 'Reviews · sentimento · respostas',
    card: 'Monitora reviews, classifica o sentimento, detecta risco de crise e redige a resposta no tom da marca — você só aprova e publica.',
    whatIs: 'Um squad que cuida da reputação de um negócio local ou e-commerce. Ele coleta reviews recentes (Google Maps via Playwright), classifica o sentimento, detecta risco de crise, agrupa temas e redige uma resposta para cada review — entregando um painel e uma fila para você aprovar.',
    forWho: 'Donos de negócio local (restaurantes, clínicas, salões, lojas), e-commerces, social media e agências.',
    agents: [
      ['maestro-reputacao', 'Orquestrador do fluxo, onboarding e síntese final.'],
      ['validador', 'Verifica Python, Playwright, Chromium e a pasta output.'],
      ['coletor-reviews', 'Extrai os reviews do Google Maps via Playwright headless.'],
      ['analista-sentimento', 'Classifica sentimento, detecta crise e agrupa temas.'],
      ['redator-respostas', 'Redige a resposta profissional no tom da marca.'],
      ['sintetizador', 'Monta o painel HTML + a fila de respostas em markdown.'],
    ],
    skills: [
      ['validar-playwright', 'Verifica/instala Python, Playwright e Chromium.'],
      ['coletar-reviews', 'Coleta headless do Google Maps (+ WebSearch opcional).'],
      ['classificar-sentimento', 'Sentimento, score, risco e temas recorrentes.'],
      ['redigir-resposta-review', 'Redige a resposta com gate de aprovação.'],
      ['gerar-painel-reputacao-html', 'Monta o painel responsivo + a fila.'],
    ],
    premises: [
      { kind: 'free', title: 'Sem API key paga', html: 'Usa Playwright headless (Google Maps público) e WebSearch nativo. Playwright/Chromium são instalados no Passo 0 se faltarem. Precisa de Python 3.10+ e internet.' },
    ],
    start: 'iniciar squad',
    gates: [
      { kind: 'gate', title: 'Gate humano: nunca publica sozinho', html: 'Este squad <b>nunca</b> publica nada automaticamente. Ele coleta, analisa e redige — você abre o painel, revisa/edita e copia para publicar onde quiser. Nada vai ao ar sem você.' },
    ],
    outputs: ['output/reputacao/<id>/analise.json — sentimento, risco e temas', 'output/reputacao/<id>/painel.html — dashboard de reputação', 'output/reputacao/<id>/respostas.md — fila de respostas para aprovar'],
  },
];

/* ---------- premissa: ícone + classe por tipo ---------- */
export const PREMISE_META = {
  key: { ic: 'key', cls: 'premise--key' },
  dep: { ic: 'cpu', cls: '' },
  account: { ic: 'plug', cls: '' },
  data: { ic: 'database', cls: '' },
  free: { ic: 'check', cls: 'premise--ok' },
};
export const CALLOUT_IC = { gate: 'shield', warn: 'alert', info: 'sparkles' };

/* ---------- head compartilhado ---------- */
const head = (title, cssPath, desc) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${cssPath}" />
</head>`;

const topbar = (toCourse, toHub) => `
  <header class="topbar">
    <div class="wrap">
      <a class="topbar__brand" href="${toHub}">
        <span class="logo">${svg('cpu')}</span>
        <b>Squads</b><span>· Aula 04</span>
      </a>
      <span class="topbar__spacer"></span>
      ${toHub ? `<a class="topbar__link" href="${toHub}">${svg('arrowL')} Todos os squads</a>` : ''}
      <a class="topbar__link" href="${toCourse}">${svg('arrowL')} Voltar ao curso</a>
    </div>
  </header>`;

/* =====================================================================
   HUB (aula-04/index.html)
   ===================================================================== */
function buildHub() {
  const totalAgents = squads.reduce((s, q) => s + q.agents.length, 0);
  const totalSkills = squads.reduce((s, q) => s + q.skills.length, 0);

  const cards = squads.map((q) => `
        <a class="squad" href="squads/${q.slug}.html" data-reveal>
          <div class="squad__top">
            <span class="squad__num">${q.n}</span>
            <span class="squad__ic">${svg(q.icon)}</span>
          </div>
          <h3>${esc(q.title)}</h3>
          <p class="squad__desc">${esc(q.card)}</p>
          <div class="squad__foot">
            <span class="mchip mchip--agent">${svg('bot')} ${q.agents.length}</span>
            <span class="mchip mchip--skill">${svg('wrench')} ${q.skills.length}</span>
            ${needBadge(q)}
            <span class="squad__go">Abrir ${svg('arrowR')}</span>
          </div>
        </a>`).join('');

  const body = `
  <main>
    <section class="hero">
      <div class="wrap hero__inner">
        <span class="eyebrow">Aula 04 · Automação</span>
        <h1 class="display"><span class="grad">Squads de Agentes</span></h1>
        <p class="lead">Times de IA que trabalham por você. Cada squad é um pequeno exército de agentes especializados — você cola um prompt, configura o que for preciso e digita <span class="mono" style="color:var(--green-2)">iniciar squad</span>. O resto roda sozinho.</p>
        <div class="hero__meta">
          <span class="hero__stat">${svg('cpu')} <b>10</b> squads</span>
          <span class="hero__stat">${svg('bot')} <b>${totalAgents}</b> agentes</span>
          <span class="hero__stat">${svg('wrench')} <b>${totalSkills}</b> skills</span>
        </div>
        <div class="termline">
          <span class="prompt">você@claude</span><span>~/squads $</span><span class="cmd">iniciar squad</span><span class="cursor"></span>
        </div>
      </div>
    </section>

    <section class="section" id="o-que-e">
      <div class="wrap">
        <div class="section__head" data-reveal>
          <span class="eyebrow">Conceito</span>
          <h2>O que é um squad?</h2>
          <p>Pense num time de trabalho. Em vez de você fazer tudo, um <b>orquestrador</b> distribui as tarefas para <b>agentes</b> especialistas, e cada agente segue suas <b>skills</b> (o passo a passo de como fazer). Você aprova o resultado no final.</p>
        </div>
        <div class="concepts">
          <div class="concept" data-reveal>
            <div class="concept__ic">${svg('cpu')}</div>
            <h3>Orquestrador</h3>
            <p>O maestro do time. Faz o onboarding com você, decide a ordem e aciona os agentes certos. Ele coordena — não faz o trabalho braçal.</p>
          </div>
          <div class="concept concept--violet" data-reveal>
            <div class="concept__ic">${svg('bot')}</div>
            <h3>Agentes</h3>
            <p>Especialistas com <b>uma</b> função cada (coletar, analisar, redigir...). Trabalham isolados e entregam sua parte. Vivem em <code>.claude/agents/</code>.</p>
          </div>
          <div class="concept concept--cyan" data-reveal>
            <div class="concept__ic">${svg('wrench')}</div>
            <h3>Skills</h3>
            <p>Os manuais de "como fazer" que os agentes seguem — o passo a passo técnico de cada tarefa. Vivem em <code>.claude/skills/</code>.</p>
          </div>
        </div>
        <div class="analogy" data-reveal style="margin-top:18px">
          <span class="pill">você</span><span class="arrow">→</span>
          <span class="pill">orquestrador</span><span class="arrow">→</span>
          <span class="pill">agentes</span><span class="arrow">+</span>
          <span class="pill">skills</span><span class="arrow">→</span>
          <b>resultado pronto para você aprovar</b>
        </div>
      </div>
    </section>

    <section class="section section--tight" id="anatomia">
      <div class="wrap">
        <div class="section__head" data-reveal>
          <span class="eyebrow">Anatomia</span>
          <h2>A hierarquia de pastas de um squad</h2>
          <p>Todo squad segue a mesma estrutura. Entender essas pastas é o suficiente para saber onde tudo mora — e onde você coloca suas chaves e dados.</p>
        </div>
        <div class="window" data-reveal>
          <div class="window__bar">
            <div class="window__dots"><i></i><i></i><i></i></div>
            <span class="window__file">${svg('folder', 14)} <b>nome-do-squad</b>/</span>
          </div>
          <div class="window__body">
            <div class="tree">
              <div class="tree__row"><span class="branch">├─</span><span class="ic">${svg('doc', 16)}</span><span class="self">CLAUDE.md</span><span class="tree__note">o manual-mãe: <b>o que o squad é</b> e as regras</span></div>
              <div class="tree__row"><span class="branch">├─</span><span class="ic">${svg('doc', 16)}</span><span class="self">prompt-montagem.md</span><span class="tree__note">o prompt que <b>monta o squad</b> — você cola isso no Claude Code</span></div>
              <div class="tree__row"><span class="branch">├─</span><span class="ic">${svg('folder', 16)}</span><span class="dir">config/</span></div>
              <div class="tree__row" style="padding-left:30px"><span class="branch">│&nbsp;&nbsp;├─</span><span class="file">.env.example</span><span class="tree__note">modelo das chaves (versionado, vazio)</span></div>
              <div class="tree__row" style="padding-left:30px"><span class="branch">│&nbsp;&nbsp;└─</span><span class="key">.env</span><span class="tree__note"><b>suas chaves de verdade</b> — nunca versionado</span></div>
              <div class="tree__row"><span class="branch">├─</span><span class="ic">${svg('folder', 16)}</span><span class="dir">.claude/</span></div>
              <div class="tree__row" style="padding-left:30px"><span class="branch">│&nbsp;&nbsp;├─</span><span class="dir">agents/</span><span class="tree__note">os especialistas — 1 arquivo <b>.md</b> por agente</span></div>
              <div class="tree__row" style="padding-left:30px"><span class="branch">│&nbsp;&nbsp;└─</span><span class="dir">skills/</span><span class="tree__note">os "como fazer" — 1 pasta por skill (com SKILL.md)</span></div>
              <div class="tree__row"><span class="branch">└─</span><span class="ic">${svg('folder', 16)}</span><span class="dir">output/</span><span class="tree__note">tudo que o squad <b>gera</b> fica aqui</span></div>
            </div>
          </div>
        </div>
        <div class="legend">
          <div class="legend__item" data-reveal><span class="tag tag--self">CLAUDE.md</span><p>O cérebro do projeto. O Claude Code lê esse arquivo automaticamente e entende o que o squad faz e como se comportar.</p></div>
          <div class="legend__item" data-reveal><span class="tag tag--self">prompt-montagem.md</span><p>O gerador do squad. Você copia o conteúdo dele e cola no Claude Code — ele cria os agentes, as skills e o resto sozinho.</p></div>
          <div class="legend__item" data-reveal><span class="tag tag--key">config/.env</span><p>Onde ficam suas chaves de API (quando o squad precisa). Nunca é versionado — fica só na sua máquina.</p></div>
          <div class="legend__item" data-reveal><span class="tag tag--dir">.claude/agents · skills</span><p>O coração do squad: os agentes (especialistas) e as skills (os manuais técnicos que eles seguem).</p></div>
        </div>
      </div>
    </section>

    <section class="section" id="squads">
      <div class="wrap">
        <div class="section__head" data-reveal>
          <span class="eyebrow">Biblioteca</span>
          <h2>Os 10 squads</h2>
          <p>Cada card abre uma página com o passo a passo completo: o que configurar antes, como montar e o prompt pronto para copiar.</p>
        </div>
        <div class="squads">${cards}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap">
      <span>Aula 04 · Automação — Squads de Agentes</span>
      <a href="../index.html">${svg('arrowL', 13)} Voltar ao guia das aulas</a>
    </div>
  </footer>
  <script src="assets/app.js"></script>`;

  return head('Aula 04 · Squads de Agentes', 'assets/style.css',
    'Aula 04 da Implementação Claude: squads de agentes de IA que automatizam tarefas reais. Aprenda o que é um squad e monte os 10 squads prontos.')
    + '\n<body>\n' + topbar('../index.html', '') + body + '\n</body>\n</html>\n';
}

function needBadge(q) {
  const hasKey = q.premises.some((p) => p.kind === 'key');
  if (hasKey) return `<span class="mchip mchip--key">${svg('key')} chave</span>`;
  return `<span class="mchip mchip--free">${svg('check')} grátis</span>`;
}

/* =====================================================================
   PÁGINA DE SQUAD (aula-04/squads/NN-slug.html)
   ===================================================================== */
function buildSquad(q, idx) {
  const prev = squads[idx - 1];
  const next = squads[idx + 1];

  const agents = q.agents.map(([n, r]) => `
            <div class="unit"><span class="unit__dot"></span><div><div class="unit__name">${esc(n)}</div><div class="unit__role">${esc(r)}</div></div></div>`).join('');
  const skills = q.skills.map(([n, r]) => `
            <div class="unit"><span class="unit__dot"></span><div><div class="unit__name">${esc(n)}</div><div class="unit__role">${esc(r)}</div></div></div>`).join('');

  const premises = q.premises.map((p) => {
    const m = PREMISE_META[p.kind] || PREMISE_META.dep;
    return `
          <div class="premise ${m.cls}" data-reveal>
            <div class="premise__ic">${svg(m.ic)}</div>
            <div><h4>${esc(p.title)}</h4><p>${p.html}</p></div>
          </div>`;
  }).join('');

  // passo a passo — montado a partir das premissas do squad
  const steps = buildSteps(q);
  const stepsHtml = steps.map((s, i) => `
          <div class="step" data-reveal>
            <div class="step__rail"><div class="step__num">${i + 1}</div><div class="step__line"></div></div>
            <div class="step__body"><h4>${s.t}</h4><p>${s.d}</p>${s.tag ? `<span class="step__tag">${s.tag}</span>` : ''}</div>
          </div>`).join('');

  const gates = (q.gates || []).map((g) => `
          <div class="callout callout--${g.kind}" data-reveal>
            <span class="callout__ic">${svg(CALLOUT_IC[g.kind] || 'sparkles')}</span>
            <div><h4>${esc(g.title)}</h4><p>${g.html}</p></div>
          </div>`).join('');

  const outputs = q.outputs.map((o) => {
    const [code, ...rest] = o.split(' — ');
    return `<div class="unit"><span class="unit__dot" style="background:var(--green-2);box-shadow:0 0 10px rgba(34,197,94,.6)"></span><div><div class="unit__name">${esc(code)}</div>${rest.length ? `<div class="unit__role">${esc(rest.join(' — '))}</div>` : ''}</div></div>`;
  }).join('');

  // prompt verbatim
  let prompt = '';
  try { prompt = readFileSync(join(SQUADS_DIR, q.slug, 'prompt-montagem.md'), 'utf8'); }
  catch (e) { prompt = '// prompt-montagem.md não encontrado para ' + q.slug; }
  const promptLines = prompt.split('\n').length;

  const pager = `
        <nav class="pager">
          ${prev ? `<a href="${prev.slug}.html"><small>${svg('arrowL', 12)} Squad ${prev.n}</small><b>${esc(prev.title)}</b></a>` : `<a class="is-disabled"><small>Início</small><b>—</b></a>`}
          ${next ? `<a href="${next.slug}.html" class="next"><small>Squad ${next.n} ${svg('arrowR', 12)}</small><b>${esc(next.title)}</b></a>` : `<a class="is-disabled next"><small>Fim</small><b>—</b></a>`}
        </nav>`;

  const body = `
  <main>
    <section class="shead">
      <div class="wrap wrap--narrow">
        <div data-reveal>
          <span class="shead__code">SQUAD ${q.n} · ${esc(q.tagline)}</span>
          <h1>${esc(q.title)}</h1>
          <p class="shead__sub">${esc(q.whatIs)}</p>
          <div class="shead__chips">
            <span class="mchip mchip--agent">${svg('bot')} ${q.agents.length} agentes</span>
            <span class="mchip mchip--skill">${svg('wrench')} ${q.skills.length} skills</span>
            ${needBadge(q)}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap wrap--narrow stack">
        <div class="callout callout--info" data-reveal>
          <span class="callout__ic">${svg('sparkles')}</span>
          <div><h4>Para quem é</h4><p>${esc(q.forWho)}</p></div>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap wrap--narrow">
        <div class="section__head" data-reveal><span class="eyebrow">Composição</span><h2>Quem trabalha neste squad</h2></div>
        <div class="roster">
          <div class="roster__col roster__col--agents">
            <h3>${svg('bot', 16)} Agentes <span class="count">${q.agents.length}</span></h3>${agents}
          </div>
          <div class="roster__col roster__col--skills">
            <h3>${svg('wrench', 16)} Skills <span class="count">${q.skills.length}</span></h3>${skills}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap wrap--narrow">
        <div class="section__head" data-reveal><span class="eyebrow">Premissas</span><h2>Antes de começar, prepare isto</h2><p>O que precisa estar configurado para o squad rodar de verdade.</p></div>
        <div class="premises">${premises}</div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap wrap--narrow">
        <div class="section__head" data-reveal><span class="eyebrow">Passo a passo</span><h2>Como montar e rodar</h2><p>Siga na ordem. Primeiro um, depois o outro — sem pular etapas.</p></div>
        <div class="steps">${stepsHtml}</div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap wrap--narrow">
        <div class="section__head" data-reveal><span class="eyebrow">O prompt de montagem</span><h2>Copie e cole no Claude Code</h2><p>Este é o prompt que constrói o squad inteiro. Abra a pasta do squad no Claude Code, cole tudo e deixe ele montar.</p></div>
        <div class="terminal" data-reveal>
          <div class="terminal__bar">
            <div class="terminal__dots"><i></i><i></i><i></i></div>
            <span class="terminal__file">${svg('doc', 14)} <b>prompt-montagem.md</b></span>
            <button class="terminal__copy" data-copy-target="prompt-${q.n}" aria-label="Copiar o prompt de montagem">${svg('copy')}<span class="copy-label">Copiar prompt</span></button>
          </div>
          <div class="terminal__scroll"><pre id="prompt-${q.n}">${esc(prompt)}</pre></div>
          <div class="terminal__hint">${promptLines} linhas · role para ler ou use o botão "Copiar prompt"</div>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap wrap--narrow stack">
        ${gates}
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap wrap--narrow">
        <div class="section__head" data-reveal><span class="eyebrow">Entregáveis</span><h2>O que o squad gera</h2></div>
        <div class="roster__col">${outputs}</div>
        ${pager}
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap">
      <span>Squad ${q.n} · ${esc(q.title)}</span>
      <a href="../index.html">${svg('arrowL', 13)} Todos os squads</a>
    </div>
  </footer>
  <script src="../assets/app.js"></script>`;

  return head(`Squad ${q.n} · ${q.title} — Aula 04`, '../assets/style.css',
    `${q.title}: ${q.card}`)
    + '\n<body>\n' + topbar('../../index.html', '../index.html') + body + '\n</body>\n</html>\n';
}

/* monta o passo a passo a partir das premissas (premissa entra cedo) */
export function buildSteps(q) {
  const steps = [];
  steps.push({ t: 'Abra a pasta do squad no Claude Code', d: `Abra a pasta <code>${q.slug}/</code> no Claude Code (ou crie uma pasta nova e trabalhe nela). É aqui que o squad vai ser montado.`, tag: 'Setup' });
  steps.push({ t: 'Ative a skill geradora de squads', d: 'No Claude Code, digite <code>use skill mestre-squad-builder</code>. É ela que vai construir o squad a partir do seu pedido. (Precisa estar instalada — veja a etapa "Skill: Gerador de Squads" no menu.)', tag: 'Setup' });
  steps.push({ t: 'Cole o pedido do squad', d: 'Copie o <strong>prompt em linguagem natural</strong> (acima) e cole no Claude Code. A skill monta sozinha os agentes, as skills, o <code>CLAUDE.md</code> e a estrutura de pastas.', tag: 'Montagem' });

  const keyP = q.premises.find((p) => p.kind === 'key');
  const accP = q.premises.find((p) => p.kind === 'account');
  const depP = q.premises.find((p) => p.kind === 'dep');
  const dataP = q.premises.find((p) => p.kind === 'data');

  if (depP) steps.push({ t: 'Instale as dependências', d: depP.html, tag: 'Premissa' });
  if (keyP) steps.push({ t: 'Coloque sua chave no config/.env', d: keyP.html, tag: 'Premissa' });
  if (accP) steps.push({ t: 'Conecte a conta', d: accP.html, tag: 'Premissa' });
  if (dataP) steps.push({ t: 'Coloque seus dados de entrada', d: dataP.html, tag: 'Premissa' });

  steps.push({ t: `Digite ${q.start.replace(/</g, '&lt;')}`, d: (q.startNote || `No Claude Code, digite <code>${q.start}</code>. O orquestrador assume daqui: valida os pré-requisitos (Passo 0) e abre o onboarding.`), tag: 'Execução' });
  steps.push({ t: 'Responda o briefing e confirme', d: 'O squad faz as perguntas num único bloco. Responda, confira o resumo e confirme — então os agentes executam em sequência.', tag: 'Execução' });
  steps.push({ t: 'Pegue o resultado em output/', d: 'Quando terminar, os entregáveis estão na pasta <code>output/</code> (veja a lista abaixo). Reveja, ajuste se quiser e use.', tag: 'Entrega' });
  return steps;
}

/* =====================================================================
   ESCRITA — só quando rodado direto (node build/generate.mjs).
   Ao ser importado (ex.: tools/gen-squads.mjs), nada é escrito.
   ===================================================================== */
const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isMain) {
  mkdirSync(join(OUT, 'squads'), { recursive: true });
  writeFileSync(join(OUT, 'index.html'), buildHub(), 'utf8');
  console.log('✓ hub  → aula-04/index.html');
  squads.forEach((q, i) => {
    const html = buildSquad(q, i);
    writeFileSync(join(OUT, 'squads', q.slug + '.html'), html, 'utf8');
    console.log(`✓ ${q.slug}.html  (${(html.length / 1024).toFixed(0)} KB)`);
  });
  console.log(`\nPronto: 1 hub + ${squads.length} páginas de squad.`);
}
