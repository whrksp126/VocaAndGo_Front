const user_data = {
  id : "",
  name : "용궁 공주",
}

const vocabulary_list = [
  // {
  //   id : "11328930-2c3e-41e0-8977-080fe551f301",
  //   name : "토익 준비용 🔥",
  //   colors : {
  //     main : "FF8DD4",
  //     background : "FFEFFA"
  //   },
  //   counts : {
  //     total : 0,
  //     correct : 0
  //   }
  // }
]

const elementary_vocabulary = {
  id : 1,
  name : "토익 준비용 🔥",
  color : "#FF8DD4",
  background_color : "#FFEFFA",
  success_count : 2,
  total_count : 2,
  list : [
    {
      id : 1,
      words : "vehicle",
      meaning : ["차량", "탈것"],
      explanation : "",
      example_sentences_list : [
        {
          en : "Was the vehicle insured?",
          kr : "그 차량이 보험에 가입되어 있었나요?"
        },
        {
          en : "Are you the driver of this vehicle?",
          kr : "당신이 이 차[탈것]의 운전자인가요?"
        },
        {
          en : "Their vehicle came under fire.",
          kr : "그들이 탄 차량이 총격을 받게 되었다."
        }
      ],
      pronunciation_symbols : "ˈviːəkl",
      success : true,
    },
    {
      id : 2,
      words : "corridor",
      meaning : ["복도, 회랑", " (기차 안의) 통로", "종주 지형(다른 나라와 인접하여 길게 뻗어 있는 지형), (항공기가 다니는) 공중 회랑 (→air corridor)"],
      explanation : "",
      example_sentences_list : [
        {
          en : "She ran out into the corridor.",
          kr : "그녀가 달려 나가 복도 안으로 들어갔다."
        },
        {
          en : "His room is along the corridor.",
          kr : "그의 방은 복도를 따라가다 보면 있다."
        },
        {
          en : "I looked up and down the corridor.",
          kr : "나는 복도를 이쪽저쪽 살펴보았다."
        }
      ],
      pronunciation_symbols : "|kɔːrɪdɔː(r); │kɑːrɪdɔː(r)",
      success : true,
    },
    {
      id : 3,
      words : "corridor",
      meaning : ["복도, 회랑", " (기차 안의) 통로", "종주 지형(다른 나라와 인접하여 길게 뻗어 있는 지형), (항공기가 다니는) 공중 회랑 (→air corridor)"],
      explanation : "",
      example_sentences_list : [
        {
          en : "She ran out into the corridor.",
          kr : "그녀가 달려 나가 복도 안으로 들어갔다."
        },
        {
          en : "His room is along the corridor.",
          kr : "그의 방은 복도를 따라가다 보면 있다."
        },
        {
          en : "I looked up and down the corridor.",
          kr : "나는 복도를 이쪽저쪽 살펴보았다."
        }
      ],
      pronunciation_symbols : "|kɔːrɪdɔː(r); │kɑːrɪdɔː(r)",
      success : true,
    },
  ]
}

// 서점 데이터 더미
const vocabulary_store_dummy_data = [
  {
    id : 1,
    name : "토익 준비용 🔥",
    downloads : 157025,
    category : "HOT",
    color : {
      main : "#FF8DD4",
      sub : "#FFD2EF",
      background : "#FFEFFA",
    },
    words : [
      {
        id : 1,
        word : "monday",
        meaning: ["월요일"],
      },
      {
        id : 2,
        word : "tuesday",
        meaning: ["화요일"],
      },
      {
        id : 3,
        word : "wednesday",
        meaning: ["수요일"],
      },
      {
        id : 4,
        word : "thursday",
        meaning: ["목요일"],
      },
      {
        id : 5,
        word : "friday",
        meaning: ["금요일"],
      },
      {
        id : 6,
        word : "saturday",
        meaning: ["토요일"],
      },
      {
        id : 7,
        word : "sunday",
        meaning: ["일요일"],
      },
    ]
  },
  {
    id : 2,
    name : "고등 수능 영단어 👀",
    downloads : 3671,
    category : null,
    color : {
      main : "#CD8DFF",
      sub : "#EAD2FF",
      background : "#F6EFFF",
    },
    words : [
      {
        id : 1,
        word : "monday",
        meaning: ["월요일"],
      },
      {
        id : 2,
        word : "tuesday",
        meaning: ["화요일"],
      },
      {
        id : 3,
        word : "wednesday",
        meaning: ["수요일"],
      },
      {
        id : 4,
        word : "thursday",
        meaning: ["목요일"],
      },
      {
        id : 5,
        word : "friday",
        meaning: ["금요일"],
      },
      {
        id : 6,
        word : "saturday",
        meaning: ["토요일"],
      },
      {
        id : 7,
        word : "sunday",
        meaning: ["일요일"],
      },
    ]
  },
  {
    id : 3,
    name : "30일 완성 TEPS 👍",
    downloads : 9307,
    category : null,
    color : {
      main : "#74D5FF",
      sub : "#C6ECFF",
      background : "#EAF6FF",
    },
    words : [
      {
        id : 1,
        word : "monday",
        meaning: ["월요일"],
      },
      {
        id : 2,
        word : "tuesday",
        meaning: ["화요일"],
      },
      {
        id : 3,
        word : "wednesday",
        meaning: ["수요일"],
      },
      {
        id : 4,
        word : "thursday",
        meaning: ["목요일"],
      },
      {
        id : 5,
        word : "friday",
        meaning: ["금요일"],
      },
      {
        id : 6,
        word : "saturday",
        meaning: ["토요일"],
      },
      {
        id : 7,
        word : "sunday",
        meaning: ["일요일"],
      },
    ]
  },
  {
    id : 4,
    name : "기적의 말하기 영단어 🗣️",
    downloads : 970,
    category : "NEW",
    color : {
      main : "#42F98B",
      sub : "#B2FDCC",
      background : "#E2FFE8",
    },
    words : [
      {
        id : 1,
        word : "monday",
        meaning: ["월요일"],
      },
      {
        id : 2,
        word : "tuesday",
        meaning: ["화요일"],
      },
      {
        id : 3,
        word : "wednesday",
        meaning: ["수요일"],
      },
      {
        id : 4,
        word : "thursday",
        meaning: ["목요일"],
      },
      {
        id : 5,
        word : "friday",
        meaning: ["금요일"],
      },
      {
        id : 6,
        word : "saturday",
        meaning: ["토요일"],
      },
      {
        id : 7,
        word : "sunday",
        meaning: ["일요일"],
      },
    ]
  },
  {
    id : 5,
    name : "챗GPT 영어 공부 - 영단어편 💭",
    downloads : 235480,
    category : "HOT",
    color : {
      main : "#FFBD3C",
      sub : "#FFE5AE",
      background : "#FFF6DF",
    },
    words : [
      {
        id : 1,
        word : "monday",
        meaning: ["월요일"],
      },
      {
        id : 2,
        word : "tuesday",
        meaning: ["화요일"],
      },
      {
        id : 3,
        word : "wednesday",
        meaning: ["수요일"],
      },
      {
        id : 4,
        word : "thursday",
        meaning: ["목요일"],
      },
      {
        id : 5,
        word : "friday",
        meaning: ["금요일"],
      },
      {
        id : 6,
        word : "saturday",
        meaning: ["토요일"],
      },
      {
        id : 7,
        word : "sunday",
        meaning: ["일요일"],
      },
    ]
  },
]
