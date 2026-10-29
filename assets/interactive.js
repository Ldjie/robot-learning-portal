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
  function setupShapes(){
    $$('[data-shape-lab]').forEach(root=>{
      const b=$('[data-shape-b]',root),l=$('[data-shape-l]',root),d=$('[data-shape-d]',root),h=$('[data-shape-h]',root);if(!b||!l||!d||!h)return;
      function update(){const B=clamp(Math.round(number(b,32)),1,512),L=clamp(Math.round(number(l,20)),1,512),D=number(d,128),H=number(h,4);b.value=B;l.value=L;const valid=D%H===0,head=valid?D/H:null;
        $('[data-shape-x]',root).textContent=`[${B}, ${L}, ${D}]`;
        $('[data-shape-qkv]',root).textContent=valid?`[${B}, ${H}, ${L}, ${head}]`:'不可计算：D ÷ h 非整数';
        $('[data-shape-score]',root).textContent=`[${B}, ${H}, ${L}, ${L}]`;
        $('[data-shape-merge]',root).textContent=`[${B}, ${L}, ${D}]`;
        const status=$('[data-shape-status]',root);if(status){status.textContent=valid?`每头维度 dₖ = ${head}。注意力分数矩阵对每个头、每个 Query 位置计算所有 Key 的匹配。输出投影通常将合并结果映射回 D = ${D}。`:`当前 D = ${D} 不能被 h = ${H} 整除。请调整模型维度或头数，或采用显式设置每头维度的其他实现。`;status.classList.toggle('warning',!valid);}
        const order=$('[data-transformer-order]',root),flow=$('[data-transformer-flow]',root);if(flow&&order)flow.textContent=order.value==='pre'?'Pre-LN：X → LN → Attention → 残差相加 → LN → FFN → 残差相加。不同实现的细节应以代码为准。':'Post-LN：X → Attention → 残差相加 → LN → FFN → 残差相加 → LN。具体层序应以真实模型实现为准。';
      }
      [b,l,d,h,$('[data-transformer-order]',root)].filter(Boolean).forEach(el=>el.addEventListener('input',update));update();
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
  setupPPO();setupAttention();setupShapes();setupGAE();setupReturn();setupQuizzes();setupReturnLinks();
})();
