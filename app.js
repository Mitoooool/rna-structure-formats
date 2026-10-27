(() => {
  "use strict";
  const A = window.ATLAS;
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const state = {format:"dbn",model:"nested",visual:"structure",position:null,study:"prediction",comparison:false};
  const initial = new URLSearchParams(location.search).get("format");
  if (A.formats.some(f => f.id === initial)) state.format = initial;
  const format = () => A.formats.find(f => f.id === state.format);
  const pairs = () => state.model === "pseudoknot" ? [...A.pairs, A.extraPair] : [...A.pairs];
  const partners = () => {
    const result = Array(A.sequence.length).fill(0);
    pairs().forEach(([i,j]) => { result[i-1] = j; result[j-1] = i; });
    return result;
  };
  const coords = [[205,260],[205,230],[205,200],[162,174],[159,135],[211,109],[211,78],[194,46],[220,24],[250,24],[276,46],[259,78],[259,109],[310,135],[307,174],[265,200],[265,230],[265,260]];
  const bracket = (extended = true, wuss = false) => {
    const chars = (wuss ? "<<<--<<____>>-->>>" : "(((..((....))..)))").split("");
    if (extended && state.model === "pseudoknot") {
      chars[A.extraPair[0]-1] = wuss ? "A" : "[";
      chars[A.extraPair[1]-1] = wuss ? "a" : "]";
    }
    return chars.join("");
  };
  const charRow = (text, wussLetters = false) => [...text].map((c,i) =>
    `<button type="button" class="code-char${"[]".includes(c) || (wussLetters && "Aa".includes(c)) ? " extra-symbol" : ""}" data-position="${i+1}" title="位置 ${i+1}，${esc(c)}" aria-label="位置 ${i+1}，${esc(c)}">${esc(c)}</button>`
  ).join("");
  let currentPlainText = "";

  function renderFormatList() {
    const query = $("format-search").value.trim().toLowerCase();
    const recommendation = A.studies.find(s => s.id === state.study).recommend;
    const results = A.formats.filter(f => [f.name,f.full,f.cn,...f.suited].join(" ").toLowerCase().includes(query));
    $("format-list").innerHTML = results.length ? A.groups.map(group => {
      const items = results.filter(f => f.group === group.id);
      if (!items.length) return "";
      return `<div class="format-group"><p class="format-group-label">${group.name}</p>${items.map(f =>
        `<button type="button" class="format-option${state.format === f.id ? " selected" : ""}${recommendation.includes(f.id) ? " recommended" : ""}" data-format="${f.id}" aria-pressed="${state.format === f.id}"><span class="format-option-name">${esc(f.name)}</span><span class="format-option-arrow">↗</span></button>`
      ).join("")}</div>`;
    }).join("") : '<p class="search-empty">无匹配格式</p>';
  }

  function selectFormat(id, scroll = false) {
    if (!A.formats.some(f => f.id === id)) return;
    state.format = id;
    state.comparison = false;
    $("format-search").value = "";
    renderFormatList();
    renderFormat();
    renderViewState();
    try {
      const url = new URL(location.href);
      url.searchParams.set("format", id);
      history.replaceState(null, "", url);
    } catch (_) { /* Local-file previews may restrict history; interaction still works. */ }
    if (scroll) $("explorer").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function renderFormat() {
    const f = format();
    $("format-kind").textContent = f.kind;
    $("format-extension").textContent = f.extension;
    $("format-title").textContent = f.name;
    $("format-full").textContent = `${f.full} / ${f.cn}`;
    $("format-index").textContent = String(A.formats.indexOf(f)+1).padStart(2,"0");
    $("format-what").textContent = f.what;
    $("format-why").textContent = f.why;
    $("format-suited").innerHTML = f.suited.map(s => `<span class="use-tag">${esc(s)}</span>`).join("");
    $("format-keeps").textContent = f.keeps;
    $("format-loses").textContent = f.loses;
    $("format-caution").textContent = f.caution;
    $("format-source").href = A.sources[f.source].url;
    $("format-source").title = A.sources[f.source].name;
    $("example-label").textContent = f.exampleLabel;
    renderCode();
    renderSelection();
  }

  function renderCode() {
    const f = format(), seq = A.sequence, ps = partners();
    const db = bracket(true), plainDb = bracket(false), wuss = bracket(true,true);
    let lines = [], key = "", warning = "";
    const text = (value, position = null) => ({plain:value,html:esc(value),position});
    const symbols = (value, prefix = "", wussLetters = false) => ({plain:prefix+value,html:esc(prefix)+charRow(value,wussLetters)});
    if (f.id === "dbn" || f.id === "extended") {
      lines = [text(">teaching_RNA"),symbols(seq),symbols(f.id === "dbn" ? plainDb : db)];
      key = f.id === "dbn" ? ". 未配对　 ( ) 匹配的配对伙伴" : ". 未配对　 () 主干配对　 [] 交叉配对";
      if (state.model === "pseudoknot" && f.id === "dbn") warning = "图中的 8–15 交叉配对无法写入普通 ().。本例文本仅保留 5 对主干；图中完整关系为 6 对。";
    } else if (f.id === "bpseq") {
      lines = [...seq].map((base,i) => text(`${String(i+1).padStart(2)} ${base} ${String(ps[i]).padStart(2)}`,i+1));
      key = "第 1 列：位置　 第 2 列：碱基　 第 3 列：伙伴（0 为未配对）";
    } else if (f.id === "ct") {
      lines = [text(`${seq.length}  teaching_RNA`),...[...seq].map((base,i) =>
        text(`${String(i+1).padStart(2)} ${base} ${String(i).padStart(2)} ${String(i===seq.length-1?0:i+2).padStart(2)} ${String(ps[i]).padStart(2)} ${String(i+1).padStart(2)}`,i+1))];
      key = "位置 / 碱基 / 前一位 / 后一位 / 配对伙伴 / 原始编号";
    } else if (f.id === "matrix") {
      const indices = [1,2,3,8,12,15,16,17,18];
      lines = [text("# 二值矩阵：选定行列"),text("i\\j "+indices.map(i=>String(i).padStart(2)).join(" "))];
      indices.forEach(i => lines.push(text(`${String(i).padStart(2)}  ${indices.map(j=>String(Number(ps[i-1]===j)).padStart(2)).join(" ")}`,i)));
      key = "1 表示配对，0 表示本结构中不配对；本例不是概率矩阵。";
    } else if (f.id === "wuss") {
      lines = [text("# sequence"),symbols(seq),text("# WUSS"),symbols(wuss,"",true)];
      key = state.model === "pseudoknot" ? "<> 配对　 _ 发夹环　 - 内环　 A/a 伪结伙伴" : "<> 配对　 _ 发夹环　 - 内环";
    } else if (f.id === "stockholm") {
      lines = [text("# STOCKHOLM 1.0"),text("#=GF ID teaching_RNA"),symbols(seq,"example          "),symbols(wuss,"#=GR example SS  ",true),symbols(wuss,"#=GC SS_cons     ",true),text("//")];
      key = "GF：文件级信息　 GR：单序列逐列注释　 GC：共识逐列注释";
    } else if (f.id === "bprna") {
      const types = [...seq].map((_,i)=>[1,2,3,6,7,12,13,16,17,18].includes(i+1)?"S":[8,9,10,11].includes(i+1)?"H":"I").join("");
      const knots = [...seq].map((_,i)=>state.model==="pseudoknot"&&[8,15].includes(i+1)?"K":"N").join("");
      lines = [text("# 类型数组示意，非完整 .st 文件"),text("sequence"),symbols(seq),text("structure"),symbols(db),text("types"),symbols(types),text("pseudoknot participation"),symbols(knots)];
      key = "S 茎　H 发夹环　I 内环；类型按主干划分，K 另标交叉配对端点。";
    } else if (f.id === "shape") {
      lines = [text("# 本例的结构树示意"),text("Stem 1"),text("├─ pairs: 3"),text("└─ Internal loop"),text("   └─ Stem 2"),text("      ├─ pairs: 2"),text("      └─ Hairpin")];
      key = "树示意保留嵌套层次；不是 RNAshapes 某一级别的标准输出。";
      if (state.model === "pseudoknot") warning = "本例嵌套树未包含 8–15 交叉配对；保留该关系需采用扩展图表示。";
    } else if (f.id === "ss") {
      lines = [text("# 位置 碱基 x y 类型 伙伴"),...coords.map(([x,y],i)=>text(`${String(i+1).padStart(2)} ${seq[i]} ${x.toFixed(1)} ${(-y).toFixed(1)} 0 ${String(ps[i]).padStart(2)}`,i+1))];
      key = "类型列以 0 示意；这里只展示碱基记录，不包含完整绘图指令。";
    } else if (f.id === "rnaml") {
      lines = [text("<!-- 简化片段，非完整可验证文件 -->"),text("<base-pair>"),text("  <base-id-5p><base-id>"),text("    <position>1</position>",1),text("  </base-id></base-id-5p>"),text("  <base-id-3p><base-id>"),text(`    <position>${ps[0]}</position>`,ps[0]),text("  </base-id></base-id-3p>"),text("</base-pair>")];
      key = "示意第 1 位与其伙伴的关系；其他配对和序列标签在片段中省略。";
    } else if (f.id === "mmcif") {
      lines = [text("# 坐标字段片段；非完整分子模型"),text("loop_"),text("_atom_site.id"),text("_atom_site.label_atom_id"),text("_atom_site.label_comp_id"),text("_atom_site.label_asym_id"),text("_atom_site.label_seq_id"),text("_atom_site.Cartn_x"),text("_atom_site.Cartn_y"),text("_atom_site.Cartn_z"),
        ...coords.slice(0,5).map(([x,y],i)=>text(`${i+1} P ${seq[i]} A ${i+1} ${(x/10).toFixed(2)} ${(y/10).toFixed(2)} ${(i*.3).toFixed(2)}`,i+1))];
      key = "构造坐标片段；P 为磷原子标识，A 为链标识。";
    }
    currentPlainText = lines.map(l=>l.plain).join("\n")+"\n";
    $("example-code").innerHTML = lines.map((line,i)=>
      `<div class="code-line"${line.position?` data-position="${line.position}" role="button" tabindex="0" aria-label="查看位置 ${line.position}"`:""}><span class="line-number" aria-hidden="true">${String(i+1).padStart(2,"0")}</span><code>${line.html}</code></div>`
    ).join("");
    $("example-code").scrollTop = 0;
    $("code-key").textContent = key;
    $("format-warning").hidden = !warning;
    $("format-warning").textContent = warning;
  }

  function nodeMarkup(i,x,y,small=false) {
    return `<g class="svg-node" data-position="${i}" role="button" tabindex="0" aria-label="位置 ${i}，${A.sequence[i-1]}，伙伴 ${partners()[i-1]||"未配对"}"><circle class="svg-base-circle" cx="${x}" cy="${y}" r="${small?6.7:12}"/><text class="svg-base-text" style="font-size:${small?11:14}px" x="${x}" y="${y}">${A.sequence[i-1]}</text></g>`;
  }

  function renderVisual() {
    const svg = $("structure-svg");
    const width = Math.max(svg.clientWidth,260);
    const height = svg.clientHeight || 258;
    svg.setAttribute("viewBox",`0 0 ${width} ${height}`);
    let content = "";
    if (state.visual === "structure") {
      const plot = coords.map(([x,y])=>[width/2+(x-235)*(width>340?1.45:1.1),15+(y-24)*(height-50)/236]);
      content = `<text class="svg-label" x="12" y="18">二维结构示意</text><polyline class="svg-backbone" points="${plot.map(p=>p.join(",")).join(" ")}"/>`;
      content += pairs().map(([i,j]) => {
        const [x,y]=plot[i-1],[xx,yy]=plot[j-1];
        return `<path class="svg-pair${i===8?" extra":""}" data-i="${i}" data-j="${j}" d="M${x},${y} L${xx},${yy}"/>`;
      }).join("");
      content += plot.map(([x,y],i)=>nodeMarkup(i+1,x,y)).join("");
      content += `<text class="svg-position" x="${plot[0][0]-20}" y="${height-12}">5′ / 1</text><text class="svg-position" x="${plot[17][0]-11}" y="${height-12}">18 / 3′</text>`;
      if (state.model==="pseudoknot") content += `<text class="svg-extra-label" x="${Math.min(width-40,plot[14][0]+12)}" y="${plot[6][1]+2}">8–15</text>`;
    } else if (state.visual === "arc") {
      const step=(width-40)/17,baseline=height-52;
      content = `<text class="svg-label" x="12" y="18">配对弧线图</text><path class="svg-backbone" d="M20,${baseline}H${width-20}"/>`;
      content += pairs().map(([i,j]) => {
        const x=20+(i-1)*step,xx=20+(j-1)*step,cy=baseline-(j-i)/17*(height-70)*1.8;
        return `<path class="svg-pair${i===8?" extra":""}" data-i="${i}" data-j="${j}" d="M${x},${baseline} Q${(x+xx)/2},${cy} ${xx},${baseline}"/>`;
      }).join("");
      content += [...A.sequence].map((_,i)=>nodeMarkup(i+1,20+i*step,baseline,true)+(width>360||[1,3,6,9,12,15,18].includes(i+1)?`<text class="svg-position" text-anchor="middle" x="${20+i*step}" y="${baseline+23}">${i+1}</text>`:"")).join("");
      content += `<text class="svg-label" x="20" y="${height-6}">5′</text><text class="svg-label" x="${width-30}" y="${height-6}">3′</text>`;
    } else {
      const n=A.sequence.length,cell=Math.min((width-70)/18,(height-47)/18),left=(width-n*cell)/2+8,top=30,ps=partners();
      content = `<text class="svg-label" x="12" y="13">二值配对矩阵</text>`;
      for(let i=1;i<=n;i++) for(let j=1;j<=n;j++) {
        const value=ps[i-1]===j,extra=value&&((i===8&&j===15)||(i===15&&j===8));
        content += `<rect class="matrix-cell${value?" matrix-paired":""}${extra?" matrix-extra":""}" x="${left+(j-1)*cell}" y="${top+(i-1)*cell}" width="${cell-1.1}" height="${cell-1.1}" rx="1.2" fill="${value?(extra?"#cf8150":"#598c73"):(i===j?"#e0e6dc":"#f0f4ed")}" data-matrix-i="${i}" data-matrix-j="${j}"${value?` data-position="${i}" data-partner="${j}" role="button" tabindex="0" aria-label="配对 ${i}–${j}"`:""}/>`;
      }
      [1,3,6,9,12,15,18].forEach(i=>{
        const mid=left+(i-.5)*cell;
        content+=`<text class="svg-position" x="${mid}" y="24" text-anchor="middle">${i}</text><text class="svg-position" x="${left-10}" y="${top+(i-.35)*cell}" text-anchor="end">${i}</text>`;
      });
      content+=`<text class="svg-label" x="${left+n*cell+10}" y="24">j</text><text class="svg-label" x="${left-29}" y="${top+n*cell/2}">i</text>`;
    }
    svg.innerHTML=content;
    $("pk-legend").hidden=state.model!=="pseudoknot";
    document.querySelectorAll("[data-visual]").forEach(b=>{
      const active=b.dataset.visual===state.visual;b.classList.toggle("selected",active);b.setAttribute("aria-pressed",active);
    });
    renderSelection();
  }

  function renderSelection() {
    const partner=state.position?partners()[state.position-1]:0;
    document.querySelectorAll("#structure-svg [data-position],#example-code [data-position]").forEach(el=>{
      const position=Number(el.dataset.position);
      el.classList.toggle("active",position===state.position);
      el.classList.toggle("partner",position===partner);
    });
    document.querySelectorAll(".svg-pair").forEach(el=>{
      const related=Number(el.dataset.i)===state.position||Number(el.dataset.j)===state.position;
      el.classList.toggle("active",Boolean(state.position&&related));
      el.classList.toggle("dimmed",Boolean(state.position&&!related));
    });
    document.querySelectorAll(".matrix-cell").forEach(el=>{
      const i=Number(el.dataset.matrixI),j=Number(el.dataset.matrixJ);
      el.style.opacity=state.position&&i!==state.position&&j!==state.position?"0.32":"1";
    });
    $("position-detail").innerHTML=state.position
      ? `<strong>位置 ${state.position} · ${A.sequence[state.position-1]}</strong>　${partner?`配对伙伴 ${partner} · ${A.sequence[partner-1]}`:"在当前示例中未配对"}`
      : "";
  }

  function selectPosition(position) {
    if (!Number.isInteger(position)||position<1||position>A.sequence.length) return;
    state.position=position;
    renderSelection();
    const row=$("example-code").querySelector(`.code-line[data-position="${position}"]`);
    if(row) {
      const box=$("example-code");
      if(row.offsetTop<box.offsetTop+box.scrollTop || row.offsetTop+row.offsetHeight>box.offsetTop+box.scrollTop+box.clientHeight) {
        box.scrollTop=row.offsetTop-box.offsetTop-box.clientHeight/2;
      }
    }
  }

  function renderComparison() {
    $("comparison-table").innerHTML=`<thead><tr><th scope="col">表示 / 容器</th>${A.capabilities.map(c=>`<th scope="col">${c.label}</th>`).join("")}</tr></thead><tbody>${A.formats.map(f=>`<tr><td><button type="button" data-format="${f.id}">${esc(f.name)}</button><small>${f.kind}</small></td>${f.caps.map(value=>`<td><span class="cap ${value===1?"yes":value===.5?"partial":"no"}" aria-label="${value===1?"可直接表达":value===.5?"依赖附加注释、实现或推导":"基础表示不提供"}">${value===1?"●":value===.5?"◐":"—"}</span></td>`).join("")}</tr>`).join("")}</tbody>`;
  }
  function renderViewState() {
    $("format-detail").hidden=state.comparison;
    $("comparison-panel").hidden=!state.comparison;
    document.querySelector(".workbench").classList.toggle("is-comparing",state.comparison);
    $("explore-view-btn").classList.toggle("selected",!state.comparison);
    $("compare-view-btn").classList.toggle("selected",state.comparison);
    $("explore-view-btn").setAttribute("aria-pressed",!state.comparison);
    $("compare-view-btn").setAttribute("aria-pressed",state.comparison);
    if(!state.comparison)renderVisual();
  }
  const studyPaths = [
    '<path d="M3 17c3-9 6-9 9 0s6 9 9 0M3 9c3 9 6 9 9 0s6-9 9 0"/>',
    '<path d="M3 18V8a4 4 0 0 1 8 0v10M8 18V6a6 6 0 0 1 12 0v12"/><path d="M3 14h17"/>',
    '<path d="M3 5h18M3 10h15M3 15h18M3 20h13"/><path d="M7 3v19M16 3v19"/>',
    '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h8M6 8v8M8 18h8M18 8v8M8 8l8 8"/>',
    '<path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/>',
    '<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10M12 2v10"/>'
  ];
  function renderStudies() {
    $("study-options").innerHTML=A.studies.map((s,i)=>`<button type="button" class="study-option${state.study===s.id?" selected":""}" data-study="${s.id}" aria-pressed="${state.study===s.id}"><svg viewBox="0 0 24 24" aria-hidden="true">${studyPaths[i]}</svg><span>${s.name}</span></button>`).join("");
    const s=A.studies.find(s=>s.id===state.study);
    $("study-title").textContent=s.label;
    $("study-description").textContent=s.text;
    $("study-recommendations").innerHTML=s.recommend.map(id=>{
      const f=A.formats.find(f=>f.id===id);
      return `<button type="button" data-open-format="${id}">${esc(f.name)}<span>↗</span></button>`;
    }).join("");
    renderFormatList();
  }

  function renderConversion() {
    const from=A.formats.find(f=>f.id===$("conversion-from").value);
    const to=A.formats.find(f=>f.id===$("conversion-to").value);
    const lost=[];
    $("conversion-features").innerHTML=A.capabilities.map((c,i)=>{
      const a=from.caps[i],b=to.caps[i];
      const status=a===0?"absent":b<a?"lost":"retained";
      if(status==="lost")lost.push(c.label);
      return `<div class="conversion-feature ${status}"><strong>${a===0?"—":b<a?"↓":"✓"}</strong><span>${c.label}</span></div>`;
    }).join("");
    let message=lost.length?`可能丢失：${lost.join("、")}。具体保留范围依赖实现。`:"所列信息无明确损失项；仍需核对实现、编号及来源元数据。";
    if(from.id===to.id)message="格式相同仍需核对编号、配对互惠性及元数据。";
    else if(to.id==="dbn"&&from.caps[1]>0)message="普通 DBN 无法保留交叉配对。需先选定保留的配对集合，再生成嵌套结构。";
    else if(from.id==="stockholm"&&to.id!=="stockholm")message="需保留比对列与序列位点的映射；共识注释不等同于各序列的实际配对。";
    else if(from.id==="mmcif"&&to.id!=="mmcif")message="需先识别并筛选相互作用，记录编号映射规则，再导出二级结构。";
    else if(from.id==="matrix"&&to.caps[5]===0)message="由概率矩阵提取确定结构需选择配对；原有概率和竞争伙伴信息将被简化。";
    else if(from.id==="ss"&&to.caps[4]===0)message="配对可保留，二维布局通常丢失；复现结构图需另存坐标与绘图指令。";
    else if(from.id==="wuss"&&to.caps[2]===0)message="环环境注释将被简化；WUSS 中的下划线和连字符不表示序列缺口。";
    $("conversion-message").textContent=message;
  }

  function renderPapers() {
    const row = (p, grouped) => `<article class="paper-card" id="paper-${p.id}" data-year="${p.year}" aria-labelledby="paper-title-${p.id}">
      <div class="paper-visual"><span class="paper-year">${p.year}</span><button type="button" class="paper-figure" data-figure="${p.id}" aria-label="放大 ${esc(p.authors)} ${p.year} 的 ${p.figure.replace("Fig.","图")}"><img src="assets/literature/${p.image}" alt="${esc(p.caption)}" width="600" height="450"><span class="figure-corner">${p.figure.replace("Fig.","图")}</span><span class="figure-expand" aria-hidden="true">⤢</span></button></div>
      <div class="paper-content"><p class="paper-meta">${esc(p.authors)}</p><${grouped?"h4":"h3"} id="paper-title-${p.id}" class="paper-title" lang="en">${esc(p.title)}</${grouped?"h4":"h3"}><p class="paper-journal">${esc(p.journal)}</p><p class="paper-takeaway">${esc(p.takeaway)}</p><div class="paper-bottom"><a href="https://doi.org/${p.doi}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.title)} 的 DOI">DOI ↗</a><span>${p.figure.replace("Fig.","图")} · <a href="${licenseUrl(p.license)}" target="_blank" rel="noopener noreferrer" aria-label="${p.license} 图片许可">${p.license}</a></span></div></div>
    </article>`;
    $("paper-list").innerHTML=[...A.paperGroups].sort((a,b)=>b.date.localeCompare(a.date)).map(group=>{
      const papers=group.papers.map(id=>A.papers.find(p=>p.id===id)).sort((a,b)=>Number(b.year)-Number(a.year));
      return `<section class="paper-group${group.title?" paper-series":""}" data-paper-group="${group.id}" data-date="${group.date}" aria-label="${esc(group.title||papers[0].title)}">${group.title?`<header class="paper-series-heading"><h3>${esc(group.title)}</h3><span>${group.year}</span></header>`:""}${papers.map(p=>row(p,Boolean(group.title))).join("")}</section>`;
    }).join("");
    $("documentation-links").innerHTML=["rnastructure","vienna","stockholm","unafold","mmcif"].map(id=>{
      const s=A.sources[id];return `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`;
    }).join("");
  }
  function licenseUrl(license) {
    return `https://creativecommons.org/licenses/${license.includes("NC")?"by-nc":"by"}/${license.includes("2.0")?"2.0":"4.0"}/`;
  }
  function openFigure(id) {
    const p=A.papers.find(p=>p.id===id);
    if(!p)return;
    $("dialog-title").textContent=`${p.authors} · ${p.year} · ${p.figure}`;
    $("dialog-image").src=`assets/literature/${p.image}`;
    $("dialog-image").alt=p.caption;
    $("dialog-caption").textContent=p.caption;
    $("dialog-credit").innerHTML=`${esc(p.authors)} ${p.year} · ${p.figure} · <a href="${licenseUrl(p.license)}" target="_blank" rel="noopener noreferrer">${p.license}</a>`;
    $("dialog-doi").href=`https://doi.org/${p.doi}`;
    $("figure-dialog").showModal();
  }

  function heroArt() {
    const positions=Array.from({length:18},(_,i)=>24+i*33.5);
    let markup='<line x1="24" y1="184" x2="593.5" y2="184" stroke="#dbe3d6"/>';
    [[1,18],[2,17],[3,16],[6,13],[7,12]].forEach(([i,j],index)=>{
      const x=positions[i-1],xx=positions[j-1],cy=184-(j-i)*14.5;
      markup+=`<path d="M${x},184 Q${(x+xx)/2},${cy} ${xx},184" fill="none" stroke="${index<3?"#8cafa0":"#b1bdaa"}" stroke-width="${index===0?1.5:1.1}"/>`;
    });
    markup+=positions.map((x,i)=>`<circle cx="${x}" cy="184" r="9" fill="#f7f7f2" stroke="#b8cbb8"/><text x="${x}" y="187.5" font-family="Consolas,monospace" font-size="10" text-anchor="middle" fill="#57765e">${A.sequence[i]}</text>${[0,5,11,17].includes(i)?`<text x="${x}" y="211" font-family="Consolas,monospace" font-size="8" text-anchor="middle" fill="#a1ad97">${i+1}</text>`:""}`).join("");
    markup+='<text x="265" y="94" font-family="Consolas,monospace" font-size="9" fill="#8eaa85">1 ↔ 18</text>';
    $("hero-svg").innerHTML=markup;
  }

  document.addEventListener("click",event=>{
    const target=event.target.closest("button,[data-position]");
    if(!target)return;
    if(target.dataset.format)selectFormat(target.dataset.format);
    else if(target.dataset.openFormat) {
      if(target.dataset.openFormat==="extended") {
        state.model="pseudoknot";
        updateModelButtons();
        renderVisual();
      }
      selectFormat(target.dataset.openFormat,true);
    }
    else if(target.dataset.model) {
      state.model=target.dataset.model;state.position=null;
      updateModelButtons();renderCode();renderVisual();
    }
    else if(target.dataset.visual) {state.visual=target.dataset.visual;renderVisual();}
    else if(target.dataset.position)selectPosition(Number(target.dataset.position));
    else if(target.dataset.study) {state.study=target.dataset.study;renderStudies();}
    else if(target.dataset.figure)openFigure(target.dataset.figure);
  });
  document.addEventListener("keydown",event=>{
    const el=event.target.closest("[data-position][role=button]");
    if(el&&(event.key==="Enter"||event.key===" ")) {event.preventDefault();selectPosition(Number(el.dataset.position));}
  });
  function updateModelButtons() {
    document.querySelectorAll("[data-model]").forEach(b=>{
      const active=b.dataset.model===state.model;b.classList.toggle("selected",active);b.setAttribute("aria-pressed",active);
    });
  }
  $("format-search").addEventListener("input",renderFormatList);
  $("explore-view-btn").addEventListener("click",()=>{state.comparison=false;renderViewState();});
  $("compare-view-btn").addEventListener("click",()=>{state.comparison=true;renderViewState();});
  $("copy-example").addEventListener("click",async()=>{
    let copied=false;
    try{await navigator.clipboard.writeText(currentPlainText);copied=true;}catch(_) {
      const area=document.createElement("textarea");
      area.value=currentPlainText;area.style.position="fixed";area.style.left="-9999px";document.body.append(area);area.select();
      try{copied=document.execCommand("copy");}catch(_){}
      area.remove();
    }
    $("copy-status").textContent=copied?"示例已复制":"无法自动复制，请直接选择示例文本。";
    $("copy-status").classList.add("visible");
    setTimeout(()=>$("copy-status").classList.remove("visible"),2200);
  });
  $("close-dialog").addEventListener("click",()=>$("figure-dialog").close());
  $("figure-dialog").addEventListener("click",event=>{
    if(event.target===$("figure-dialog")) {
      const r=$("figure-dialog").getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$("figure-dialog").close();
    }
  });
  ["conversion-from","conversion-to"].forEach(id=>{
    $(id).innerHTML=A.formats.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join("");
    $(id).addEventListener("change",renderConversion);
  });
  $("conversion-from").value="extended";$("conversion-to").value="dbn";
  heroArt();renderStudies();renderFormat();renderVisual();renderComparison();renderViewState();renderConversion();renderPapers();
  let lastVisualWidth = $("structure-svg").clientWidth;
  new ResizeObserver(() => {
    const currentWidth = $("structure-svg").clientWidth;
    if(currentWidth > 0 && Math.abs(currentWidth-lastVisualWidth) > 1) {
      lastVisualWidth = currentWidth;
      renderVisual();
    }
  }).observe($("structure-svg"));
  window.__RNA_ATLAS__={getState:()=>({...state}),getPairs:()=>pairs().map(p=>[...p]),getSequence:()=>A.sequence,getExample:()=>currentPlainText};
})();
