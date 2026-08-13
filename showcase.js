(() => {
  'use strict';

  const steps = [
    {
      owner: '主责：平台路由器',
      cost: '模型调用：0',
      kicker: '收到的原始任务',
      title: '清理无来源笔记，但不能误删有价值内容',
      description: '系统先判断：它包含批量文件影响、语义判断和不可逆风险，因此不能被当成“简单删除”。',
      evidence: '任务指纹 + 风险等级 + 人工审批门'
    },
    {
      owner: '主责：本地确定性工具',
      cost: '模型调用：0',
      kicker: '先做不需要 AI 的工作',
      title: '扫描文件、链接、重复项和来源字段',
      description: '机器只计算可确定的事实：文件数量、重复名称、未解析链接、候选条件。它不在这一阶段替用户判断“有没有价值”。',
      evidence: '只读盘点报告 + 精确候选清单 + 写前哈希'
    },
    {
      owner: '主责：Codex',
      cost: '模型调用：按需',
      kicker: '带着边界执行',
      title: '只处理已批准范围，保留原文和已有半成品',
      description: '主责根据候选逐项处理；遇到命名、归属或来源不确定时停止扩散，并把决策点显式列出来。',
      evidence: '精确差异 + 变更文件清单 + 可回退点'
    },
    {
      owner: '复核：Claude / 独立校验',
      cost: '只在争议节点发生',
      kicker: '门下省封驳',
      title: '找错，不重复主责已经做过的工作',
      description: '复核重点检查误删风险、范围漂移、来源声明和反例；如果证据不足，就退回主责补充，而不是为了“多 AI”重复生成一份答案。',
      evidence: '风险清单 + 放行/封驳理由 + 剩余不确定项'
    },
    {
      owner: '验收：程序 + 用户',
      cost: '结论可追溯',
      kicker: '证据门',
      title: '测试通过，仍由用户决定是否执行不可逆动作',
      description: '自动检查链接、文件数、正文漂移和测试结果；删除、公开发布或改变长期规则等高影响动作，最后仍交回用户确认。',
      evidence: '验证结果 + 独立变更报告 + 人工最终决定'
    }
  ];

  const buttons = Array.from(document.querySelectorAll('.demo-step'));
  const panel = {
    owner: document.querySelector('#demo-owner'),
    cost: document.querySelector('#demo-cost'),
    kicker: document.querySelector('#demo-kicker'),
    title: document.querySelector('#demo-title'),
    description: document.querySelector('#demo-description'),
    evidence: document.querySelector('#demo-evidence'),
    counter: document.querySelector('#demo-counter'),
    next: document.querySelector('#demo-next')
  };

  if (!buttons.length || !Object.values(panel).every(Boolean)) return;

  let current = 0;

  function render(index) {
    current = index;
    const step = steps[index];
    panel.owner.textContent = step.owner;
    panel.cost.textContent = step.cost;
    panel.kicker.textContent = step.kicker;
    panel.title.textContent = step.title;
    panel.description.textContent = step.description;
    panel.evidence.textContent = step.evidence;
    panel.counter.textContent = `步骤 ${index + 1} / ${steps.length}`;
    panel.next.firstChild.textContent = index === steps.length - 1 ? '重新播放 ' : '下一步 ';
    buttons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'step' : 'false');
    });
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => render(index));
  });

  panel.next.addEventListener('click', () => {
    render((current + 1) % steps.length);
  });

  render(0);
})();


