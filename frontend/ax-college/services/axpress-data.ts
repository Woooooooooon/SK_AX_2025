// Simplified mock data exports to test if the issue is with the main API file
import type { ArticleCard, Paper, CommunityPost } from "@/types/axpress"

export const mockArticles: ArticleCard[] = [
  {
    id: "1",
    title: "AX College 새로운 교육과정 안내",
    summary: "2024년 새로운 교육과정이 출시되었습니다.",
    category: "news",
    tags: ["교육", "신규"],
    thumb: null,
    publishedAt: "2024-01-15",
    views: 1250,
  },
  {
    id: "2",
    title: "수강신청 일정 공지",
    summary: "2024년 1분기 수강신청 일정을 안내드립니다.",
    category: "notice",
    tags: ["수강신청", "일정"],
    thumb: null,
    publishedAt: "2024-01-10",
    views: 890,
  },
  {
    id: "3",
    title: "온라인 세미나 개최 안내",
    summary: "AI와 교육의 미래를 주제로 한 온라인 세미나가 개최됩니다.",
    category: "event",
    tags: ["세미나", "AI"],
    thumb: null,
    publishedAt: "2024-01-08",
    views: 567,
  },
]

export type PaperDomain = "금융" | "통신" | "제조" | "유통/물류" | "AI" | "클라우드"

export interface PaperWithDomain extends Paper {
  domain: PaperDomain
}

export const mockPapersByDomain: Record<PaperDomain, PaperWithDomain[]> = {
  금융: [
    {
      id: "",
      domain: "금융",
      title: "AI-Driven Financial Fraud Detection Systems",
      authors: ["김금융", "이보안"],
      abstract:
        "This paper presents a novel approach to detecting financial fraud using advanced machine learning techniques. Our system analyzes transaction patterns in real-time to identify suspicious activities with high accuracy.",
      source: "Journal of Financial Technology",
      publishedAt: "2024-01-15",
      url: "https://example.com/finance1",
    },
    {
      id: "",
      domain: "금융",
      title: "Blockchain Technology in Banking Infrastructure",
      authors: ["박블록", "최체인"],
      abstract:
        "We explore the implementation of blockchain technology in modern banking systems, focusing on security, transparency, and efficiency improvements in financial transactions.",
      source: "Financial Innovation Review",
      publishedAt: "2024-02-20",
      url: "https://example.com/finance2",
    },
    {
      id: "",
      domain: "금융",
      title: "Predictive Analytics for Stock Market Trends",
      authors: ["정주식", "강시장"],
      abstract:
        "This study introduces a deep learning model for predicting stock market movements using historical data and sentiment analysis from financial news.",
      source: "Quantitative Finance",
      publishedAt: "2024-03-10",
      url: "https://example.com/finance3",
    },
    {
      id: "",
      domain: "금융",
      title: "Digital Currency and Central Bank Policy",
      authors: ["오디지털", "한은행"],
      abstract:
        "An analysis of how central bank digital currencies (CBDCs) are reshaping monetary policy and financial stability in the modern economy.",
      source: "Economic Policy Review",
      publishedAt: "2024-04-05",
      url: "https://example.com/finance4",
    },
    {
      id: "",
      domain: "금융",
      title: "Risk Management in Fintech Platforms",
      authors: ["서핀텍", "남리스크"],
      abstract:
        "This paper examines risk management strategies specifically designed for fintech platforms, addressing unique challenges in the digital financial ecosystem.",
      source: "Risk Management Journal",
      publishedAt: "2024-05-18",
      url: "https://example.com/finance5",
    },
  ],
  통신: [
    {
      id: "",
      domain: "통신",
      title: "5G Network Optimization and Edge Computing",
      authors: ["김오지", "이엣지"],
      abstract:
        "We propose a comprehensive framework for optimizing 5G networks through intelligent edge computing deployment, reducing latency and improving user experience.",
      source: "IEEE Communications",
      publishedAt: "2024-01-20",
      url: "https://example.com/telecom1",
    },
    {
      id: "",
      domain: "통신",
      title: "Network Security in IoT Environments",
      authors: ["박아이오티", "최보안"],
      abstract:
        "This study addresses security vulnerabilities in IoT networks and proposes a multi-layered security architecture for protecting connected devices.",
      source: "Telecom Security Review",
      publishedAt: "2024-02-15",
      url: "https://example.com/telecom2",
    },
    {
      id: "",
      domain: "통신",
      title: "6G Vision: Beyond 5G Technologies",
      authors: ["정육지", "강미래"],
      abstract:
        "An exploration of next-generation 6G technologies, including AI-native networks, terahertz communication, and quantum networking.",
      source: "Future Networks Journal",
      publishedAt: "2024-03-22",
      url: "https://example.com/telecom3",
    },
    {
      id: "",
      domain: "통신",
      title: "Software-Defined Networking in Enterprise",
      authors: ["오에스디엔", "한기업"],
      abstract:
        "This paper discusses the implementation and benefits of software-defined networking (SDN) in large-scale enterprise environments.",
      source: "Network Architecture Review",
      publishedAt: "2024-04-12",
      url: "https://example.com/telecom4",
    },
    {
      id: "",
      domain: "통신",
      title: "Satellite Internet and Rural Connectivity",
      authors: ["서위성", "남연결"],
      abstract:
        "We analyze the impact of satellite internet technologies in bridging the digital divide and providing connectivity to rural and remote areas.",
      source: "Global Connectivity Journal",
      publishedAt: "2024-05-08",
      url: "https://example.com/telecom5",
    },
  ],
  제조: [
    {
      id: "",
      domain: "제조",
      title: "Smart Factory and Industry 4.0 Implementation",
      authors: ["김스마트", "이공장"],
      abstract:
        "This research presents a comprehensive guide to implementing Industry 4.0 principles in manufacturing, focusing on IoT integration and real-time monitoring.",
      source: "Manufacturing Technology",
      publishedAt: "2024-01-25",
      url: "https://example.com/manufacturing1",
    },
    {
      id: "",
      domain: "제조",
      title: "Predictive Maintenance Using Machine Learning",
      authors: ["박예지", "최정비"],
      abstract:
        "We develop a machine learning system for predicting equipment failures before they occur, reducing downtime and maintenance costs.",
      source: "Industrial Engineering",
      publishedAt: "2024-02-18",
      url: "https://example.com/manufacturing2",
    },
    {
      id: "",
      domain: "제조",
      title: "Digital Twin Technology in Production Lines",
      authors: ["정디지털", "강트윈"],
      abstract:
        "An exploration of digital twin technology for simulating and optimizing production processes in real-time manufacturing environments.",
      source: "Advanced Manufacturing",
      publishedAt: "2024-03-14",
      url: "https://example.com/manufacturing3",
    },
    {
      id: "",
      domain: "제조",
      title: "Robotics and Automation in Assembly",
      authors: ["오로봇", "한자동"],
      abstract:
        "This study examines the latest developments in robotics and automation systems for improving efficiency and precision in assembly operations.",
      source: "Robotics in Industry",
      publishedAt: "2024-04-20",
      url: "https://example.com/manufacturing4",
    },
    {
      id: "",
      domain: "제조",
      title: "Sustainable Manufacturing and Green Technology",
      authors: ["서친환", "남지속"],
      abstract:
        "We investigate sustainable manufacturing practices and green technologies that reduce environmental impact while maintaining production efficiency.",
      source: "Sustainable Production",
      publishedAt: "2024-05-11",
      url: "https://example.com/manufacturing5",
    },
  ],
  "유통/물류": [
    {
      id: "",
      domain: "유통/물류",
      title: "AI-Powered Supply Chain Optimization",
      authors: ["김공급", "이체인"],
      abstract:
        "This paper introduces an AI-based system for optimizing supply chain operations, reducing costs and improving delivery times through intelligent routing.",
      source: "Logistics Management",
      publishedAt: "2024-01-30",
      url: "https://example.com/logistics1",
    },
    {
      id: "",
      domain: "유통/물류",
      title: "Autonomous Delivery Systems and Last-Mile Solutions",
      authors: ["박자율", "최배송"],
      abstract:
        "We explore the use of autonomous vehicles and drones for last-mile delivery, addressing challenges and opportunities in urban logistics.",
      source: "Transportation Research",
      publishedAt: "2024-02-22",
      url: "https://example.com/logistics2",
    },
    {
      id: "",
      domain: "유통/물류",
      title: "Warehouse Automation and Robotics",
      authors: ["정창고", "강자동화"],
      abstract:
        "An analysis of automated warehouse systems using robotics and AI for inventory management and order fulfillment optimization.",
      source: "Warehouse Technology",
      publishedAt: "2024-03-17",
      url: "https://example.com/logistics3",
    },
    {
      id: "",
      domain: "유통/물류",
      title: "Blockchain in Supply Chain Transparency",
      authors: ["오블록", "한투명"],
      abstract:
        "This study demonstrates how blockchain technology enhances transparency and traceability in global supply chains.",
      source: "Supply Chain Innovation",
      publishedAt: "2024-04-25",
      url: "https://example.com/logistics4",
    },
    {
      id: "",
      domain: "유통/물류",
      title: "Smart Inventory Management Systems",
      authors: ["서재고", "남관리"],
      abstract:
        "We present a smart inventory management system that uses IoT sensors and predictive analytics to optimize stock levels and reduce waste.",
      source: "Retail Technology Review",
      publishedAt: "2024-05-13",
      url: "https://example.com/logistics5",
    },
  ],
  AI: [
    {
      id: "",
      domain: "AI",
      title: "Attention Is All You Need",
      authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
      abstract:
        "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
      source: "NeurIPS 2017",
      publishedAt: "2017-06-12",
      url: "https://arxiv.org/abs/1706.03762",
    },
    {
      id: "",
      domain: "AI",
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee"],
      abstract:
        "We introduce BERT, which stands for Bidirectional Encoder Representations from Transformers. BERT is designed to pre-train deep bidirectional representations from unlabeled text.",
      source: "NAACL 2019",
      publishedAt: "2018-10-11",
      url: "https://arxiv.org/abs/1810.04805",
    },
    {
      id: "",
      domain: "AI",
      title: "GPT-3: Language Models are Few-Shot Learners",
      authors: ["Tom Brown", "Benjamin Mann", "Nick Ryder"],
      abstract:
        "We show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches.",
      source: "NeurIPS 2020",
      publishedAt: "2020-05-28",
      url: "https://arxiv.org/abs/2005.14165",
    },
    {
      id: "",
      domain: "AI",
      title: "ResNet: Deep Residual Learning for Image Recognition",
      authors: ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren"],
      abstract:
        "We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.",
      source: "CVPR 2016",
      publishedAt: "2015-12-10",
      url: "https://arxiv.org/abs/1512.03385",
    },
    {
      id: "",
      domain: "AI",
      title: "Generative Adversarial Networks",
      authors: ["Ian Goodfellow", "Jean Pouget-Abadie", "Mehdi Mirza"],
      abstract:
        "We propose a new framework for estimating generative models via an adversarial process, training two models: a generative model G and a discriminative model D.",
      source: "NeurIPS 2014",
      publishedAt: "2014-06-10",
      url: "https://arxiv.org/abs/1406.2661",
    },
  ],
  클라우드: [
    {
      id: "",
      domain: "클라우드",
      title: "Serverless Architecture and Function-as-a-Service",
      authors: ["김서버", "이리스"],
      abstract:
        "This paper explores serverless computing architectures and FaaS platforms, analyzing their benefits for scalable, cost-effective application development.",
      source: "Cloud Computing Review",
      publishedAt: "2024-01-12",
      url: "https://example.com/cloud1",
    },
    {
      id: "",
      domain: "클라우드",
      title: "Multi-Cloud Strategy and Vendor Lock-in Prevention",
      authors: ["박멀티", "최클라우드"],
      abstract:
        "We present strategies for implementing multi-cloud architectures that prevent vendor lock-in while maintaining operational efficiency.",
      source: "Enterprise Cloud Journal",
      publishedAt: "2024-02-28",
      url: "https://example.com/cloud2",
    },
    {
      id: "",
      domain: "클라우드",
      title: "Cloud Security and Zero Trust Architecture",
      authors: ["정보안", "강제로"],
      abstract:
        "An in-depth analysis of implementing zero trust security models in cloud environments to protect against modern cyber threats.",
      source: "Cloud Security Today",
      publishedAt: "2024-03-19",
      url: "https://example.com/cloud3",
    },
    {
      id: "",
      domain: "클라우드",
      title: "Container Orchestration with Kubernetes",
      authors: ["오컨테이너", "한쿠버"],
      abstract:
        "This study examines best practices for deploying and managing containerized applications at scale using Kubernetes orchestration.",
      source: "DevOps Engineering",
      publishedAt: "2024-04-16",
      url: "https://example.com/cloud4",
    },
    {
      id: "",
      domain: "클라우드",
      title: "Edge Computing and Cloud Integration",
      authors: ["서엣지", "남통합"],
      abstract:
        "We investigate the integration of edge computing with cloud infrastructure for low-latency applications and improved data processing.",
      source: "Distributed Systems",
      publishedAt: "2024-05-21",
      url: "https://example.com/cloud5",
    },
  ],
}

// Legacy export for backward compatibility
export const mockPapers: Paper[] = Object.values(mockPapersByDomain).flat()

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "1",
    title: "새로운 학습 방법론 제안",
    summary: "효과적인 온라인 학습을 위한 새로운 접근법을 제안합니다.",
    author: "김학습",
    votes: 15,
    createdAt: "2024-01-12",
  },
  {
    id: "2",
    title: "교육 플랫폼 개선 아이디어",
    summary: "사용자 경험을 향상시킬 수 있는 플랫폼 개선 방안입니다.",
    author: "이개발",
    votes: 8,
    createdAt: "2024-01-10",
  },
]
