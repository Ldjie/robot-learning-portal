机器人强化学习工作台（重构版）
================================

入口
----
index.html

这次重构的重点
--------------
- 首页改成研究工作台布局：学习入口、独立专题库、项目约定和实验记录。
- 搜索覆盖工作台模块和专题索引，支持 / 聚焦、Esc 清空、Enter 打开首条结果。
- 统一专题页视觉样式，增加课程目录、返回入口、响应式布局和系统深色模式。
- 学习进度使用统一的 localStorage 命名空间，独立专题可被工作台备份。
- 导入备份前校验 JSON 结构、版本、字段类型、大小与实验数量；校验后才写入，并在写入失败时尝试回滚。
- 导出包含学习进度、笔记和实验记录，并延迟释放下载 URL。
- 新增可编辑实验记录表单；实验记录保存到当前浏览器，并可在工作台导出。
- PPO 内容补充了 clip 不是参数更新硬约束的说明；项目网络页把示意 shape 明确标为模板，避免误认为已核实的 AME 实现。
- 新增静态交互教学：PPO 裁剪目标曲线、Attention Softmax 权重与输出、注意力张量形状计算、GAE 递推计算、MDP 折扣回报计算，以及各专题即时反馈自测。
- 交互内容在浏览器本地运行，无需后端或第三方 JavaScript 依赖；互动演示中的数值为教学示例，不代表 AME 的实际运行配置。

目录结构
--------
- index.html                  工作台入口
- assets/portal.css           独立专题的统一视觉样式
- assets/portal.js            独立专题的进度保存与通用交互
- assets/interactive.js       PPO、GAE、Attention、Transformer、MDP 的交互式实验与自测
- modules/ppo.html            PPO 深入专题
- modules/attention.html      注意力机制课程
- modules/transformer.html    Transformer 基础
- modules/mdp.html            MDP 与强化学习基础
- modules/gae.html            GAE 优势估计
- g1-ame/overview.html        项目源码阅读地图
- g1-ame/network.html         网络与张量流记录模板
- g1-ame/experiments.html     实验设计和可复现性专题

本地预览
--------
推荐在项目根目录运行静态 HTTP 服务后打开：
  python -m http.server 8000
然后访问 http://localhost:8000/robot-learning-portal/ （如果服务从该目录的上一级启动）

也可以直接打开 index.html；部分浏览器对 file:// 下的 localStorage 或安全 API 有额外限制。

部署到 GitHub Pages
-------------------
保持 index.html、assets/、modules/、g1-ame/ 的相对目录结构，将整个 robot-learning-portal 目录中的内容部署到站点根目录。不要只上传 index.html，否则样式和专题链接会失效。

本地数据和备份
--------------
- 学习进度、笔记和实验记录保存在当前浏览器的 localStorage，不会自动云同步。
- 在清理站点数据、更换浏览器或设备前，请通过“导出备份”保存 JSON。
- 导入时会校验格式；确认后覆盖备份中包含的对应字段。较旧的 version 1 备份仍可导入。
- 若浏览器禁止 localStorage 或存储空间不足，数据可能无法持久化。

内容准确性约定
--------------
通用理论、项目源码事实、实验观察、待验证假设应分开标注。网络结构、实际张量维度、训练参数和实验结论，应以具体仓库版本、配置与运行证据为准。

交互学习补充
- 注意力专题的“交互实验 B：多头注意力张量形状”已改为入门版：先解释 B/L/D/h，再通过 8 步查看张量形状变化。
- 默认使用小数字示例 B=2、L=3、D=8、h=2，避免一开始看到 [32, 4, 20, 32] 这类较难直觉理解的形状。
- 页面交互均在浏览器本地运行，不需要后端；参数为教学示例，不代表 AME_Locomotion 实际网络配置。
