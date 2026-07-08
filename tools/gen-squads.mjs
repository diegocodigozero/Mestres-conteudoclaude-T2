/* =====================================================================
   Integra a AULA 04 · Automação · Squads DENTRO do guia (index.html),
   como tópicos in-page nativos da SPA e no tema de cores do guia.

   - Fonte única de dados: aula-04/build/generate.mjs (export squads/helpers).
   - O prompt verbatim de cada squad é reaproveitado do microsite já gerado
     (aula-04/squads/NN-slug.html), com fallback para a fonte .md original.
   - Edita só o miolo entre os marcadores AULA04-NAV-* e AULA04-TOPICS-*;
     o resto do index.html é preservado. CSS vive em styles.css (.sq-*).

   Roda local: `node tools/gen-squads.mjs`  (idempotente).
   ===================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import {
  squads as allSquads, svg, esc, PREMISE_META, CALLOUT_IC, buildSteps,
} from '../aula-04/build/generate.mjs';

/* Squads removidos da aula (04 Instagram, 07 Deep Research, 08 Dossiê, 09 Calendário, 10 Reputação) */
const REMOVED = [
  '04-instagram-respostas',
  '07-deep-research',
  '08-dossie-concorrencia',
  '09-calendario-social',
  '10-guardiao-reputacao',
];
const squads = allSquads.filter((q) => !REMOVED.includes(q.slug));
/* renumera os restantes de forma contígua (RH → 04, Hormozi → 05, etc.) */
squads.forEach((q, i) => { q.n = String(i + 1).padStart(2, '0'); });

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');                 // .../mestres_claude_conteudo
const INDEX = resolve(ROOT, 'index.html');
const SRC = 'D:\\VibeCode\\Aula\\squads';              // fonte .md original (fallback)

const sqId = (q) => 'sq-' + q.slug;                    // id do tópico in-page
const totalAgents = squads.reduce((s, q) => s + q.agents.length, 0);
const totalSkills = squads.reduce((s, q) => s + q.skills.length, 0);

/* ícones extras (expandir / fechar) */
const expandSvg = (w = 14) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:${w}px;height:${w}px"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
const closeSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

/* uma linha da árvore: conector (├──/│/└──) + ícone + nome + descrição */
const treeRow = (lines, kind, icon, name, desc) =>
  `          <div class="sq-tree__row is-${kind}"><span class="sq-tree__lines">${lines}</span><span class="sq-tree__ic">${svg(icon)}</span><b>${esc(name)}</b><span class="sq-tree__desc">${esc(desc)}</span></div>`;

/* ícone de download + link direto da skill (baixa sem abrir o Drive) */
const downloadSvg = (w = 18) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:${w}px;height:${w}px"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>`;
const SKILL_DOWNLOAD = 'https://drive.google.com/uc?export=download&id=1mLB0l-FIo37xZPgOdA5TOFu_9VzOx8at';

/* seta para baixo do fluxograma */
const flowArrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>`;

/* =====================================================================
   FLUXOGRAMA — como o squad se comporta:
   orquestrador (CLAUDE.md) → cada agente (usa sua skill) → resultado.
   A skill é pareada ao agente por ordem (skills extras viram nota).
   ===================================================================== */
function buildFlow(q) {
  const orch = `
        <div class="sq-flow__node sq-flow__node--orch">
          <div class="sq-flow__ic">${svg('cpu')}</div>
          <div class="sq-flow__body">
            <div class="sq-flow__name">CLAUDE.md · Orquestrador</div>
            <div class="sq-flow__role">Lê o seu pedido, decompõe em tarefas e delega para os agentes na ordem certa. Ele não executa — coordena e, no fim, junta tudo.</div>
          </div>
        </div>`;

  const isOrch = (n, r) => /maestro|orquestrad/i.test(`${n} ${r}`);
  let ski = 0; // ponteiro das skills (pareadas só com agentes executores)
  const steps = q.agents.map(([name, role], i) => {
    let chip = '';
    if (isOrch(name, role)) {
      chip = `<div class="sq-flow__skill sq-flow__skill--orch">${svg('cpu', 13)} coordena os agentes da cadeia</div>`;
    } else if (ski < q.skills.length) {
      chip = `<div class="sq-flow__skill">${svg('wrench', 13)} usa a skill <b>${esc(q.skills[ski][0])}</b></div>`;
      ski++;
    }
    return `
        <div class="sq-flow__arrow">${flowArrow}</div>
        <div class="sq-flow__node">
          <div class="sq-flow__num">${i + 1}</div>
          <div class="sq-flow__body">
            <div class="sq-flow__name">${esc(name)}</div>
            <div class="sq-flow__role">${esc(role)}</div>
            ${chip}
          </div>
        </div>`;
  }).join('');

  const extra = q.skills.slice(ski).map(([n]) => `<b>${esc(n)}</b>`);
  const extraNote = extra.length
    ? `
        <div class="sq-flow__extra">${svg('wrench', 13)} Skills também usadas no fluxo: ${extra.join(', ')}</div>`
    : '';

  const result = `
        <div class="sq-flow__arrow">${flowArrow}</div>
        <div class="sq-flow__node sq-flow__node--out">
          <div class="sq-flow__ic">${svg('check')}</div>
          <div class="sq-flow__body">
            <div class="sq-flow__name">Resultado pronto</div>
            <div class="sq-flow__role">O orquestrador consolida tudo e entrega os arquivos em <code>output/</code> para você revisar e aprovar.</div>
          </div>
        </div>`;

  return `
      <div class="sq-flow">
        <div class="sq-flow__hint">${svg('cpu', 14)} O orquestrador delega a cada agente em sequência; cada agente roda sua skill e devolve o resultado a ele — até montar a entrega final.</div>
${orch}${steps}${extraNote}${result}
      </div>`;
}

/* chip "precisa de chave" vs "100% grátis" */
function badgeChip(q) {
  const hasKey = q.premises.some((p) => p.kind === 'key');
  return hasKey
    ? `<span class="sq-chip sq-chip--key">${svg('key', 13)} Precisa de chave</span>`
    : `<span class="sq-chip sq-chip--free">${svg('check', 13)} 100% grátis</span>`;
}

/* =====================================================================
   LIMPEZA DO PROMPT
   - remove o preâmbulo/blurb ("autocontido/fiel/verbatim/não parafraseie")
   - remove o "Índice" e a 1ª "árvore de arquivos" (duplicada)
   - prepende um contexto claro do que o squad faz (sem "para quem é")
   ===================================================================== */
const BLURB_RE = /(autocontido|fiel|verbatim|parafrase|idêntic|identic|\bcopie\b|copiar|copiando|cole tudo|cole o|reproduzir|recria|reconstruir|conteúdo exato|conteudo exato|crie a estrutura)/i;
const KEEP_RE = /(crase|\btil\b|~~~|API[ _]?key|\.env|\bMCP\b|TranscriptAPI|WebSearch|WebFetch)/i;

/* colapsa '---' consecutivos (separados só por linhas em branco) */
function collapseHr(md) {
  const out = [];
  for (const l of md.split('\n')) {
    if (l.trim() === '---' && out.length) {
      let k = out.length - 1;
      while (k >= 0 && out[k].trim() === '') k--;
      if (k >= 0 && out[k].trim() === '---') continue;
    }
    out.push(l);
  }
  return out.join('\n');
}

/* remove título H1 + blocos de "blurb" iniciais, preservando notas úteis */
function stripPreamble(md) {
  const lines = md.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && /^#\s/.test(lines[i])) {            // título H1
    i++;
    while (i < lines.length && lines[i].trim() === '') i++;
  }
  for (;;) {
    if (i >= lines.length) break;
    const l = lines[i];
    if (l.trim() === '---' || /^#{1,6}\s/.test(l) || /^(```|~~~)/.test(l) || l.trim().startsWith('|')) break;
    let j = i;
    while (j < lines.length && lines[j].trim() !== '') j++;     // bloco até linha em branco
    const block = lines.slice(i, j).join('\n');
    if (BLURB_RE.test(block) && !KEEP_RE.test(block)) {
      i = j;
      while (i < lines.length && lines[i].trim() === '') i++;
    } else break;
  }
  return lines.slice(i).join('\n').replace(/^\n+/, '');
}

/* remove uma seção inteira pelo heading (até o próximo heading de nível <=) */
function removeSection(md, headRe) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => headRe.test(l));
  if (start === -1) return md;
  const level = (lines[start].match(/^#+/) || ['#'])[0].length;
  let end = start + 1;
  while (end < lines.length) {
    const m = lines[end].match(/^(#+)\s/);
    if (m && m[1].length <= level) break;
    end++;
  }
  lines.splice(start, end - start);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}

/* remove o 1º bloco de código que é uma árvore de pastas (+ heading dela) */
function removeFirstTree(md) {
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^(```|~~~)/.test(lines[i])) {
      const fence = lines[i].slice(0, 3);
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith(fence)) j++;
      const body = lines.slice(i + 1, j).join('\n');
      if (/[├└│]/.test(body)) {                                 // é uma árvore
        let s = i;
        let k = i - 1;
        while (k >= 0 && lines[k].trim() === '') k--;
        if (k >= 0 && /^#+\s.*(árvore|arvore|estrutura|diret[óo]ri)/i.test(lines[k])) s = k;
        lines.splice(s, (j + 1) - s);
        return lines.join('\n').replace(/\n{3,}/g, '\n\n');
      }
      i = j;
    }
  }
  return md;
}

/* contexto claro no início do prompt — o que o squad faz (sem "para quem é") */
function buildIntro(q) {
  return `Crie o squad **${q.title}** — ${q.tagline}.\n\n`
    + `${q.whatIs}\n\n`
    + `> **Tarefa:** crie a estrutura de arquivos abaixo, escrevendo cada arquivo com **exatamente** o conteúdo dos blocos correspondentes — sem parafrasear.`;
}

function transformPrompt(raw, q) {
  let md = stripPreamble(raw);
  md = removeSection(md, /^#{1,6}\s*Índice/i);
  md = removeFirstTree(md);
  md = md.replace(/^\s+/, '').replace(/^(?:---\s*\n+)+/, '');   // tira topo/'---' órfãos
  md = `${buildIntro(q)}\n\n---\n\n${md}`;
  md = collapseHr(md).replace(/\n{3,}/g, '\n\n').trim() + '\n';
  return md;
}

/* prompt: lê a fonte .md crua, limpa/contextualiza e escapa p/ exibir */
function readPrompt(q) {
  try {
    const raw = readFileSync(join(SRC, q.slug, 'prompt-montagem.md'), 'utf8');
    const t = transformPrompt(raw, q);
    return { escaped: esc(t), lines: t.split('\n').length };
  } catch { /* ignora */ }
  try {                                                          // fallback: microsite já escapado
    const html = readFileSync(join(ROOT, 'aula-04', 'squads', q.slug + '.html'), 'utf8');
    const m = html.match(new RegExp(`<pre id="prompt-${q.n}">([\\s\\S]*?)</pre>`));
    if (m) return { escaped: m[1], lines: m[1].split('\n').length };
  } catch { /* ignora */ }
  return { escaped: '// prompt-montagem.md não encontrado', lines: 1 };
}

/* ferramentas amigáveis, detectadas do conteúdo do squad */
function toolsLine(q) {
  const hay = `${q.whatIs} ${q.tagline} ${q.premises.map((p) => p.title + ' ' + p.html).join(' ')} ${q.skills.map((s) => s.join(' ')).join(' ')}`.toLowerCase();
  const t = [];
  if (/playwright/.test(hay)) t.push('o Playwright (pra abrir e ler sites / Google Maps sozinho)');
  if (/composio/.test(hay)) t.push('o Composio (pra conectar e-mail / Instagram)');
  if (/google ai|gemini|aistudio|google_ai/.test(hay)) t.push('a API do Google AI Studio (Gemini) pra gerar as imagens');
  if (/transcriptapi|\bmcp\b/.test(hay)) t.push('a TranscriptAPI (pra puxar os vídeos e transcrições do YouTube)');
  if (/websearch|webfetch/.test(hay)) t.push('a busca na web (WebSearch / WebFetch, já nativas)');
  return t;
}

/* chaves de API — entregues direto no pedido, sempre no final */
function keyLines(q) {
  const hay = `${q.whatIs} ${q.tagline} ${q.premises.map((p) => p.title + ' ' + p.html).join(' ')} ${q.skills.map((s) => s.join(' ')).join(' ')}`.toLowerCase();
  const k = [];
  if (/composio/.test(hay)) k.push('Essa aqui é minha chave do Composio: XXXXXXXXXXXXXXXXXXXXXX — use ela em todo lugar que precisar do Composio.');
  if (/transcriptapi/.test(hay)) k.push('Essa aqui é minha chave da TranscriptAPI: XXXXXXXXXXXXXXXXXXXXXX — use ela em todo lugar que precisar da TranscriptAPI.');
  if (/google ai|gemini|aistudio|google_ai/.test(hay)) k.push('Essa aqui é minha Google API key (Google AI Studio): XXXXXXXXXXXXXXXXXXXXXX — use ela em todo lugar que precisar da API do Google.');
  return k;
}

/* PROMPT SIMPLES — linguagem natural, ~como uma pessoa leiga pediria (<= 20 linhas) */
function buildSimplePrompt(q) {
  const tools = toolsLine(q);
  const rules = (q.gates || []).map((g) => g.title);
  const deliver = q.outputs.map((o) => {
    const p = o.split(' — ');
    return (p.length > 1 ? p[1] : p[0]).trim();
  }).slice(0, 4);

  const L = [];
  L.push(`Use a skill mestre-squad-builder para criar um squad chamado "${q.title}" (${q.tagline}).`);
  L.push('');
  L.push(`O que eu preciso: ${q.whatIs}`);
  L.push('');
  if (tools.length) L.push(`Pode usar ${tools.join('; ')}.`);
  if (/transcriptapi/i.test(`${q.whatIs} ${q.tagline}`)) {
    L.push('A TranscriptAPI fica em https://transcriptapi.com/ — lá você gera a chave de API e encontra a documentação do conector MCP (use-a para configurar a integração).');
  }
  if (rules.length) {
    L.push('');
    L.push('Regras importantes:');
    rules.forEach((r) => L.push(`- ${r}.`));
  }
  L.push('');
  L.push('No final, quero receber:');
  deliver.forEach((d) => L.push(`- ${d}.`));
  if (PROMPT_EXTRAS[q.slug]) {
    L.push('');
    L.push(PROMPT_EXTRAS[q.slug]);
  }
  L.push('');
  L.push('Organize como um squad de agentes (um orquestrador que coordena + agentes especializados pra cada etapa, cada um com sua skill) e deixe pronto pra eu rodar digitando "iniciar squad".');
  const keys = keyLines(q);
  if (keys.length) {
    L.push('');
    keys.forEach((k) => L.push(k));
  }
  return L.join('\n').replace(/\n{3,}/g, '\n\n');
}

/* =====================================================================
   MENU LATERAL — grupo expansível: Visão geral + 10 squads
   ===================================================================== */
const navItems = squads.map((q) => `
          <li class="nav-item">
            <a href="#${sqId(q)}" class="nav-link" data-target="${sqId(q)}">
              <span class="nav-num">${q.n}</span> ${esc(q.title)}
            </a>
            <button class="topic-check" data-topic-check="${sqId(q)}" aria-label="Marcar como concluído"></button>
          </li>`).join('');

const NAV = `
      <div class="nav-group" data-group="aula05">
        <button class="nav-group-header" data-group-toggle="aula05" aria-expanded="false">
          <span class="nav-group-badge">04</span>
          <span class="nav-group-meta">
            <span class="nav-group-title">Automação</span>
            <span class="nav-group-sub">Squads de agentes de IA</span>
          </span>
          <svg class="nav-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <ul class="nav-list nav-sublist">
          <li class="nav-item">
            <a href="#sq-overview" class="nav-link" data-target="sq-overview">
              <span class="nav-num">00</span> Visão geral
            </a>
            <button class="topic-check" data-topic-check="sq-overview" aria-label="Marcar como concluído"></button>
          </li>
          <li class="nav-item">
            <a href="#sq-skill-builder" class="nav-link" data-target="sq-skill-builder">
              <span class="nav-num nav-num--star">★</span> Skill: Gerador de Squads
            </a>
            <button class="topic-check" data-topic-check="sq-skill-builder" aria-label="Marcar como concluído"></button>
          </li>${navItems}
        </ul>
      </div>
`;

/* =====================================================================
   TÓPICO — VISÃO GERAL (hub portado para o tema do guia)
   ===================================================================== */
const overviewCards = squads.map((q) => `
        <a class="sq-card" href="#${sqId(q)}" data-target="${sqId(q)}">
          <div class="sq-card-top">
            <span class="sq-card-num">${q.n}</span>
            <span class="sq-card-ic">${svg(q.icon)}</span>
          </div>
          <h3>${esc(q.title)}</h3>
          <p class="sq-card-desc">${esc(q.card)}</p>
          <div class="sq-card-foot">
            <span class="sq-chip sq-chip--agent">${svg('bot', 13)} ${q.agents.length}</span>
            <span class="sq-chip sq-chip--skill">${svg('wrench', 13)} ${q.skills.length}</span>
            <span class="sq-go">Abrir ${svg('arrowR', 15)}</span>
          </div>
        </a>`).join('');

const OVERVIEW = `
    <section id="sq-overview" class="topic">
      <header class="topic-header">
        <span class="eyebrow eyebrow-special">Aula 04 · Automação</span>
        <h1 class="title-shimmer">Squads de Agentes</h1>
        <p class="lead">
          Times de IA que trabalham por você. Cada squad é um pequeno exército de agentes
          especializados — você cola um prompt, configura o que for preciso e digita
          <strong>iniciar squad</strong>. O resto roda sozinho.
        </p>
      </header>

      <div class="sq-stats">
        <span class="sq-stat">${svg('cpu')} <b>${squads.length}</b> squads</span>
        <span class="sq-stat">${svg('bot')} <b>${totalAgents}</b> agentes</span>
        <span class="sq-stat">${svg('wrench')} <b>${totalSkills}</b> skills</span>
      </div>

      <h2 class="section-title section-title-large">O que é um squad?</h2>
      <p class="section-desc">
        Pense num time de trabalho. Em vez de você fazer tudo, um <strong>orquestrador</strong>
        distribui as tarefas para <strong>agentes</strong> especialistas, e cada agente segue suas
        <strong>skills</strong> (o passo a passo de como fazer). Você aprova o resultado no final.
      </p>
      <div class="sq-concepts">
        <div class="sq-concept">
          <div class="sq-concept-ic">${svg('cpu')}</div>
          <h3>Orquestrador</h3>
          <p>O maestro do time. Faz o onboarding com você, decide a ordem e aciona os agentes certos. Ele coordena — não faz o trabalho braçal.</p>
        </div>
        <div class="sq-concept">
          <div class="sq-concept-ic">${svg('bot')}</div>
          <h3>Agentes</h3>
          <p>Especialistas com <strong>uma</strong> função cada (coletar, analisar, redigir...). Trabalham isolados e entregam sua parte. Vivem em <code>.claude/agents/</code>.</p>
        </div>
        <div class="sq-concept">
          <div class="sq-concept-ic">${svg('wrench')}</div>
          <h3>Skills</h3>
          <p>Os manuais de "como fazer" que os agentes seguem — o passo a passo técnico de cada tarefa. Vivem em <code>.claude/skills/</code>.</p>
        </div>
      </div>
      <div class="example-tip">
        <span class="tip-icon">🧭</span>
        O fluxo: <strong>você → orquestrador → agentes + skills → resultado pronto para aprovar</strong>.
      </div>

      <h2 class="section-title">A estrutura de pastas de um squad</h2>
      <p class="section-desc">
        Todo squad segue a mesma estrutura. Entender essas pastas é o suficiente para saber onde
        tudo mora — e onde você coloca suas chaves e dados.
      </p>
      <div class="sq-tree">
        <div class="sq-tree__root">${svg('folder')} nome-do-squad/</div>
        <div class="sq-tree__rows">
${treeRow('├── ', 'file', 'doc', 'CLAUDE.md', 'o manual-mãe: o que o squad é e as regras')}
${treeRow('├── ', 'file', 'doc', 'prompt-montagem.md', 'o prompt que monta o squad — você cola no Claude Code')}
${treeRow('├── ', 'dir', 'folder', 'config/', 'onde ficam suas configurações')}
${treeRow('│   ├── ', 'file', 'doc', '.env.example', 'modelo das chaves (versionado, vazio)')}
${treeRow('│   └── ', 'key', 'key', '.env', 'suas chaves de verdade — nunca versionado')}
${treeRow('├── ', 'dir', 'folder', '.claude/', 'o cérebro do squad')}
${treeRow('│   ├── ', 'dir', 'folder', 'agents/', 'os especialistas — 1 arquivo .md por agente')}
${treeRow('│   └── ', 'dir', 'folder', 'skills/', 'os "como fazer" — 1 pasta por skill (com SKILL.md)')}
${treeRow('└── ', 'dir', 'folder', 'output/', 'tudo que o squad gera fica aqui')}
        </div>
      </div>

      <h2 class="section-title">Os ${squads.length} squads</h2>
      <p class="section-desc">Cada card abre o passo a passo completo: o que configurar antes, como montar e o prompt pronto para copiar.</p>
      <div class="sq-grid">${overviewCards}
      </div>
    </section>
`;

/* squads que NÃO mostram a seção "Como montar e rodar" */
const NO_STEPS = new Set(['05-rh-triagem']);

/* exemplos de solicitação por squad (pra usar na aula — é só adaptar) */
const EXAMPLES = {
  '01-prospeccao': `Me traga 30 clínicas odontológicas em São Paulo, no bairro Pinheiros, com e-mail e WhatsApp, e prepara o disparo usando este e-mail de apresentação (me mostra renderizado pra eu aprovar antes de enviar):

Assunto: Um site profissional para a [NOME]

Olá, tudo bem?

Me chamo Diego Caldas e tenho uma empresa de desenvolvimento de sites para clínicas e consultórios. Vi o perfil da [NOME] no Google e acredito que um site moderno, rápido e com agendamento online pode trazer mais pacientes pra vocês.

Gostaria de apresentar alguns sites que já criei para clínicas da região — são 10 minutos, sem compromisso. Pode ser esta semana?

É só responder este e-mail ou me chamar no WhatsApp: (11) 98888-7777.

Abraço,
Diego Caldas — DC Sites
(11) 98888-7777 · contato@dcsites.com.br`,
  '02-espionagem-youtube': 'Analise os 15 vídeos mais recentes do canal "https://youtube.com/@concorrente" e me devolva 3 roteiros originais (um vídeo longo, um Reel e um Stories) sobre os temas que mais performaram.',
  '03-imagem-google-ai': `Crie 05 imagens referentes a temas recentes de IA, seguindo o padrão visual descrito na sequência.

Formato: vertical 4:5 (ex.: 1080×1350px).

Imagem de fundo [VARIÁVEL]
Foto temática em plano macro/close, ângulo levemente diagonal, profundidade de campo rasa, iluminação direcional dramática, vinheta nos cantos. Manter um ponto focal único e um acento de cor quente no centro.

Overlay fixo
Gradiente preto (de transparente no topo → ~85% opaco embaixo) cobrindo a metade inferior, pra garantir leitura do texto.

Topo esquerdo [VARIÁVEL: logo/marca]
Sans-serif, bold, caixa alta, branco, ~24px.

Topo direito [VARIÁVEL: categoria]
Pill arredondada, fundo cor de acento, texto branco, bold, caixa alta, ~13px, tracking ~1px.

Bloco inferior esquerdo (ancorado, alinhado à esquerda):
Kicker [VARIÁVEL: mesma categoria] — sans-serif, bold, caixa alta, cor de acento, ~14px, tracking ~2px.
Título [VARIÁVEL] — sans-serif, Black (900), branco, ~52px, line-height ~1.0, caixa mista, 1–3 linhas.
Subtítulo [VARIÁVEL] — sans-serif, regular (400), branco, ~22px, line-height ~1.3, 1–2 linhas.
Crédito/data [VARIÁVEL] — sans-serif, regular, branco 60% opacidade, ~15px, formato "Fonte · mês/ano".

Constantes do sistema (não mudam entre posts):
Fonte: uma única família sans-serif geométrica (Inter / Helvetica Now / Söhne).
Cor de acento: 1 cor (no exemplo, coral #E8795A) usada na pill + kicker.
Texto sempre branco, alinhado à esquerda, ancorado embaixo.
Margens laterais iguais e generosas.
Hierarquia por contraste de peso (Black → Regular) e tamanho.`,
  '04-instagram-respostas': 'Puxe os comentários novos do meu último post no Instagram, classifique cada um e redija as respostas no meu tom de voz — me mostra no painel pra eu aprovar antes de publicar.',
  '05-rh-triagem': 'Tenho 20 currículos em cvs/ e a vaga "Desenvolvedor(a) Python Pleno" em vagas/. Pontue todos e me traga o ranking dos 5 melhores, com a evidência e os gaps de cada um.',
  '06-oferta-hormozi': 'Monte uma oferta irresistível para um curso de inglês para executivos de R$ 2.000: avatar, dor, equação de valor, bônus, preço, garantia e o funil completo.',
  '07-deep-research': 'Pesquise o mercado de pet shops em Belo Horizonte: tamanho, principais concorrentes, ticket médio e tendências — com as fontes citadas.',
  '08-dossie-concorrencia': 'Compare estes 3 concorrentes: site1.com, site2.com e site3.com. Quero a matriz comparativa, o SWOT de cada um e onde eu consigo me diferenciar.',
  '09-calendario-social': 'Monte um calendário de 30 dias para um estúdio de pilates, começando em 01/07/2026, com as legendas já escritas num tom acolhedor e profissional.',
  '10-guardiao-reputacao': 'Colete os reviews recentes do meu restaurante no Google Maps ("Cantina da Nona, São Paulo"), analise o sentimento e redija uma resposta para cada um — me mostra a fila pra eu aprovar.',
};

/* trechos extras de prompt, específicos de alguns squads */
const PROMPT_EXTRAS = {
  '01-prospeccao': 'O envio dos e-mails deve ser feito pelo Composio, na integração com o Gmail.',
  '03-imagem-google-ai': 'No onboarding, me pergunte: o que vai ser a imagem (o tema/assunto), quantas imagens, o estilo, a paleta e o texto. Pergunte também se eu prefiro que o squad pesquise o tema antes (ex.: notícias recentes de IA) — se sim, inclua um agente de pesquisa que busca as novidades e usa como base para criar as imagens.',
  '05-rh-triagem': 'Crie duas pastas de entrada: uma para a descrição da vaga (vagas/) e outra para os currículos (cvs/). O squad deve ler os arquivos dessas duas pastas para pontuar cada currículo contra a vaga e montar o ranking.',
};

/* =====================================================================
   TÓPICO — PÁGINA DE CADA SQUAD
   ===================================================================== */
function buildSquadTopic(q, idx) {
  const id = sqId(q);
  const prev = squads[idx - 1];
  const next = squads[idx + 1];

  const premises = q.premises.map((p) => {
    const m = PREMISE_META[p.kind] || PREMISE_META.dep;
    const cls = p.kind === 'key' ? ' sq-premise--key' : (p.kind === 'free' ? ' sq-premise--ok' : '');
    return `
          <div class="sq-premise${cls}">
            <div class="sq-premise-ic">${svg(m.ic)}</div>
            <div><h4>${esc(p.title)}</h4><p>${p.html}</p></div>
          </div>`;
  }).join('');

  const steps = buildSteps(q).map((s, i) => `
          <div class="sq-step">
            <div class="sq-step-num">${i + 1}</div>
            <div class="sq-step-body"><h4>${s.t}</h4><p>${s.d}</p>${s.tag ? `<span class="sq-step-tag">${s.tag}</span>` : ''}</div>
          </div>`).join('');

  const gates = (q.gates || []).map((g) => {
    const variant = g.kind === 'warn' ? ' sq-callout--warn' : (g.kind === 'gate' ? ' sq-callout--gate' : '');
    return `
      <div class="sq-callout${variant}">
        <span class="sq-callout-ic">${svg(CALLOUT_IC[g.kind] || 'sparkles')}</span>
        <div><h4>${esc(g.title)}</h4><p>${g.html}</p></div>
      </div>`;
  }).join('');

  const outputs = q.outputs.map((o) => {
    const [code, ...rest] = o.split(' — ');
    return `
          <div class="sq-output"><span class="sq-output-dot"></span><div><div class="sq-output-name">${esc(code)}</div>${rest.length ? `<div class="sq-output-desc">${esc(rest.join(' — '))}</div>` : ''}</div></div>`;
  }).join('');

  const { escaped, lines } = readPrompt(q);
  const preview = escaped.split('\n').slice(0, 18).join('\n');
  const promptTitle = `Squad ${q.n} · ${esc(q.title)}`;
  const simpleEsc = esc(buildSimplePrompt(q));

  const pager = `
      <nav class="sq-pager">
        ${prev
          ? `<a href="#${sqId(prev)}" data-target="${sqId(prev)}"><small>${svg('arrowL', 12)} Squad ${prev.n}</small><b>${esc(prev.title)}</b></a>`
          : `<a href="#sq-skill-builder" data-target="sq-skill-builder"><small>${svg('arrowL', 12)} Antes</small><b>Skill: Gerador de Squads</b></a>`}
        ${next
          ? `<a href="#${sqId(next)}" data-target="${sqId(next)}" class="next"><small>Squad ${next.n} ${svg('arrowR', 12)}</small><b>${esc(next.title)}</b></a>`
          : `<a href="#sq-overview" data-target="sq-overview" class="next"><small>Visão geral ${svg('arrowR', 12)}</small><b>Os ${squads.length} squads</b></a>`}
      </nav>`;

  return `
    <section id="${id}" class="topic">
      <header class="topic-header">
        <span class="eyebrow">Squad ${q.n} · ${esc(q.tagline)}</span>
        <h1>${esc(q.title)}</h1>
        <p class="lead">${esc(q.whatIs)}</p>
        <div class="sq-chips">
          <span class="sq-chip sq-chip--agent">${svg('bot', 13)} ${q.agents.length} agentes</span>
          <span class="sq-chip sq-chip--skill">${svg('wrench', 13)} ${q.skills.length} skills</span>
          ${badgeChip(q)}
        </div>
      </header>

      <h2 class="section-title">Antes de começar, prepare isto</h2>
      <div class="sq-premises">${premises}
      </div>
${NO_STEPS.has(q.slug) ? '' : `
      <h2 class="section-title">Como montar e rodar</h2>
      <div class="sq-steps">${steps}
      </div>
`}
      <h2 class="section-title">O prompt para criar o squad</h2>
      <p class="section-desc">É só copiar este pedido em linguagem natural e colar no Claude Code (numa pasta vazia). Ele monta o squad inteiro pra você.</p>
      <div class="sq-simplecard">
        <div class="sq-simplecard__bar">
          <span class="sq-simplecard__file">${svg('message', 16)} Pedido em linguagem natural</span>
          <button class="sq-ghost-btn" data-prompt-copy="sq-simple-${q.n}">${svg('copy', 14)}<span class="copy-label">Copiar</span></button>
        </div>
        <pre class="sq-simplecard__pre" id="sq-simple-${q.n}">${simpleEsc}</pre>
      </div>

      <details class="sq-complete">
        <summary>${svg('doc', 14)} Prompt completo mais avançado — mais linhas + tokens · ${lines} linhas</summary>
        <div class="sq-promptcard">
          <div class="sq-promptcard__bar">
            <span class="sq-promptcard__file">${svg('doc', 15)} <b>prompt-montagem.md</b> · ${lines} linhas</span>
            <div class="sq-promptcard__btns">
              <button class="sq-ghost-btn" data-prompt-copy="sq-prompt-${q.n}">${svg('copy', 14)}<span class="copy-label">Copiar</span></button>
              <button class="sq-expand-btn" data-prompt-open="sq-prompt-${q.n}" data-prompt-title="${promptTitle}">${expandSvg(14)} Expandir</button>
            </div>
          </div>
          <div class="sq-promptcard__preview">
            <pre>${preview}</pre>
            <button class="sq-promptcard__veil" data-prompt-open="sq-prompt-${q.n}" data-prompt-title="${promptTitle}" aria-label="Abrir o prompt completo">${expandSvg(16)} Ler o prompt completo (${lines} linhas)</button>
          </div>
          <pre id="sq-prompt-${q.n}" class="sq-prompt-source" hidden>${escaped}</pre>
        </div>
      </details>
${EXAMPLES[q.slug] ? `
      <div class="sq-example">
        <div class="sq-example__head">${svg('message', 15)} Exemplo de solicitação — depois que o squad estiver pronto (é só adaptar ao seu caso)</div>
        <p class="sq-example__text">${esc(EXAMPLES[q.slug])}</p>
        <button class="sq-ghost-btn sq-example__copy" data-prompt-copy="sq-example-${q.n}">${svg('copy', 14)}<span class="copy-label">Copiar exemplo</span></button>
        <pre id="sq-example-${q.n}" class="sq-prompt-source" hidden>${esc(EXAMPLES[q.slug])}</pre>
      </div>` : ''}

${gates ? `\n      <h2 class="section-title">Importante</h2>${gates}\n` : ''}
${pager}
    </section>
`;
}

/* =====================================================================
   TÓPICO 11 — SKILL GERADORA DE SQUADS (mestre-squad-builder)
   ===================================================================== */
const skillPrincipios = [
  ['cpu', 'Orquestrador não executa', 'Ele decompõe, delega, coordena e sintetiza — nunca faz o trabalho braçal direto.'],
  ['bot', 'Sub-agentes têm escopo único', 'Cada agente, uma responsabilidade. Se faz X <em>e</em> Y, viram dois agentes.'],
  ['wrench', 'Skills são procedurais; agentes executam', 'Skills explicam <em>como</em> fazer; agentes executam tarefas específicas.'],
  ['database', 'Saída sempre estruturada', 'Sub-agentes retornam JSON, YAML ou schema estrito — nunca texto solto imprevisível.'],
  ['key', 'Secrets nunca globais', 'Chaves sempre em <code>.env</code>, carregadas via <code>python-dotenv</code>. Nada hardcoded.'],
  ['folder', 'Infraestrutura automática', 'Cria <code>.env</code>, <code>.gitignore</code>, <code>requirements.txt</code>, <code>inputs/</code>, <code>outputs/</code> e <code>scripts/</code> sem você pedir.'],
  ['sparkles', 'Consistência nos outputs', 'Se o squad gera imagem, vídeo, texto ou landing, ela cria um sistema de consistência (visual grammar, writing system, UX rules).'],
].map(([ic, t, h]) => `
          <div class="sq-premise">
            <div class="sq-premise-ic">${svg(ic)}</div>
            <div><h4>${esc(t)}</h4><p>${h}</p></div>
          </div>`).join('');

const skillFases = [
  ['Reconhecimento de contexto', 'Lê a pasta e qualquer <code>CLAUDE.md</code>, <code>.claude/agents/</code> ou <code>.claude/skills/</code> existentes para seguir o padrão — ou aplica o default.'],
  ['Entrevista adaptativa', 'Pergunta em pares: objetivo, input/output, decomposição, topologia, skills reutilizáveis, ferramentas e modelos. E define a arquitetura de experiência.'],
  ['Arquitetura do squad', 'Define os agentes, as skills, a topologia, o fluxo, os contratos JSON e as dependências.'],
  ['Geração da estrutura', 'Cria <code>CLAUDE.md</code>, agentes, skills, <code>.env</code>, <code>.gitignore</code>, <code>requirements.txt</code>, <code>scripts/</code>, <code>inputs/</code>, <code>outputs/</code> e manifests.'],
  ['Contratos e consistência', 'Cada agente declara escopo, input, output e JSON estrito; cada skill declara quando usar e exemplos. No fim, entrega o manual completo.'],
].map(([t, d], i) => `
          <div class="sq-step">
            <div class="sq-step-num">${i + 1}</div>
            <div class="sq-step-body"><h4>${esc(t)}</h4><p>${d}</p><span class="sq-step-tag">Fase ${i + 1}</span></div>
          </div>`).join('');

const skillOutputs = [
  'CLAUDE.md — o manual-mãe e as regras do orquestrador',
  '.claude/agents/ — um agente por responsabilidade',
  '.claude/skills/ — o conhecimento procedural reutilizável',
  '.env + .env.example — chaves isoladas, nunca versionadas',
  '.gitignore + requirements.txt — a infraestrutura do projeto',
  'scripts/ · inputs/ · outputs/ — pastas de trabalho e entregáveis',
  'Manual final — arquitetura, fluxo, custo estimado e checklist',
].map((o) => {
  const [code, ...rest] = o.split(' — ');
  return `
          <div class="sq-output"><span class="sq-output-dot"></span><div><div class="sq-output-name">${esc(code)}</div>${rest.length ? `<div class="sq-output-desc">${esc(rest.join(' — '))}</div>` : ''}</div></div>`;
}).join('');

const skillInstalar = [
  ['Baixe a skill', 'Clique no botão acima — o arquivo <code>mestre-squad-builder.skill</code> baixa direto, sem abrir o Drive.', 'Download'],
  ['Coloque em ~/.claude/skills/', 'A pasta final deve ficar <code>~/.claude/skills/mestre-squad-builder/</code> com o <code>SKILL.md</code> dentro. Não aninhe um segundo <code>.claude</code>.', 'Instalação'],
  ['Abra o Claude Code', 'Ele detecta a skill automaticamente ao iniciar.', 'Setup'],
  ['Ative a skill', 'Na pasta do projeto, digite <code>use skill mestre-squad-builder</code> para acionar o construtor de squads.', 'Uso'],
  ['Descreva o objetivo do squad', 'Cole o pedido em linguagem natural (como nos squads desta aula) — diga o que o squad deve fazer.', 'Uso'],
  ['Responda a entrevista', 'Ela pergunta em pares e detecta a infraestrutura sozinha. Confirme o resumo.', 'Uso'],
  ['Receba o squad montado', 'Ela gera todos os arquivos e entrega o manual final pronto pra rodar.', 'Entrega'],
].map(([t, d, tag], i) => `
          <div class="sq-step">
            <div class="sq-step-num">${i + 1}</div>
            <div class="sq-step-body"><h4>${esc(t)}</h4><p>${d}</p><span class="sq-step-tag">${tag}</span></div>
          </div>`).join('');

const SKILL = `
    <section id="sq-skill-builder" class="topic">
      <header class="topic-header">
        <span class="eyebrow eyebrow-special">Extra · Skill</span>
        <h1>Skill: Gerador de Squads</h1>
        <p class="lead">
          Você viu os ${squads.length} squads prontos. Esta skill faz o inverso: ela <strong>constrói squads completos do zero</strong>
          pra você. Descreva o objetivo e ela arquiteta os agentes, as skills e a infraestrutura — e entrega o
          sistema inteiro montado, sozinha.
        </p>
        <div class="sq-chips">
          <span class="sq-chip sq-chip--agent">${svg('cpu', 13)} skill autônoma</span>
          <span class="sq-chip sq-chip--skill">${svg('wrench', 13)} 5 fases</span>
          <span class="sq-chip sq-chip--free">${svg('check', 13)} grátis</span>
        </div>
      </header>

      <div class="sq-download">
        <div class="sq-download__ic">${downloadSvg(24)}</div>
        <div class="sq-download__txt">
          <h4>Baixe a skill</h4>
          <p>Arquivo <code>mestre-squad-builder.skill</code> — baixa direto, sem abrir o Drive.</p>
        </div>
        <a class="sq-download__btn" href="${SKILL_DOWNLOAD}" download rel="noopener">${downloadSvg(18)} Baixar a skill</a>
      </div>

      <div class="sq-callout">
        <span class="sq-callout-ic">${svg('sparkles')}</span>
        <div><h4>O que é</h4><p>Uma skill que age como <strong>arquiteta de sistemas multi-agente</strong>. Você descreve o objetivo; ela reconhece o contexto, entrevista você, projeta a arquitetura e gera o squad inteiro — agentes, skills, infraestrutura e manual. Como a própria skill resume: <em>"você não é um gerador de arquivos, é um arquiteto de sistemas completos."</em></p></div>
      </div>

      <h2 class="section-title">Os 7 princípios invioláveis</h2>
      <p class="section-desc">São as regras que a skill aplica em todo squad que constrói — o que garante um sistema coerente, e não um amontoado de scripts.</p>
      <div class="sq-premises">${skillPrincipios}
      </div>

      <h2 class="section-title">Como funciona — 5 fases</h2>
      <div class="sq-steps">${skillFases}
      </div>

      <h2 class="section-title">O que ela gera automaticamente</h2>
      <div class="sq-outputs">${skillOutputs}
      </div>

      <h2 class="section-title">Como instalar e usar</h2>
      <div class="sq-steps">${skillInstalar}
      </div>

      <nav class="sq-pager">
        <a href="#sq-overview" data-target="sq-overview"><small>${svg('arrowL', 12)} Visão geral</small><b>O que é um squad</b></a>
        <a href="#${sqId(squads[0])}" data-target="${sqId(squads[0])}" class="next"><small>Squad ${squads[0].n} ${svg('arrowR', 12)}</small><b>${esc(squads[0].title)}</b></a>
      </nav>
    </section>
`;

/* modal único, reutilizado por todos os squads (overlay fixo) */
const MODAL = `
    <!-- modal do prompt · folha A4 sobre fundo escuro (script.js controla) -->
    <div class="prompt-modal" id="promptModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="promptModalTitle">
      <div class="prompt-modal__backdrop" data-prompt-close></div>
      <div class="prompt-modal__sheet" role="document">
        <header class="prompt-modal__head">
          <div class="prompt-modal__meta">
            <span class="prompt-modal__file">${svg('doc', 14)} prompt-montagem.md</span>
            <h3 id="promptModalTitle">Prompt de montagem</h3>
          </div>
          <div class="prompt-modal__actions">
            <button class="copy-btn" id="promptModalCopy">${svg('copy', 14)}<span class="copy-label">Copiar</span></button>
            <button class="prompt-modal__close" data-prompt-close aria-label="Fechar">${closeSvg}</button>
          </div>
        </header>
        <div class="prompt-modal__body">
          <pre class="prompt-modal__pre" id="promptModalPre"></pre>
        </div>
      </div>
    </div>
`;

const TOPICS = OVERVIEW + SKILL + squads.map(buildSquadTopic).join('') + MODAL;

/* =====================================================================
   INJEÇÃO — troca só o miolo entre os marcadores
   ===================================================================== */
function replaceBetween(src, startTag, endTag, body) {
  const start = src.indexOf(startTag);
  const end = src.indexOf(endTag);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Marcadores não encontrados: ${startTag} / ${endTag}`);
  }
  return src.slice(0, start + startTag.length) + body + src.slice(end);
}

let html = readFileSync(INDEX, 'utf8');
html = replaceBetween(html, '<!-- AULA04-NAV-START -->', '      <!-- AULA04-NAV-END -->', NAV);
html = replaceBetween(html, '<!-- AULA04-TOPICS-START -->', '    <!-- AULA04-TOPICS-END -->', TOPICS);
writeFileSync(INDEX, html, 'utf8');

console.log(`✓ index.html — Aula 04 in-page: visão geral + ${squads.length} squads (${totalAgents} agentes, ${totalSkills} skills).`);
console.log(`  tamanho final: ${(html.length / 1024).toFixed(0)} KB`);
