/* Interactive learning labs for Robot Learning Portal. Static-site only. */
'use strict';
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const fmt=(x,n=3)=>Number.isFinite(x)?x.toFixed(n):'—';
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const number=(el,fallback)=>{const n=Number(el&&el.value);return Number.isFinite(n)?n:fallback};

  function setupPPO(){
    const root=$('[data-ppo-lab]');if(!root)return;
    const ratio=$('[data-ppo-ratio]',root),eps=$('[data-ppo-eps]',root),adv=$('[data-ppo-adv]',root),chart=$('[data-ppo-chart]',root);
    const path=(arr)=>arr.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
    function update(){
      const r=number(ratio,1.2),e=number(eps,.2),a=number(adv,1),lo=1-e,hi=1+e,raw=r*a,clip=clamp(r,lo,hi)*a,obj=Math.min(raw,clip);
      $('[data-ppo-ratio-out]',root).textContent=fmt(r,2);$('[data-ppo-eps-out]',root).textContent=fmt(e,2);$('[data-ppo-adv-out]',root).textContent=(a>0?'+':'')+fmt(a,1);
      $('[data-ppo-raw]',root).textContent=fmt(raw,3);$('[data-ppo-clip]',root).textContent=fmt(clip,3);$('[data-ppo-objective]',root).textContent=fmt(obj,3);
      const status=$('[data-ppo-status]',root);status.textContent=(Math.abs(r-clamp(r,lo,hi))<1e-7?'区间内':'发生裁剪');
      const W=500,H=230,L=42,R=15,T=12,B=32, xmin=.5,xmax=1.8,ymin=-2.2,ymax=2.2;
      const X=x=>L+(x-xmin)/(xmax-xmin)*(W-L-R),Y=y=>T+(ymax-y)/(ymax-ymin)*(H-T-B);
      const pointsRaw=[],pointsObj=[];for(let x=xmin;x<=xmax+1e-6;x+=.02){pointsRaw.push([X(x),Y(clamp(x*a,ymin,ymax))]);pointsObj.push([X(x),Y(clamp(Math.min(x*a,clamp(x,lo,hi)*a),ymin,ymax))]);}
      const ticks=[-2,-1,0,1,2];let grid='';ticks.forEach(t=>{grid+=`<line x1="${L}" y1="${Y(t)}" x2="${W-R}" y2="${Y(t)}" stroke="currentColor" opacity=".12"/><text x="${L-7}" y="${Y(t)+4}" font-size="10" fill="currentColor" text-anchor="end">${t}</text>`});
      [0.5,1.0,1.5].forEach(t=>{grid+=`<line x1="${X(t)}" y1="${T}" x2="${X(t)}" y2="${H-B}" stroke="currentColor" opacity=".12"/><text x="${X(t)}" y="${H-10}" font-size="10" fill="currentColor" text-anchor="middle">${t.toFixed(1)}</text>`});
      const marker=`<line x1="${X(r)}" y1="${T}" x2="${X(r)}" y2="${H-B}" stroke="#d18a2b" stroke-width="2" stroke-dasharray="5 4"/><circle cx="${X(r)}" cy="${Y(clamp(obj,ymin,ymax))}" r="4.5" fill="#d18a2b" stroke="currentColor" stroke-width="1"/>`;
      chart.innerHTML=`<title>原始代理目标与 PPO 裁剪代理目标曲线</title>${grid}<path d="${path(pointsRaw)}" fill="none" stroke="#8492a2" stroke-width="2.5"/><path d="${path(pointsObj)}" fill="none" stroke="#2e7d7b" stroke-width="3"/>${marker}<text x="${(L+W-R)/2}" y="${H-1}" font-size="10" fill="currentColor" text-anchor="middle">概率比率 r</text>`;
    }
    [ratio,eps,adv].forEach(el=>el.addEventListener('input',update));update();
  }
  function setupAttention(){
    const root=$('[data-attention-lab]');if(!root)return;
    const scores=$$('[data-attn-score]',root),dk=$('[data-attn-dk]',root);
    function update(){const raw=scores.map((el)=>number(el,0));raw.forEach((v,i)=>$(`[data-attn-score-out="${i}"]`,root).textContent=fmt(v,1));const d=number(dk,4),scaled=raw.map(v=>v/Math.sqrt(d));const max=Math.max(...scaled),exps=scaled.map(x=>Math.exp(x-max)),sum=exps.reduce((a,b)=>a+b,0),weights=exps.map(x=>x/sum),values=[1,3,-1],out=weights.reduce((acc,w,i)=>acc+w*values[i],0);weights.forEach((w,i)=>{$(`[data-attn-bar="${i}"]`,root).style.width=(w*100)+'%';$(`[data-attn-weight="${i}"]`,root).textContent=fmt(w,3)});$('[data-attn-sum]',root).textContent=fmt(weights.reduce((a,b)=>a+b,0),3);$('[data-attn-output]',root).textContent=fmt(out,3);}
    [...scores,dk].forEach(el=>el.addEventListener('input',update));update();
  }
  function setupNumericAttention(){
    const root=$('[data-numeric-attention]');if(!root)return;
    const selector=$('[data-numeric-query]',root);
    // Each inner array is [token 1, token 2], with 3 features per token and per head.
    const queries=[
      [[1,0,0],[0,1,0]],
      [[1,0,0],[0,1,0]]
    ];
    const keys=[
      [[1,0,0],[0,1,0]],
      [[0,1,0],[1,0,0]]
    ];
    const values=[
      [[2,1,3],[0,4,6]],
      [[10,2,1],[0,6,5]]
    ];
    function update(){
      const qi=Number(selector&&selector.value)===1?1:0;
      const headOutputs=[];
      for(let head=0;head<2;head++){
        const q=queries[head][qi];
        const raw=keys[head].map(k=>q.reduce((sum,v,i)=>sum+v*k[i],0));
        const scaled=raw.map(v=>v/Math.sqrt(3));
        const max=Math.max(...scaled),exps=scaled.map(v=>Math.exp(v-max)),sum=exps.reduce((a,b)=>a+b,0),weights=exps.map(v=>v/sum);
        const output=values[head][0].map((_,dim)=>weights.reduce((acc,w,i)=>acc+w*values[head][i][dim],0));
        headOutputs.push(output);
        const rawEl=$(`[data-numeric-raw="${head}"]`,root),scaledEl=$(`[data-numeric-scaled="${head}"]`,root),weightsEl=$(`[data-numeric-weights="${head}"]`,root),calcEl=$(`[data-numeric-calc="${head}"]`,root);
        if(rawEl)rawEl.textContent='['+raw.map(v=>fmt(v,3)).join(', ')+']';
        if(scaledEl)scaledEl.textContent='['+scaled.map(v=>fmt(v,3)).join(', ')+']';
        if(weightsEl)weightsEl.textContent='['+weights.map(v=>fmt(v,3)).join(', ')+']';
        if(calcEl){
          const v1='['+values[head][0].map(v=>fmt(v,0)).join(', ')+']',v2='['+values[head][1].map(v=>fmt(v,0)).join(', ')+']',out='['+output.map(v=>fmt(v,3)).join(', ')+']';
          calcEl.textContent=`${fmt(weights[0],3)} × ${v1} + ${fmt(weights[1],3)} × ${v2}\n= ${out}`;
        }
      }
      const concat=headOutputs.flat();
      const concatEl=$('[data-numeric-concat]',root),summary=$('[data-numeric-query-summary]',root),final=$('[data-numeric-final-explain]',root);
      if(concatEl)concatEl.textContent='['+headOutputs.map(v=>v.map(x=>fmt(x,3)).join(', ')).join(' | ')+']';
      if(summary)summary.textContent=`当前查看 Token ${qi+1}：先分别计算头 1 和头 2 对这个 Query 的权重，再各自汇总 Value。`;
      if(final)final.textContent=`Token ${qi+1} 的两个头各输出 3 个数，拼接后为 [${concat.map(v=>fmt(v,3)).join(', ')}]（本例暂设 W_O=I）；把 Token 1、Token 2 的结果叠起来，整个输出形状是 [1, 2, 6]。`;
    }
    if(selector)selector.addEventListener('change',update);
    update();
  }
  function setupShapes(){
    $$('[data-shape-lab]').forEach(root=>{
      const b=$('[data-shape-b]',root),l=$('[data-shape-l]',root),d=$('[data-shape-d]',root),h=$('[data-shape-h]',root);
      if(!b||!l||!d||!h)return;
      const steps=[
        {title:'第 1 步：输入 X',shape:(B,L,D,H,dh)=>`[${B}, ${L}, ${D}]`,explain:(B,L,D,H,dh)=>`X 的形状是 [B, L, D]。B=${B} 表示有 ${B} 组样本；L=${L} 表示每组有 ${L} 个 Token；D=${D} 表示每个 Token 用 ${D} 个数字表示。`,analogy:(B,L,D)=>`可以把它想成 ${B} 份表格，每份 ${L} 行，每行 ${D} 个特征数。`},
        {title:'第 2 步：生成 Q、K、V',shape:(B,L,D,H,dh)=>`[${B}, ${L}, ${D}]`,explain:(B,L,D,H,dh)=>`线性层把每个 Token 的特征分别投影成 Q、K、V。常见配置让三者的形状仍是 [${B}, ${L}, ${D}]；数值变了，但批次数、Token 数和特征宽度没变。`,analogy:()=>`同一张表经过三种不同的“特征转换器”，表格的行数和列数不变，但每个格子的数值会变化。`},
        {title:'第 3 步：把特征拆成多个头',shape:(B,L,D,H,dh)=>`[${B}, ${H}, ${L}, ${dh}]`,explain:(B,L,D,H,dh)=>`把每个 Token 的 ${D} 个特征分成 ${H} 份，每份 ${dh} 个特征（${H} × ${dh} = ${D}）。再把“头数”移到前面，方便每个头独立计算。`,analogy:(B,L,D,H,dh)=>`原来每行有 ${D} 个数；现在把它分成 ${H} 组、每组 ${dh} 个数。样本数 ${B} 和 Token 数 ${L} 没变。`},
        {title:'第 4 步：计算 QKᵀ 匹配分数',shape:(B,L,D,H,dh)=>`[${B}, ${H}, ${L}, ${L}]`,explain:(B,L,D,H,dh)=>`每个头里，每个 Query 都要和全部 ${L} 个 Key 比较。于是每组样本、每个头都会得到一个 ${L} × ${L} 的分数表。矩阵乘法的形状是 [${B}, ${H}, ${L}, ${dh}] × [${B}, ${H}, ${dh}, ${L}] → [${B}, ${H}, ${L}, ${L}]。`,analogy:(B,L,D,H,dh)=>`把每个头想成一张“谁和谁有多相关”的表：${L} 个 Query 行 × ${L} 个 Key 列。这里最后两个数字都等于 Token 数。`},
        {title:'第 5 步：Softmax 把分数变成权重',shape:(B,L,D,H,dh)=>`[${B}, ${H}, ${L}, ${L}]`,explain:(B,L,D,H,dh)=>`Softmax 不会改变表格的行数和列数，所以形状不变。它把每一行的分数转换成非负权重；通常每一行加起来等于 1，表示一个 Query 如何分配注意力。`,analogy:()=>`只是把“相关分数表”换成“权重表”，格子的数量没有变化。`},
        {title:'第 6 步：按权重汇总 V',shape:(B,L,D,H,dh)=>`[${B}, ${H}, ${L}, ${dh}]`,explain:(B,L,D,H,dh)=>`权重表 [${B}, ${H}, ${L}, ${L}] 与 V [${B}, ${H}, ${L}, ${dh}] 相乘，汇总每个 Query 要从各个 Value 位置取多少信息。输出形状为 [${B}, ${H}, ${L}, ${dh}]。`,analogy:()=>`每个 Query 从 ${L} 个位置收集信息，但最后仍会得到每个头自己的 ${dh} 维表示。`},
        {title:'第 7 步：把多个头拼回去',shape:(B,L,D,H,dh)=>`[${B}, ${L}, ${D}]`,explain:(B,L,D,H,dh)=>`先把形状 [${B}, ${H}, ${L}, ${dh}] 调整为 [${B}, ${L}, ${H}, ${dh}]，再把头数和每头维度合并：${H} × ${dh} = ${D}。因此回到 [${B}, ${L}, ${D}]。`,analogy:(B,L,D,H,dh)=>`把每行分开的 ${H} 组特征重新接在一起，每个 Token 又有 ${D} 个数。`},
        {title:'第 8 步：输出投影',shape:(B,L,D,H,dh)=>`[${B}, ${L}, ${D}]`,explain:(B,L,D,H,dh)=>`拼接后通常再通过一个可学习的输出线性层。常见设置下，输出形状仍是 [${B}, ${L}, ${D}]，但特征会再次混合。`,analogy:()=>`最后再做一次特征转换，方便后续网络继续使用；外形通常不变。`}
      ];
      let active=0;
      const prev=$('[data-shape-prev]',root),next=$('[data-shape-next]',root),reset=$('[data-shape-reset]',root),pipeline=$('[data-shape-pipeline]',root);
      function update(){
        const B=clamp(Math.round(number(b,2)),1,4),L=clamp(Math.round(number(l,3)),1,6),D=number(d,8);
        b.value=B;l.value=L;
        const hOptions=[...h.options];hOptions.forEach(option=>{option.disabled=(D%Number(option.value)!==0)});
        if(D%number(h,2)!==0){const valid=hOptions.filter(o=>D%Number(o.value)===0).map(o=>Number(o.value));h.value=String(valid.reduce((best,v)=>Math.abs(v-number(h,2))<Math.abs(best-number(h,2))?v:best,valid[0]));}
        const H=number(h,2),dh=D/H;
        const vals=[B,L,D,H,dh];
        $('[data-shape-beginner-status]',root).textContent=`当前例子：${B} 组样本，每组 ${L} 个 Token，每个 Token ${D} 个特征，分成 ${H} 个头；每头 ${D} ÷ ${H} = ${dh} 个特征。`;
        steps.forEach((step,i)=>{const el=$(`[data-shape-pipe-shape="${i}"]`,root);if(el)el.textContent=step.shape(...vals);});
        const step=steps[active];
        $('[data-shape-step-count]',root).textContent=`第 ${active+1} / ${steps.length} 步`;
        $('[data-shape-step-title]',root).textContent=step.title;
        $('[data-shape-current]',root).textContent=step.shape(...vals);
        $('[data-shape-step-explain]',root).textContent=step.explain(...vals);
        $('[data-shape-step-analogy]',root).textContent=step.analogy(...vals);
        if(prev)prev.disabled=active===0;if(next)next.disabled=active===steps.length-1;
        $$('[data-shape-step]',root).forEach(btn=>{const selected=Number(btn.dataset.shapeStep)===active;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',selected?'true':'false');});
        const status=$('[data-shape-status]',root);if(status){status.textContent=active===2?`这一步没有删掉特征：每个 Token 的 ${D} 个特征被重新组织成 ${H} 头 × ${dh} 个特征。`:active===3?`记住乘法规则：[..., ${L}, ${dh}] × [..., ${dh}, ${L}] → [..., ${L}, ${L}]。中间的 ${dh} 对齐并被消去，留下 Query 数和 Key 数。`:active===6?`拼接头时把 ${H} 个头的 ${dh} 维特征接在一起，所以 ${H} × ${dh} = ${D}，形状回到 [${B}, ${L}, ${D}]。`:`目前看到的是第 ${active+1} 步。点击“下一步”，观察形状为什么会变或保持不变。`;}
      }
      if(prev)prev.addEventListener('click',()=>{active=Math.max(0,active-1);update();});
      if(next)next.addEventListener('click',()=>{active=Math.min(steps.length-1,active+1);update();});
      if(reset)reset.addEventListener('click',()=>{active=0;update();});
      $$('[data-shape-step]',root).forEach(btn=>btn.addEventListener('click',()=>{active=clamp(Number(btn.dataset.shapeStep),0,steps.length-1);update();}));
      [b,l,d,h].forEach(el=>el.addEventListener('change',update));update();
    });
  }
  function setupGAE(){
    const root=$('[data-gae-lab]');if(!root)return;const gamma=$('[data-gae-gamma]',root),lambda=$('[data-gae-lambda]',root),terminal=$('[data-gae-terminal]',root);const rewards=[1,0,2],values=[.4,.5,.2,.3];
    function update(){const g=number(gamma,.99),lam=number(lambda,.95),term=!!terminal.checked; $('[data-gae-gamma-out]',root).textContent=fmt(g,3);$('[data-gae-lambda-out]',root).textContent=fmt(lam,2);const deltas=[];for(let t=0;t<3;t++){const done=term&&t===2;const vnext=done?0:values[t+1];deltas[t]=rewards[t]+g*vnext-values[t];$(`[data-gae-delta="${t}"]`,root).textContent=fmt(deltas[t],3);}
      const adv=[0,0,0];let next=0;for(let t=2;t>=0;t--){const boundary=term&&t===2;adv[t]=deltas[t]+(boundary?0:g*lam*next);next=adv[t];$(`[data-gae-adv="${t}"]`,root).textContent=fmt(adv[t],3);}
      $('[data-gae-a0]',root).textContent=fmt(adv[0],3);$('[data-gae-coef]',root).textContent=fmt(g*lam,3);$('[data-gae-explain]',root).textContent=`当前 Â₀ = δ₀ + γλδ₁ + (γλ)²δ₂（在没有中间边界的这段示例轨迹上）。当前 γλ = ${fmt(g*lam,3)}；${term?'最后一步按真正 terminal 处理，不从终止后的状态 bootstrap。':'最后一步按非 terminal 处理，因此示例使用 V₃ 进行 bootstrap。'}`;
    }
    [gamma,lambda,terminal].forEach(el=>el.addEventListener('input',update));update();
  }
  function setupReturn(){const root=$('[data-return-lab]');if(!root)return;const rewards=$$('[data-ret-reward]',root),gamma=$('[data-ret-gamma]',root);function update(){const r=rewards.map((el,i)=>{const v=number(el,[1,2,3][i]);$(`[data-ret-out="${i}"]`,root).textContent=fmt(v,1);return v});const g=number(gamma,.9);$('[data-ret-gamma-out]',root).textContent=fmt(g,2);const terms=r.map((v,i)=>v*Math.pow(g,i));terms.forEach((v,i)=>$(`[data-ret-term="${i}"]`,root).textContent=fmt(v,3));$('[data-ret-total]',root).textContent=fmt(terms.reduce((a,b)=>a+b,0),3);$('[data-ret-explain]',root).textContent=`G₀ = ${fmt(r[0],1)} + (${fmt(g,2)})×${fmt(r[1],1)} + (${fmt(g,2)})²×${fmt(r[2],1)} = ${fmt(terms.reduce((a,b)=>a+b,0),3)}`;}[...rewards,gamma].forEach(el=>el.addEventListener('input',update));update();}
  function setupQuizzes(){
    $$('[data-quiz-check]').forEach(button=>button.addEventListener('click',()=>{const box=button.closest('[data-quiz]');if(!box)return;const chosen=$('input[type="radio"]:checked',box),feedback=$('[data-feedback]',box),score=$('[data-quiz-score]',box),correct=button.dataset.correct;if(!chosen){feedback.hidden=false;feedback.className='quiz-feedback bad';feedback.textContent='请先选择一个答案，再检查。';score.textContent='';return;}const ok=chosen.value===correct;feedback.hidden=false;feedback.className='quiz-feedback '+(ok?'good':'bad');feedback.textContent=(ok?'回答正确。':'还不正确。')+button.dataset.explanation;score.textContent=ok?'本题：1 / 1':'本题：0 / 1';box.dataset.answered=ok?'correct':'incorrect';button.textContent='重新检查';}));
    $$('[data-quiz]').forEach(box=>{const inputs=$$('input[type="radio"]',box);inputs.forEach(input=>input.addEventListener('change',()=>{const fb=$('[data-feedback]',box);if(fb&&fb.hidden===false){fb.hidden=true;fb.className='quiz-feedback';}const score=$('[data-quiz-score]',box);if(score)score.textContent='';}));});
  }
  function setupReturnLinks(){
    // Mark the current section in the sidebar as the learner scrolls, without a framework.
    const links=$$('nav a[href^="#"]');if(!('IntersectionObserver'in window)||!links.length)return;const targets=links.map(a=>$(a.getAttribute('href'))).filter(Boolean);if(!targets.length)return;const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;links.forEach(a=>{if(a.getAttribute('href')==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})})},{rootMargin:'-15% 0px -70% 0px'});targets.forEach(t=>observer.observe(t));
  }
  setupPPO();setupAttention();setupShapes();setupNumericAttention();setupGAE();setupReturn();setupQuizzes();setupReturnLinks();
})();
