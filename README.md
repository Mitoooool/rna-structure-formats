# RNA 结构表示与文件格式

面向 RNA 研究初学者的交互式参考网站。

**网站：https://mitoooool.github.io/rna-structure-formats/**

涵盖 DBN、扩展 DBN、BPSEQ、CT、配对矩阵、WUSS、Stockholm、bpRNA 注释、
结构树与抽象形状、SS 二维坐标、RNAML 和 PDBx/mmCIF。

## 使用

直接打开 `index.html`，或将仓库根目录交由任意静态 HTTP 服务器托管。
页面、交互和文献缩略图均可离线运行；主动访问 DOI 或格式文档时需要网络。
GitHub Pages 从 `main` 分支根目录发布。

## 示例

页面共用一个 18 nt 构造序列，可查看嵌套结构及新增 8–15 交叉配对的结构。
该序列并非预测或实验验证模型。
DBN、WUSS、BPSEQ、CT 等示例的配对已逐位解码核对。
SS、RNAML、mmCIF、结构树及 bpRNA 数组中的简化范围在页面中标明。
来源表示与目标表示模块比较信息表达能力，不执行文件转换。

## 文献图与来源

文献按年份由新到旧纵向排列，bpRNA、bpRNA-align 和 bpRNA-CosMoS 合为一个系列框。
共五个文献框、七篇论文，每篇配一张真实文内图，提供放大视图、DOI 和图片许可。
不提供论文全文、PDF、论文附件或全文下载按钮。
图片仅经等比例缩小及 WebP 编码，未更改图内内容。
各图作者、图号、许可、来源和校验值见 `research/source_manifest.json`。
第三方文献图分别适用其标明的 CC BY 或 CC BY-NC 许可；
本仓库不对这些图片赋予额外许可。
