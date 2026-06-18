/* =========================================================================
   RUMO AO BI — Grupo FAJ
   script.js · jornada de progresso interativa
   ========================================================================= */

/* -------------------------------------------------------------------------
   DADOS DA CAMPANHA — EDITE AQUI
   -------------------------------------------------------------------------
   Para atualizar a campanha, altere apenas este array.
     value      → valor exibido no marco (ex.: "100M", "1 BI")
     status     → "unlocked" (conquistado) ou "locked" (bloqueado)
     title      → nome da conquista
     description→ texto de apoio
     image      → (opcional) caminho de uma imagem; deixe "" para placeholder
     highlight  → (opcional) rótulo do destaque/conquista
     breaker    → (opcional) frase-respiro exibida DEPOIS deste marco,
                  entre uma fase e outra da timeline

   O ÚLTIMO marco com status "unlocked" recebe automaticamente o destaque
   especial "Conquista desbloqueada" (banner com troféu).
   ------------------------------------------------------------------------- */
const MILESTONES = [
  {
    value: "200M",
    status: "unlocked",
    title: "O primeiro passo",
    description: "O começo de tudo. A prova de que a meta é real e o movimento já está em marcha.",
    image: "",
    breakerBefore: "O movimento começou."
  },
  {
    value: "400M",
    status: "unlocked",
    title: "Ganhando tração",
    description: "A operação encontra seu ritmo. Processos amadurecem e o crescimento se torna consistente.",
    image: "",
    breakerBefore: "Cada avanço carrega o esforço coletivo."
  },
  {
    value: "600M",
    status: "unlocked",
    title: "Expansão",
    description: "Novos mercados, novas possibilidades. O alcance da empresa atinge outro patamar.",
    image: "",
    breakerBefore: "O resultado aparece porque o trabalho é constante."
  },
  {
    value: "800M",
    status: "unlocked",
    title: "Reta de elite",
    description: "Pouquíssimas empresas chegam até aqui. Estamos entre as grandes.",
    image: "",
    breakerBefore: "O que estamos construindo já é grande."
  },
  {
    value: "900M",
    status: "unlocked",
    title: "À beira do bilhão",
    description: "O último degrau antes do topo. A conquista histórica está ao alcance das mãos.",
    image: "",
    breakerBefore: "Esse caminho só existe porque estamos juntos."
  }
];

/* -------------------------------------------------------------------------
   TRAVA DA PÁGINA — EDITE AQUI
   -------------------------------------------------------------------------
   Mostra a jornada só até este marco (inclusive). Tudo depois dele — demais
   marcos, a seção do 1 bilhão, a chamada final, os sorteios e o encerramento —
   fica oculto até você liberar.
   Para liberar mais conforme as metas forem batidas, troque o valor:
     "400M" → "600M" → "800M" → "900M"
   Para liberar a página inteira, use: null
   ------------------------------------------------------------------------- */
const GATE_VALUE = null;

/* -------------------------------------------------------------------------
   FRASES DA ABERTURA — EDITE AQUI
   -------------------------------------------------------------------------
   Aparecem uma a uma em scroll horizontal no topo do site.
   Use <em>...</em> para itálico leve e <strong>...</strong> para ênfase.
   Pode adicionar ou remover frases livremente — o restante se ajusta.
   ------------------------------------------------------------------------- */
const PHRASES = [
  "Toda grande conquista<br />começa com uma <em>decisão</em>.",
  "A decisão de<br /><em>pensar maior</em>.",
  "De transformar metas<br />em <em>movimento</em>.",
  "De construir, juntos,<br />algo <em>sem precedentes</em>.",
  "O resultado é<br /><em>coletivo</em>.",
  "A execução é<br /><em>diária</em>.",
  "__LOGO__"   // slide final: logo com efeito de preenchimento no scroll
];

/* -------------------------------------------------------------------------
   PRÊMIOS DO SORTEIO — EDITE AQUI
   -------------------------------------------------------------------------
   Em ordem de ranking (1º = melhor prêmio). Os 3 primeiros viram o pódio;
   os demais entram na lista. "note" é opcional (rótulo pequeno).
   Edite, adicione ou remova prêmios livremente.
   ------------------------------------------------------------------------- */
const PRIZES = [
  { name: "iPhone 16 Pro Max", note: "Prêmio principal" },
  { name: "Smart TV 65\" 4K",   note: "Segundo lugar" },
  { name: "PlayStation 5",      note: "Terceiro lugar" }
];

/* ------------------------------------------------------------------ */

const SVG_NS = "http://www.w3.org/2000/svg";

const els = {
  list:        document.getElementById("milestones"),
  track:       document.getElementById("journeyTrack"),
  svg:         document.getElementById("journeySvg"),
  pathBase:    document.getElementById("pathBase"),
  pathProg:    document.getElementById("pathProgress"),
  header:      document.getElementById("siteHeader"),
  achievement: document.getElementById("achievement"),
  achName:     document.getElementById("achievementName"),
  statProg:    document.getElementById("statProgress"),
  intro:       document.getElementById("scrollIntro"),
  introTrack:  document.getElementById("introTrack"),
  introHint:   document.getElementById("introHint"),
  bigNum:      document.getElementById("journeyBigNum"),
  bigNumWrap:  document.querySelector(".journey__bignum-wrap"),
  prizesPodium: document.getElementById("prizesPodium"),
  prizesList:  document.getElementById("prizesList"),
  drawBtn:     document.getElementById("drawBtn"),
  drawResult:  document.getElementById("drawResult")
};

/* índice do último marco desbloqueado */
let lastUnlockedIndex = -1;
MILESTONES.forEach((m, i) => { if (m.status === "unlocked") lastUnlockedIndex = i; });

const lockSVG = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2"></rect>
    <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
  </svg>`;

/* ---------- Render dos milestones ---------- */
function renderMilestones() {
  const frag = document.createDocumentFragment();

  // trava: índice do último marco visível (o portão). -1 = libera tudo.
  const gateIndex = GATE_VALUE
    ? MILESTONES.findIndex((m) => m.value === GATE_VALUE)
    : -1;
  const lastVisible = gateIndex >= 0 ? gateIndex : MILESTONES.length - 1;
  // próxima meta bloqueada (recebe o aviso "Próxima meta bloqueada")
  const firstLockedIndex = MILESTONES.findIndex((m) => m.status === "locked");

  MILESTONES.forEach((m, i) => {
    if (i > lastVisible) return;                 // travado: não renderiza além do portão
    const unlocked = m.status === "unlocked";
    const isCurrent = i === lastUnlockedIndex;
    const side = i % 2 === 0 ? "right" : "left";       // alterna lados
    const weave = i % 2 === 0 ? 30 : -30;              // sinuosidade da trilha

    // frase-respiro exibida ANTES deste marco (se definida)
    if (m.breakerBefore) {
      const breakerB = document.createElement("div");
      breakerB.className = "journey__breaker reveal" + (unlocked ? "" : " journey__breaker--locked");
      breakerB.innerHTML = `<p>${m.breakerBefore}</p>`;
      frag.appendChild(breakerB);
    }

    const art = document.createElement("article");
    art.className = [
      "milestone",
      `milestone--${side}`,
      unlocked ? "milestone--unlocked" : "milestone--locked",
      isCurrent ? "milestone--current" : ""
    ].join(" ").trim();
    art.dataset.index = i;
    art.style.setProperty("--weave", `${weave}px`);

    const media = m.image
      ? `<img src="${m.image}" alt="${m.title}" loading="lazy" />`
      : `<span class="milestone__media-placeholder">${unlocked ? "Conquista" : "Bloqueado"}</span>`;

    const statusBadge = unlocked
      ? `<span class="milestone__status">Desbloqueado</span>`
      : `<span class="milestone__status">Bloqueado</span>`;

    const lockIcon = unlocked ? "" : `<span class="milestone__lock">${lockSVG}</span>`;

    art.innerHTML = `
      <div class="milestone__node"><span class="milestone__dot"></span></div>
      <div class="milestone__card">
        <div class="milestone__card-inner">
          <div class="milestone__media">${media}</div>
          <div class="milestone__body">
            <div class="milestone__value-row">
              ${lockIcon}
              <span class="milestone__value">${m.value}</span>
              ${statusBadge}
            </div>
            <h3 class="milestone__title">${m.title}</h3>
            <p class="milestone__desc">${m.description}</p>
          </div>
        </div>
      </div>`;

    frag.appendChild(art);

    // aviso "Próxima meta bloqueada" sobreposto na próxima meta travada
    if (i === firstLockedIndex) {
      art.classList.add("milestone--gate");
      const locked = document.createElement("div");
      locked.className = "journey__locked reveal";
      locked.innerHTML = `
        <span class="journey__locked-icon" aria-hidden="true">${lockSVG}</span>
        <p class="journey__locked-title">Próxima meta bloqueada</p>
        <p class="journey__locked-text">A jornada continua a cada nova meta alcançada.<br />Seguimos construindo rumo ao bilhão.</p>`;
      art.appendChild(locked);
    }

    // frase-respiro entre as fases (se definida neste marco)
    if (m.breaker) {
      const breaker = document.createElement("div");
      breaker.className = "journey__breaker reveal";
      breaker.innerHTML = `<p>${m.breaker}</p>`;
      frag.appendChild(breaker);
    }
  });

  els.list.appendChild(frag);

  // se houver portão ativo, oculta as seções abaixo do portão
  if (gateIndex >= 0 && gateIndex < MILESTONES.length - 1) {
    document.body.classList.add("is-gated");
  }
}

/* ---------- Geração da trilha (Catmull-Rom → Bézier) ---------- */
function getNodePoints() {
  const trackRect = els.track.getBoundingClientRect();
  const dots = els.track.querySelectorAll(".milestone__node");
  const nodePts = [];

  dots.forEach((d) => {
    const r = d.getBoundingClientRect();
    nodePts.push({
      x: r.left - trackRect.left + r.width / 2,
      y: r.top - trackRect.top + r.height / 2
    });
  });

  if (!nodePts.length) return [];

  // âncoras de topo/base — a base termina centralizada p/ a linha de
  // continuação (até o rodapé) encaixar de forma suave
  const first = nodePts[0];
  const centerX = trackRect.width / 2;
  return [
    { x: first.x, y: 0 },
    ...nodePts,
    { x: centerX, y: trackRect.height }
  ];
}

function buildPathD(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

let progLength = 0;       // comprimento do trecho desbloqueado
let progTopY = 0;         // y (no track) onde termina o trecho desbloqueado

function drawTrack() {
  const points = getNodePoints();
  if (!points.length) return;
  const rect = els.track.getBoundingClientRect();

  els.svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);

  // caminho base completo
  els.pathBase.setAttribute("d", buildPathD(points));

  // caminho de progresso: do topo até o último marco desbloqueado
  // points[0] é o topo; nós começam em index 1
  if (lastUnlockedIndex >= 0) {
    const upto = points.slice(0, lastUnlockedIndex + 2); // +1 topo, +1 inclusivo
    els.pathProg.setAttribute("d", buildPathD(upto));
    progLength = els.pathProg.getTotalLength();
    progTopY = points[lastUnlockedIndex + 1].y;
    els.pathProg.style.strokeDasharray = progLength;
    updateProgress();
  } else {
    els.pathProg.setAttribute("d", "");
  }
}

/* ---------- Progresso da trilha vinculado ao scroll ---------- */
function updateProgress() {
  if (!progLength) return;
  const rect = els.track.getBoundingClientRect();
  const trigger = window.innerHeight * 0.62;
  // distância "revelada" dentro do track
  const revealed = trigger - rect.top;
  const frac = Math.max(0, Math.min(1, revealed / progTopY));
  els.pathProg.style.strokeDashoffset = progLength * (1 - frac);
}

/* ---------- Valor gigante em outline (marco ativo) ---------- */
function updateBigNum() {
  if (!els.bigNum || !els.list) return;
  const centerY = window.innerHeight / 2;
  const cards = els.list.querySelectorAll(".milestone");
  let best = null, bestDist = Infinity;
  cards.forEach((c) => {
    const r = c.getBoundingClientRect();
    const d = Math.abs(r.top + r.height / 2 - centerY);
    if (d < bestDist) { bestDist = d; best = c; }
  });
  if (!best) return;

  const idx = +best.dataset.index;
  if (els.bigNum.dataset.idx === String(idx)) return;   // nada mudou

  const m = MILESTONES[idx];
  els.bigNum.dataset.idx = String(idx);
  els.bigNum.textContent = m.value;
  if (els.bigNumWrap) {
    els.bigNumWrap.classList.toggle("is-locked", m.status !== "unlocked");
  }
  // re-dispara a animação de entrada
  els.bigNum.classList.remove("is-in");
  void els.bigNum.offsetWidth;
  els.bigNum.classList.add("is-in");
}

/* ---------- Reveal no scroll ---------- */
function setupReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal, .milestone").forEach((el) => io.observe(el));

  // Salvaguarda: se por algum motivo o observer não disparar, revela tudo.
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.in-view), .milestone:not(.in-view)")
      .forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add("in-view");
      });
  }, 1200);
}

/* ---------- Sorteio de prêmios: render + interação ---------- */
function renderPrizes() {
  if (!els.prizesPodium || !els.prizesList) return;

  const podium = document.createDocumentFragment();
  PRIZES.slice(0, 3).forEach((p, i) => {
    const rank = i + 1;
    const card = document.createElement("div");
    card.className = `prize-card prize-card--${rank} reveal`;
    card.dataset.rank = rank;
    card.innerHTML = `
      <span class="prize-card__rank">${rank}º</span>
      <span class="prize-card__name">${p.name}</span>
      ${p.note ? `<span class="prize-card__note">${p.note}</span>` : ""}
      <span class="prize-card__badge">Sorteado</span>`;
    podium.appendChild(card);
  });
  els.prizesPodium.appendChild(podium);

  const rest = PRIZES.slice(3);
  if (!rest.length) { els.prizesList.style.display = "none"; return; }

  const list = document.createDocumentFragment();
  rest.forEach((p, i) => {
    const rank = i + 4;
    const row = document.createElement("div");
    row.className = "prize-row reveal";
    row.dataset.rank = rank;
    row.innerHTML = `
      <span class="prize-row__rank">${rank}º</span>
      <span class="prize-row__name">${p.name}</span>
      <span class="prize-row__badge">Sorteado</span>`;
    list.appendChild(row);
  });
  els.prizesList.appendChild(list);
}

function setupRaffle() {
  const btn = els.drawBtn;
  if (!btn) return;

  // todos os prêmios em ordem de ranking
  const items = [...document.querySelectorAll(".prize-card, .prize-row")]
    .sort((a, b) => (+a.dataset.rank) - (+b.dataset.rank));
  if (!items.length) return;

  let running = false;
  const clearStates = () =>
    items.forEach((i) => i.classList.remove("is-rolling", "is-winner"));

  btn.addEventListener("click", () => {
    if (running) return;
    running = true;
    btn.disabled = true;
    clearStates();
    els.drawResult.textContent = "Sorteando…";

    const winner = Math.floor(Math.random() * items.length);
    const total = items.length * 3 + winner;   // ~3 voltas + parada
    let step = 0;

    const tick = () => {
      items.forEach((i) => i.classList.remove("is-rolling"));
      if (step > total) {
        items[winner].classList.add("is-winner");
        els.drawResult.innerHTML = `Prêmio sorteado — <span>${PRIZES[winner].name}</span>`;
        btn.disabled = false;
        btn.querySelector(".prizes__draw-label").textContent = "Sortear novamente";
        running = false;
        return;
      }
      items[step % items.length].classList.add("is-rolling");
      step++;
      // desacelera no final (efeito roleta)
      const remaining = total - step;
      const delay = remaining < items.length ? 80 + (items.length - remaining) * 45 : 65;
      setTimeout(tick, delay);
    };
    tick();
  });
}

/* ---------- Header no scroll (oculto durante a abertura) ---------- */
function setupHeader() {
  const onScroll = () => {
    // só aparece depois da seção de abertura
    const introH = els.intro ? els.intro.offsetHeight : 0;
    const threshold = introH + window.innerHeight * 0.7;
    if (window.scrollY > threshold) {
      els.header.classList.add("is-visible");
    } else {
      els.header.classList.remove("is-visible");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Toast: conquista desbloqueada ---------- */
function setupAchievement() {
  if (lastUnlockedIndex < 0) return;
  const current = els.list.querySelector(".milestone--current");
  if (!current) return;

  const m = MILESTONES[lastUnlockedIndex];
  els.achName.textContent = `${m.value} — ${m.title}`;

  let shown = false;
  let hideTimer = null;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !shown) {
        shown = true;
        els.achievement.classList.add("is-shown");
        hideTimer = setTimeout(() => els.achievement.classList.remove("is-shown"), 5200);
      }
    });
  }, { threshold: 0.5 });

  io.observe(current);

  // permitir fechar ao clicar
  els.achievement.addEventListener("click", () => {
    clearTimeout(hideTimer);
    els.achievement.classList.remove("is-shown");
  });
}

/* ---------- Finale: contagem até 1 bilhão + comemoração ---------- */
function setupFinale() {
  const section = document.getElementById("bilhao");
  if (!section) return;
  const numEl = document.getElementById("finaleNum");
  const confetti = document.getElementById("finaleConfetti");
  const story = document.getElementById("finaleStory");
  const storyItems = story ? Array.from(story.children) : [];
  const TARGET = 1000000000;                 // 1 bilhão
  const COUNT_END = 0.55;                     // contagem completa em 55% do scroll
  const STORY_START = 0.6;                    // texto começa a aparecer em 60%
  const fmt = (v) => Math.round(v).toLocaleString("pt-BR");
  let completed = false;

  // movimento reduzido: mostra o resultado final já concluído
  if (reduceMotion) {
    numEl.textContent = fmt(TARGET);
    section.classList.add("is-complete");
    return;
  }

  const easeOut = (x) => 1 - Math.pow(1 - x, 3);

  function update() {
    const vh = window.innerHeight;
    const top = section.offsetTop;
    const totalScroll = section.offsetHeight - vh;
    if (totalScroll <= 0) return;

    let p = (window.scrollY - top) / totalScroll;
    p = Math.max(0, Math.min(1, p));

    // contagem (0 -> 1 bilhão) na 1ª parte do scroll
    const frac = Math.max(0, Math.min(1, p / COUNT_END));
    numEl.textContent = fmt(easeOut(frac) * TARGET);

    if (frac >= 1 && !completed) {
      completed = true;
      numEl.textContent = fmt(TARGET);
      section.classList.add("is-complete");
      launchConfetti(confetti);
    } else if (p < 0.4 && completed) {
      // rolou de volta: permite repetir a comemoração
      completed = false;
      section.classList.remove("is-complete");
      if (confetti) confetti.innerHTML = "";
    }

    // texto (print 1) revelado palavra-bloco a bloco no resto do scroll
    if (storyItems.length) {
      const sp = Math.max(0, Math.min(1, (p - STORY_START) / (1 - STORY_START)));
      const M = storyItems.length;
      const band = 1.4;                        // suavidade entre os blocos
      const front = sp * (M + band);
      for (let k = 0; k < M; k++) {
        const wp = Math.max(0, Math.min(1, (front - k) / band));
        const ease = wp * wp * (3 - 2 * wp);
        storyItems[k].style.opacity = ease.toFixed(3);
        storyItems[k].style.transform = `translateY(${((1 - ease) * 0.7).toFixed(3)}rem)`;
      }
    }
  }

  window.addEventListener("scroll", rafThrottle(update), { passive: true });
  window.addEventListener("resize", rafThrottle(update), { passive: true });
  update();
}

function launchConfetti(container) {
  if (!container) return;
  container.innerHTML = "";
  const colors = ["#ffffff", "#d8d8d8", "#a8a8a8", "#e8c66a", "#cfcfcf"];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    const size = 5 + Math.random() * 7;
    piece.style.setProperty("--x", (Math.random() * 100).toFixed(2) + "%");
    piece.style.setProperty("--s", size.toFixed(1) + "px");
    piece.style.setProperty("--c", colors[i % colors.length]);
    piece.style.setProperty("--dur", (2.6 + Math.random() * 2.4).toFixed(2) + "s");
    piece.style.setProperty("--delay", (Math.random() * 0.7).toFixed(2) + "s");
    piece.style.setProperty("--rot", (Math.random() * 720 - 360).toFixed(0) + "deg");
    frag.appendChild(piece);
  }
  container.appendChild(frag);
}

/* ---------- Stat: % do caminho percorrido ---------- */
function setupStats() {
  const total = MILESTONES.length;
  const unlocked = MILESTONES.filter((m) => m.status === "unlocked").length;
  const pct = Math.round((unlocked / total) * 100);
  if (els.statProg) els.statProg.textContent = `${pct}%`;
}

/* ---------- Abertura: frases em scroll horizontal ---------- */
const reduceMotion = window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Quebra um HTML de frase em palavras envolvidas em <span class="scroll-intro__word">,
   preservando <em>/<strong>, <br> e os espaços. Retorna a lista de spans em ordem. */
function wrapWordsInto(container, html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const words = [];

  function transform(node) {
    const out = [];
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (part === "") return;
          if (/^\s+$/.test(part)) {
            out.push(document.createTextNode(part));
          } else {
            const span = document.createElement("span");
            span.className = "scroll-intro__word";
            span.textContent = part;
            words.push(span);
            out.push(span);
          }
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === "BR") {
          out.push(child.cloneNode(false));
        } else {
          const clone = child.cloneNode(false);          // mantém <em>/<strong>
          transform(child).forEach((n) => clone.appendChild(n));
          out.push(clone);
        }
      }
    });
    return out;
  }

  transform(tmp).forEach((n) => container.appendChild(n));
  return words;
}

function setupIntro() {
  if (!els.intro || !els.introTrack || !PHRASES.length) return;

  // renderiza as frases
  const tpl = document.getElementById("logoSvgTpl");
  const frag = document.createDocumentFragment();
  const wordSets = [];                                    // palavras por frase (null = logo)
  PHRASES.forEach((text) => {
    const phrase = document.createElement("div");
    phrase.className = "scroll-intro__phrase";
    if (text === "__LOGO__" && tpl) {
      phrase.classList.add("scroll-intro__phrase--logo");
      const logo = document.createElement("span");
      logo.className = "scroll-intro__logo";
      logo.setAttribute("role", "img");
      logo.setAttribute("aria-label", "Rumo ao Bi");
      // duas camadas: contorno (traçado) + preenchimento sólido
      const outline = document.createElement("span");
      outline.className = "scroll-intro__logo-layer scroll-intro__logo-layer--outline";
      outline.appendChild(tpl.content.cloneNode(true));
      const fill = document.createElement("span");
      fill.className = "scroll-intro__logo-layer scroll-intro__logo-layer--fill";
      fill.appendChild(tpl.content.cloneNode(true));
      // camada da frase pequena ("grandes metas...") — aparece só no fim
      const tag = document.createElement("span");
      tag.className = "scroll-intro__logo-tagline";
      tag.appendChild(tpl.content.cloneNode(true));
      logo.append(outline, fill, tag);
      phrase.appendChild(logo);
      // conteúdo (Grupo FAJ, subtítulo, CTA) abaixo do logo — revelado no scroll
      const infoTpl = document.getElementById("logoInfoTpl");
      if (infoTpl) phrase.appendChild(infoTpl.content.cloneNode(true));
      wordSets.push(null);
    } else {
      const p = document.createElement("p");
      p.className = "scroll-intro__text";
      wordSets.push(wrapWordsInto(p, text));
      phrase.appendChild(p);
    }
    frag.appendChild(phrase);
  });
  els.introTrack.appendChild(frag);
  els.introWordSets = wordSets;
  els.introLogoTrace = els.introTrack.querySelector(".scroll-intro__logo-layer--outline");
  els.introLogoFill = els.introTrack.querySelector(".scroll-intro__logo-layer--fill");
  els.introTagline = els.introTrack.querySelector(".scroll-intro__logo-tagline");
  const infoBlock = els.introTrack.querySelector(".scroll-intro__info");
  els.introInfoItems = infoBlock ? Array.from(infoBlock.children) : [];

  // fallback estático para movimento reduzido
  if (reduceMotion) {
    els.intro.classList.add("is-static");
    return;
  }

  // altura da seção define o "comprimento" do scroll horizontal
  // ~108vh de rolagem por frase (mais folga p/ deslize lento + reveal no ritmo)
  els.intro.style.height = `${PHRASES.length * 108}vh`;

  window.addEventListener("scroll", rafThrottle(updateIntro), { passive: true });
  window.addEventListener("resize", rafThrottle(updateIntro), { passive: true });
  updateIntro();
}

function updateIntro() {
  if (reduceMotion || !els.intro) return;
  const vh = window.innerHeight;
  const top = els.intro.offsetTop;
  const total = els.intro.offsetHeight - vh;          // distância rolável
  if (total <= 0) return;

  let p = (window.scrollY - top) / total;             // progresso 0..1
  p = Math.max(0, Math.min(1, p));

  const phrases = els.introTrack.children;
  const n = phrases.length;
  const maxX = els.introTrack.scrollWidth - window.innerWidth;

  /* ---- Coreografia: cada frase PARA no centro e, enquanto se rola, suas
     palavras vão acendendo uma a uma. Depois o trilho desliza para a próxima.
     HOLD_W = peso do tempo "parado revelando"; MOVE_W = peso da transição. ---- */
  const HOLD_W = 1.0;
  const MOVE_W = 1.3;                                   // transição entre frases (maior = mais lento/suave)
  const HOLD_LOGO = 2.4;                                // logo desenha + conteúdo aparece
  const holdFor = (i) => (i === n - 1 ? HOLD_LOGO : HOLD_W);

  let totalW = (n - 1) * MOVE_W;
  for (let i = 0; i < n; i++) totalW += holdFor(i);
  const t = p * totalW;

  const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

  let vis = n - 1;        // posição visual contínua (0..n-1) p/ pan/opacidade
  let currentI = n - 1;   // frase em foco no momento
  let reveal = 1;         // progresso de revelação da frase em foco (0..1)
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const hold = holdFor(i);
    // fase "parado revelando" da frase i
    if (t <= acc + hold || i === n - 1) {
      currentI = i;
      vis = i;
      reveal = Math.max(0, Math.min(1, (t - acc) / hold));
      break;
    }
    acc += hold;
    // fase "transição" da frase i -> i+1 (frase i já revelada)
    if (t <= acc + MOVE_W) {
      currentI = i;
      vis = i + easeInOut((t - acc) / MOVE_W);
      reveal = 1;
      break;
    }
    acc += MOVE_W;
  }

  // deslocamento horizontal do trilho (segue a posição visual)
  els.introTrack.style.transform =
    `translate3d(${(-(vis / (n - 1)) * maxX).toFixed(2)}px,0,0)`;

  for (let i = 0; i < n; i++) {
    const d = Math.min(1, Math.abs(vis - i));          // distância até o centro
    const el = phrases[i];
    el.style.opacity = (1 - d).toFixed(3);
    el.style.transform = `scale(${(0.92 + 0.08 * (1 - d)).toFixed(3)})`;

    // revelação palavra a palavra (fade da esquerda p/ direita conforme o scroll).
    // a 1ª frase já entra 100% revelada; as já passadas ficam cheias; a do centro
    // acende conforme "reveal"; as próximas ainda não apareceram.
    const words = els.introWordSets && els.introWordSets[i];
    if (words && words.length) {
      let lr;
      if (i === 0) lr = 1;
      else if (i < currentI) lr = 1;
      else if (i === currentI) lr = reveal;
      else lr = 0;

      const K = words.length;
      const band = 2.8;                                // largura do degradê (em palavras)
      const minOp = 0;                                 // palavra ainda não revelada = invisível
      const front = lr * (K + band);
      for (let k = 0; k < K; k++) {
        const wp = Math.max(0, Math.min(1, (front - k) / band));
        const ease = wp * wp * (3 - 2 * wp);           // suaviza a entrada (smoothstep)
        words[k].style.opacity = (minOp + (1 - minOp) * ease).toFixed(3);
        words[k].style.transform = `translateY(${((1 - ease) * 0.12).toFixed(3)}em)`;
      }
    }
  }

  // some com o "role para avançar" assim que começa
  if (els.introHint) els.introHint.style.opacity = p > 0.04 ? "0" : "1";

  // logo final: contorno "traçado" da esquerda p/ direita + preenchimento branco
  // (na 1ª metade do hold) e, na 2ª metade, o conteúdo abaixo aparece em fade.
  if (els.introLogoTrace && els.introLogoFill) {
    const f = currentI === n - 1 ? reveal : 0;
    const trace = Math.max(0, Math.min(1, f / 0.30));             // contorno lidera
    const fill = Math.max(0, Math.min(1, (f - 0.12) / 0.30));     // preenchimento segue atrás
    els.introLogoTrace.style.setProperty("--reveal", (trace * 100).toFixed(1) + "%");
    els.introLogoFill.style.setProperty("--reveal", (fill * 100).toFixed(1) + "%");
    // a frase pequena ("grandes metas...") aparece logo após o preenchimento
    if (els.introTagline) {
      const tag = Math.max(0, Math.min(1, (f - 0.38) / 0.12));
      els.introTagline.style.opacity = tag.toFixed(3);
    }

    // conteúdo abaixo do logo (Grupo FAJ, subtítulo, CTA): fade escalonado
    // na 2ª metade do hold do logo (f de 0.5 -> 1).
    const items = els.introInfoItems;
    if (items && items.length) {
      const infoP = Math.max(0, Math.min(1, (f - 0.5) / 0.5));
      const M = items.length;
      const overlap = 1.6;                              // suavidade entre itens
      const front = infoP * (M + overlap);
      for (let k = 0; k < M; k++) {
        const wp = Math.max(0, Math.min(1, (front - k) / overlap));
        const ease = wp * wp * (3 - 2 * wp);
        items[k].style.opacity = ease.toFixed(3);
        // limpa o transform quando 100% revelado p/ não quebrar o :hover do botão
        items[k].style.transform = ease >= 1 ? "" : `translateY(${((1 - ease) * 0.6).toFixed(3)}rem)`;
      }
    }
  }
}

/* ---------- Throttle via rAF ---------- */
function rafThrottle(fn) {
  let ticking = false;
  return () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { fn(); ticking = false; });
    }
  };
}

/* ---------- Smooth scroll com inércia (Lenis) ---------- */
function setupSmoothScroll() {
  if (reduceMotion || typeof Lenis === "undefined") return;

  const lenis = new Lenis({
    lerp: 0.085,            // peso/continuidade (menor = "desliza" mais)
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,       // mobile usa scroll nativo (não trava o toque)
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // navegação por âncora suave (ex.: "Explorar a jornada")
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute("href");
    if (!id || id.length < 2) return;
    a.addEventListener("click", (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
    });
  });
}

/* ---------- Parallax sutil (camadas decorativas) ---------- */
function setupParallax() {
  if (reduceMotion) return;
  const items = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!items.length) return;

  const update = () => {
    const vh = window.innerHeight;
    items.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const offset = (center - vh / 2) * speed;
      el.style.setProperty("--py", `${(-offset).toFixed(1)}px`);
    });
  };

  window.addEventListener("scroll", rafThrottle(update), { passive: true });
  window.addEventListener("resize", rafThrottle(update), { passive: true });
  update();
}

/* ---------- Init ---------- */
function init() {
  setupSmoothScroll();
  setupIntro();
  renderMilestones();
  setupStats();
  setupFinale();
  setupReveal();
  setupParallax();
  setupHeader();
  setupAchievement();

  // desenhar a trilha após o layout estar pronto
  requestAnimationFrame(() => {
    drawTrack();
    requestAnimationFrame(drawTrack); // segunda passada (fontes/imagens)
  });

  const onJourneyScroll = rafThrottle(() => { updateProgress(); updateBigNum(); });
  window.addEventListener("scroll", onJourneyScroll, { passive: true });
  updateBigNum();   // estado inicial

  let resizeT = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(drawTrack, 150);
  });

  // recalcular quando as fontes carregarem (evita desalinhamento)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(drawTrack));
  }
  window.addEventListener("load", () => requestAnimationFrame(drawTrack));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
