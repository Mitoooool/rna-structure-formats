window.ATLAS = {
  sequence: "GGGAAAGGAUUCUACCCC",
  pairs: [[1,18],[2,17],[3,16],[6,13],[7,12]],
  extraPair: [8,15],
  groups: [
    {id:"pair",name:"配对与拓扑"},
    {id:"compare",name:"比较与注释"},
    {id:"space",name:"坐标与交换"}
  ],
  capabilities: [
    {id:"partners",label:"配对伙伴"},
    {id:"pk",label:"交叉配对"},
    {id:"loops",label:"环环境"},
    {id:"alignment",label:"比对信息"},
    {id:"coordinates",label:"空间坐标"},
    {id:"probability",label:"配对概率"}
  ],
  formats: [
    {
      id:"dbn",name:"DBN",full:"Dot-Bracket Notation",cn:"普通括号点记法",group:"pair",extension:".dbn · .dot",
      what:"每个字符对应一个序列位置；点表示未配对，匹配的圆括号表示碱基配对。",
      why:"表示紧凑，便于核对序列与结构，是二级结构预测软件的常见输入输出。",
      suited:["二级结构预测","结构结果展示","单序列结构核对"],
      caution:"普通 (). 不能完整编码交叉配对；点表示这套模型未指定配对，不等于该碱基没有其他相互作用。",
      keeps:"序列位置、嵌套配对",loses:"交叉配对、环类型、空间坐标",
      exampleLabel:"DBN",source:"rnastructure",
      caps:[1,0,0,0,0,0],study:["prediction","teaching"],kind:"记法"
    },
    {
      id:"extended",name:"扩展 DBN",full:"Extended Dot-Bracket Notation",cn:"多套括号与字母",group:"pair",extension:".dbn · .dot",
      what:"在圆括号之外使用 []、{}、<> 或成对的大小写字母；每套符号分别匹配。",
      why:"通过不同符号层编码交叉配对，可在单行文本中表示含伪结的结构。",
      suited:["伪结分析","含交叉配对的结构存档","配对转换核验"],
      caution:"同一配对集合可有不同的分层编码；结构比较应依据解码后的配对集合。各软件接受的符号集合不同。",
      keeps:"逐位配对、交叉拓扑",loses:"配对几何类型、空间坐标",
      exampleLabel:"扩展 DBN",source:"vienna",paper:"antczak",
      caps:[1,1,0,0,0,0],study:["pseudoknot","teaching"],kind:"记法"
    },
    {
      id:"bpseq",name:"BPSEQ",full:"Base-pair sequence format",cn:"三列伙伴表",group:"pair",extension:".bpseq · .bpseq.txt",
      what:"每行记录一个碱基的编号、字符和配对伙伴编号；第三列的 0 表示该记录未指定伙伴。",
      why:"直接记录配对伙伴，无需括号分层，便于逐位核验和格式转换。",
      suited:["参考结构整理","配对逐位审计","数据集格式转换"],
      caution:"每个位点最多记录一个伙伴。需核验编号连续性、范围及配对互惠性：i→j 必须与 j→i 对应。",
      keeps:"碱基、编号、明确的伙伴关系",loses:"绘图布局、详细相互作用类型",
      exampleLabel:"BPSEQ",source:"tarnas",paper:"tarnas",
      caps:[1,1,0,0,0,0],study:["pseudoknot","methods","comparative"],kind:"配对表"
    },
    {
      id:"ct",name:"CT",full:"Connectivity Table",cn:"连接表",group:"pair",extension:".ct",
      what:"常见 CT 有标题和六列记录：位置、碱基、前一位、后一位、配对伙伴、原始编号。",
      why:"同时记录骨架连接与碱基配对，适合存储和交换一套或多套候选结构。",
      suited:["折叠程序间交换","多候选结构存储","连接关系核验"],
      caution:"记录较 BPSEQ 冗长；编号与多链连接的处理依工具而异。标题中的能量字段并非必需。",
      keeps:"序列、配对、骨架连接、原始编号",loses:"完整三维信息、环环境注释",
      exampleLabel:"CT",source:"rnastructure",paper:"tarnas",
      caps:[1,1,0,0,0,0],study:["prediction","methods"],kind:"配对表"
    },
    {
      id:"matrix",name:"配对矩阵",full:"Pairing / Probability Matrix",cn:"二维关系或概率",group:"pair",extension:"数组 · 表格 · 工具专用输出",
      what:"矩阵的行列都是序列位置。二值矩阵记录配对与否；概率矩阵则记录各对位置配对的概率。",
      why:"适合批量计算、机器学习和结构比较；概率矩阵可保留竞争配对及其不确定性。",
      suited:["方法开发","机器学习","结构集合与不确定性分析"],
      caution:"二值矩阵与概率矩阵含义不同。由概率矩阵提取确定结构时，需检查阈值筛选后的结构约束。",
      keeps:"成对关系；概率版本还能保存不确定性",loses:"矩阵本身不自动提供环语义或绘图布局",
      exampleLabel:"二值矩阵（行列节选）",source:"vienna",paper:"vienna",
      caps:[1,1,0,0,0,1],study:["methods","prediction"],kind:"数据表示"
    },
    {
      id:"wuss",name:"WUSS",full:"Washington University Secondary Structure",cn:"配对与环环境",group:"compare",extension:"常嵌入 Stockholm 文件",
      what:"使用配对符号及 _、-、,、:、. 等标记，区分发夹环、内环、多分支环、外部区域与插入位置。",
      why:"保留未配对位点的结构环境，支持结构比对与区域注释。",
      suited:["rRNA 结构比对","协方差模型","环区与茎区比较"],
      caution:"WUSS 中的 [] 不一定表示伪结；伪结常用 A/a 等大小写字母表示。其符号含义与扩展 DBN 不同。",
      keeps:"配对、交叉关系、环环境",loses:"空间坐标；单独一行不构成完整比对文件",
      exampleLabel:"WUSS",source:"vienna",
      caps:[1,1,1,0,0,0],study:["comparative","pseudoknot"],kind:"注释记法"
    },
    {
      id:"stockholm",name:"Stockholm",full:"Stockholm Alignment Format",cn:"带注释的比对容器",group:"compare",extension:".stk · .sto",
      what:"Stockholm 保存序列比对、文件级与序列级元数据，以及 SS_cons 等逐列注释；结构常按 WUSS 解释。",
      why:"在同一文件中关联序列、比对列和结构注释，适合比较分析与协方差模型工作流。",
      suited:["多序列结构比对","Rfam / Infernal 工作流","比较基因组与 rRNA 研究"],
      caution:"Stockholm 是容器，WUSS 是记法。共识 SS_cons 不等于每条序列都具有相同的实际配对；单序列 STK 也不证明做过比对。",
      keeps:"比对、逐列结构与来源元数据",loses:"通常不包含人工排图坐标或原子坐标",
      exampleLabel:"Stockholm（单序列示例）",source:"stockholm",
      caps:[1,1,1,1,0,0],study:["comparative","methods"],kind:"文件容器"
    },
    {
      id:"bprna",name:"bpRNA 注释",full:"bpRNA structure-type annotation",cn:"结构类型数组",group:"compare",extension:".st · 工具输出",
      what:"逐位标记茎、发夹环、内环、鼓包、多分支环或外部区域，并可另标识伪结参与情况。",
      why:"支持茎长、环长及结构类型统计，便于比较局部结构特征。",
      suited:["结构特征统计","模型训练与评估","环与茎的比较分析"],
      caution:"结构类型数组不能唯一恢复配对伙伴。本例为类型数组示意，并非完整 .st 输出。",
      keeps:"位点的结构类型、伪结参与标记",loses:"仅凭类型数组不能恢复全部配对",
      exampleLabel:"结构类型数组（示意）",source:"bprna",paper:"bprna",
      caps:[0.5,0.5,1,0,0,0],study:["comparative","methods"],kind:"派生注释"
    },
    {
      id:"shape",name:"树 / 抽象形状",full:"Tree / Abstract Shape",cn:"结构骨架与层次",group:"compare",extension:"依抽象层级与工具而定",
      what:"将茎、环及其包含关系抽象为树或形状；不同层级可省略长度、局部细节或部分结构单元。",
      why:"降低序列长度与局部差异的影响，支持结构聚类与形态检索。",
      suited:["结构聚类","骨架比较","形态检索与结构抽象"],
      caution:"抽象表示通常不能还原逐碱基配对；普通嵌套树不能完整表示伪结，需采用扩展图表示。",
      keeps:"选定层级的结构骨架与包含关系",loses:"部分或全部序列、精确长度与伙伴坐标",
      exampleLabel:"结构树（示意）",source:"tarnas",paper:"tarnas",
      caps:[0,0.5,0.5,0,0,0],study:["comparative","methods"],kind:"抽象表示"
    },
    {
      id:"ss",name:"SS / 二维坐标",full:"Secondary-structure drawing format",cn:"配对与排图",group:"space",extension:".ss · .ss.txt（存在方言）",
      what:"某些 SS 方言逐行保存位置、碱基、x/y 坐标、绘图类型和配对伙伴，并附有文字、线条及显示控制。",
      why:"保留二级结构的人工布局，支持结构图的编辑与复现。",
      suited:["rRNA 图谱绘制","人工布局复现","结构与比对的联动界面"],
      caution:"SS 并非唯一统一标准。本例采用 CRW/XRNA 风格的六列碱基记录；隐藏范围是显示设置，不能当作序列边界。",
      keeps:"碱基、配对与二维布局",loses:"不等于分子的真实三维结构",
      exampleLabel:"SS（六列记录片段）",source:"unafold",
      caps:[1,1,0,0,1,0],study:["drawing","comparative"],kind:"绘图格式"
    },
    {
      id:"rnaml",name:"RNAML",full:"RNA Markup Language",cn:"RNA 信息交换语法",group:"space",extension:".xml · .rnaml",
      what:"RNAML 用 XML 描述 RNA 信息，可表达序列、编号、配对、结构与来源等对象，也支持更丰富的相互作用描述。",
      why:"以分层标签组织结构与来源信息，支持工具间的信息交换。",
      suited:["异构工具之间交换","丰富结构注释","结构信息数据库"],
      caution:"文件较冗长；不同实现支持的字段可能不同。转换到 DBN 时，额外语义不能自动全部保留。",
      keeps:"序列、结构关系与扩展语义",loses:"能否保留具体字段取决于实现和转换器",
      exampleLabel:"RNAML（简化片段）",source:"tarnas",paper:"tarnas",
      caps:[1,1,0.5,0.5,1,0],study:["methods","spatial"],kind:"交换语法"
    },
    {
      id:"mmcif",name:"PDBx/mmCIF",full:"PDB Exchange / Macromolecular CIF",cn:"原子三维坐标",group:"space",extension:".cif · .mmcif",
      what:"PDBx/mmCIF 可以存储原子坐标、链与残基标识，以及实验、模型和结构描述信息。",
      why:"提供非经典配对、碱基堆积、三联体及空间几何分析所需的原子结构信息。",
      suited:["三维相互作用分析","核糖体与 RNA 复合体","从原子结构提取二级结构"],
      caution:"由三维坐标提取配对需经识别与筛选，结果依赖工具规则。本例坐标为构造片段，并非完整分子模型。",
      keeps:"三维坐标、模型与实验元数据",loses:"配对和环环境通常仍需专门解析",
      exampleLabel:"atom_site（坐标片段）",source:"mmcif",paper:"dssr",
      caps:[0.5,0.5,0.5,0,1,0],study:["spatial","drawing"],kind:"三维容器"
    }
  ],
  studies: [
    {id:"prediction",name:"结构预测",label:"预测结构的存储与核验",recommend:["dbn","ct","matrix"],text:"DBN、CT 用于记录确定的结构；配对概率矩阵用于保存竞争配对及其不确定性。"},
    {id:"pseudoknot",name:"伪结分析",label:"交叉配对的编码与核验",recommend:["extended","bpseq","wuss"],text:"选用支持交叉配对的表示；转换后核对完整配对集合，括号字符串的差异不一定代表结构差异。"},
    {id:"comparative",name:"rRNA 比较",label:"结构注释与序列比对",recommend:["stockholm","wuss","bprna"],text:"Stockholm 关联比对与结构注释，WUSS 区分结构环境，bpRNA 支持区域统计。分析中需区分缺口、未覆盖与未知。"},
    {id:"drawing",name:"图谱绘制",label:"结构布局的保存与复现",recommend:["ss","mmcif"],text:"二维排图需保留布局坐标；三维几何分析需保留原子坐标。相同配对集合可对应不同的二维布局。"},
    {id:"methods",name:"方法开发",label:"结构数据处理与方法评估",recommend:["bpseq","matrix","bprna","rnaml"],text:"配对表用于配对核验，类型数组用于局部环境分析，矩阵用于批量计算；元数据与转换规则需同步保存。"},
    {id:"spatial",name:"三维相互作用",label:"三维结构及相互作用分析",recommend:["mmcif","rnaml"],text:"以原子结构为依据，记录相互作用识别、筛选及编号映射规则，再导出二级结构。"}
  ],
  sources: {
    rnastructure:{name:"RNAstructure 文件格式手册",url:"https://rna.urmc.rochester.edu/Releases/current/manual/Text/File_Formats.html"},
    vienna:{name:"ViennaRNA 结构记法文档",url:"https://viennarna.readthedocs.io/en/latest/io/rna_structures.html"},
    stockholm:{name:"Infernal / Stockholm 格式文档",url:"https://github.com/EddyRivasLab/infernal/blob/master/documentation/userguide/formats.tex"},
    unafold:{name:"UNAFold 文件格式文档",url:"https://www.unafold.org/doc/formats.php"},
    mmcif:{name:"wwPDB PDBx/mmCIF 官方资源",url:"https://mmcif.wwpdb.org/"},
    tarnas:{name:"TARNAS 格式与转换论文",url:"https://doi.org/10.3390/ijms26125728"},
    bprna:{name:"bpRNA 结构类型论文",url:"https://doi.org/10.1093/nar/gky285"}
  },
  papers:[
    {id:"antczak",year:"2018",authors:"Antczak et al.",title:"New algorithms to represent complex pseudoknotted RNA structures in dot-bracket notation",journal:"Bioinformatics · 34:1304–1312",doi:"10.1093/bioinformatics/btx783",image:"antczak.webp",figure:"Fig. 1",takeaway:"复杂伪结的分层表示与扩展 DBN 编码。",caption:"钴胺素适配体的单链、发夹及不同阶伪结表示。",license:"CC BY-NC 4.0",pmc:"PMC5905660",sourceImage:"https://cdn.ncbi.nlm.nih.gov/pmc/blobs/47eb/5905660/78ae1ae7b016/btx783f1.jpg"},
    {id:"bprna",year:"2018",authors:"Danaee et al.",title:"bpRNA: large-scale automated annotation and analysis of RNA secondary structure",journal:"Nucleic Acids Research · 46:5381–5394",doi:"10.1093/nar/gky285",image:"bprna.webp",figure:"Fig. 1",takeaway:"二级结构单元的自动识别与位点类型注释。",caption:"发夹环、鼓包、内环、多分支环等结构类型示意。",license:"CC BY-NC 4.0",pmc:"PMC6009582",sourceImage:"https://cdn.ncbi.nlm.nih.gov/pmc/blobs/2b7b/6009582/a5ea9f7e41e7/nar_46_11_5381_f2.jpg"},
    {id:"tarnas",year:"2025",authors:"Quadrini et al.",title:"TARNAS: A Software Tool for Abstracting and Translating RNA Secondary Structures",journal:"International Journal of Molecular Sciences · 26:5728",doi:"10.3390/ijms26125728",image:"tarnas.webp",figure:"Fig. 1",takeaway:"配对表、括号记法与结构抽象之间的转换。",caption:"无伪结与含伪结 RNA 的弧线图表示。",license:"CC BY 4.0",pmc:"PMC12193548",sourceImage:"https://cdn.ncbi.nlm.nih.gov/pmc/blobs/10d1/12193548/34b4ba79c200/ijms-26-05728-g001.jpg"},
    {id:"vienna",year:"2011",authors:"Lorenz et al.",title:"ViennaRNA Package 2.0",journal:"Algorithms for Molecular Biology · 6:26",doi:"10.1186/1748-7188-6-26",image:"vienna.webp",figure:"Fig. 1",takeaway:"二级结构预测、局部结构与配对概率计算。",caption:"ViennaRNA 程序及其结构、概率等输出示例。",license:"CC BY 2.0",pmc:"PMC3319429",sourceImage:"https://cdn.ncbi.nlm.nih.gov/pmc/blobs/6549/3319429/821db0fb1157/1748-7188-6-26-1.jpg"},
    {id:"dssr",year:"2015",authors:"Lu, Bussemaker & Olson",title:"DSSR: an integrated software tool for dissecting the spatial structure of RNA",journal:"Nucleic Acids Research · 43:e142",doi:"10.1093/nar/gkv716",image:"dssr.webp",figure:"Fig. 2",takeaway:"基于原子几何的配对、茎及相互作用识别。",caption:"酵母 tRNA 的三维折叠及对应二级结构特征。",license:"CC BY-NC 4.0",pmc:"PMC4666379",sourceImage:"https://cdn.ncbi.nlm.nih.gov/pmc/blobs/3359/4666379/5c8839b9923e/gkv716fig2.jpg"}
  ]
};
