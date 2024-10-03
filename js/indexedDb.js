const INDEXED_DB_NAME = "HEY_VOCA_DB";
const INDEXED_DB_VERSION = 1;
let INDEXED_DB;
let INDEXED_STATUS = "off";

// 인덱스 DB 호출 await
const waitIndexDbOpen = () => {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (["on", "err"].includes(INDEXED_STATUS)) {
        clearInterval(intervalId); // 조건을 만족하면 인터벌 중지
        resolve(INDEXED_STATUS); // INDEXED_STATUS 값을 반환하며 Promise 해결
      }
    }, 30);
  });
};


// 데이터베이스를 여는 요청
const INDEXED_DB_REQUEST = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

INDEXED_DB_REQUEST.onerror = function(event) {
  INDEXED_STATUS = "err"
  console.error("데이터베이스 오류: ", event.target.errorCode);
};

INDEXED_DB_REQUEST.onsuccess = function(event) {
  INDEXED_DB = event.target.result;
  INDEXED_STATUS = "on"
  console.log("데이터베이스가 성공적으로 열렸습니다.");
};

INDEXED_DB_REQUEST.onupgradeneeded = function(event) {
  INDEXED_DB = event.target.result;
  INDEXED_STATUS = "on"
  console.log('데이터베이스가 처음으로 열렸습니다.')
  // 사용자 스토어 생성
  const userStore = INDEXED_DB.createObjectStore("users", { keyPath: "id", autoIncrement: true });
  // userStore.createIndex("email", "email", { unique: true });

  // 단어장 스토어 생성
  const notebookStore = INDEXED_DB.createObjectStore("notebooks", { keyPath: "id", autoIncrement: true });
  // notebookStore.createIndex("name", "name", { unique: true });
  // notebookStore.createIndex("color", "color", { unique: false });
  // notebookStore.createIndex("createdAt", "createdAt", { unique: false });
  // notebookStore.createIndex("updatedAt", "updatedAt", { unique: false });
  // notebookStore.createIndex("status", "status", { unique: false });

  // 단어 스토어 생성
  const wordStore = INDEXED_DB.createObjectStore("words", { keyPath: "id", autoIncrement: true });
  wordStore.createIndex("notebookId", "notebookId", { unique: false });
  // wordStore.createIndex("word", "word", { unique: false });
  // wordStore.createIndex("meaning", "meaning", { unique: false });
  // wordStore.createIndex("example", "example", { unique: false });
  // wordStore.createIndex("description", "description", { unique: false });
  // wordStore.createIndex("createdAt", "createdAt", { unique: false });
  // wordStore.createIndex("updatedAt", "updatedAt", { unique: false });
  // wordStore.createIndex("status", "status", { unique: false });

  // 최근 학습 스토어 생성
  const recentLearningStore = INDEXED_DB.createObjectStore("recentLearning");
  recentLearningStore.put(null, "type"); // card, mcq
  recentLearningStore.put(null, "state"); // "before", after
  recentLearningStore.put(null, "test_list"); // []

  // 더미 데이터 추가
  const isNewDatabase = event.oldVersion === 0;
  if (isNewDatabase) {
    userStore.transaction.oncomplete = function() {
      const userTransaction = INDEXED_DB.transaction("users", "readwrite");
      const userStore = userTransaction.objectStore("users");

      // 사용자 더미 데이터
      userStore.add({ name: "비회원", email: "구글 로그인이 필요합니다" });

      const notebookTransaction = INDEXED_DB.transaction("notebooks", "readwrite");
      const notebookStore = notebookTransaction.objectStore("notebooks");

      // 단어장 더미 데이터
      // const createdAt = new Date().toISOString();
      // notebookStore.add({ name: "초등 영단어", color: {main: "42F98B", background: "E2FFE8"}, createdAt, updatedAt: createdAt, status: "active" });
      // notebookStore.add({ name: "중등 영단어", color: {main: "FF8DD4", background: "FFEFFA"}, createdAt, updatedAt: createdAt, status: "active" });
      // notebookStore.add({ name: "고등 영단어", color: {main: "CD8DFF", background: "F6EFFF"}, createdAt, updatedAt: createdAt, status: "active" });
      // notebookStore.add({ name: "수능 영단어", color: {main: "74D5FF", background: "EAF6FF"}, createdAt, updatedAt: createdAt, status: "active" });
      // notebookStore.add({ name: "토익 영단어", color: {main: "FFBD3C", background: "FFF6DF"}, createdAt, updatedAt: createdAt, status: "active" });

      const wordTransaction = INDEXED_DB.transaction("words", "readwrite");
      const wordStore = wordTransaction.objectStore("words");

      // 단어 더미 데이터
      // wordStore.add({ notebookId: 1, word: "apple", meaning: ["사과"], example: [{origin : "I ate an apple.", meaning : "나는 사과를 먹었다."}], description: "먹는 사과", createdAt, updatedAt: createdAt, status: 0 });
      // wordStore.add({ notebookId: 1, word: "book", meaning: ["도서"], example: [{origin : "I read a book.", meaning : "나는 책을 읽었다."}], description: "읽는 책", createdAt, updatedAt: createdAt, status: 1 });
    };
  }
};

// 사용자 추가 함수
function addIndexedDbUser(name, email) {
  const transaction = INDEXED_DB.transaction(["users"], "readwrite");
  const store = transaction.objectStore("users");

  const request = store.add({ name, email });

  request.onsuccess = function() {
    console.log("사용자가 성공적으로 추가되었습니다.");
  };

  request.onerror = function(event) {
    console.error("사용자를 추가하는 중에 오류가 발생했습니다.: ", event.target.errorCode);
  };
}

// 사용자 조회 함수
function getIndexedDbUsers() {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["users"], "readonly");
    const store = transaction.objectStore("users");

    const request = store.getAll();

    request.onsuccess = function(event) {
      resolve(event.target.result[0]);
    };

    request.onerror = function(event) {
      console.error("사용자를 가져오는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}


// 사용자 업데이트 함수
function updateIndexedDbUser(id, name, email) {
  const transaction = INDEXED_DB.transaction(["users"], "readwrite");
  const store = transaction.objectStore("users");

  const request = store.put({ id, name, email });

  request.onsuccess = function() {
    console.log("사용자가 업데이트되었습니다.");
  };

  request.onerror = function(event) {
    console.error("사용자를 업데이트하는 중에 오류가 발생했습니다.: ", event.target.errorCode);
  };
}

// 사용자 삭제 함수
function deleteIndexedDbUser(id) {
  const transaction = INDEXED_DB.transaction(["users"], "readwrite");
  const store = transaction.objectStore("users");

  const request = store.delete(id);

  request.onsuccess = function() {
    console.log("사용자가 삭제되었습니다.");
  };

  request.onerror = function(event) {
    console.error("사용자를 삭제하는 중에 오류가 발생했습니다.: ", event.target.errorCode);
  };
}

// 단어장 추가 함수
function addIndexedDbNotebook(name, color, createdAt, updatedAt, status) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["notebooks"], "readwrite");
    const store = transaction.objectStore("notebooks");

    const request = store.add({ name, color, createdAt, updatedAt, status });

    request.onsuccess = function() {
      const newId = request.result; 
      console.log("단어장이 추가되었습니다. 새 ID:", newId);
      resolve(newId);
    };

    request.onerror = function(event) {
      console.error("단어장을 추가하는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}
// 단어장 조회 함수
function getIndexedDbNotebooks() {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["notebooks"], "readonly");
    const store = transaction.objectStore("notebooks");
    const request = store.getAll();
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    request.onerror = function(event) {
      console.error("단어장을 가져오는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}
// 특정 id의 단어장 조회 함수
function getIndexedDbNotebookById(id) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["notebooks"], "readonly");
    const store = transaction.objectStore("notebooks");

    const request = store.get(id);

    request.onsuccess = function(event) {
      if (event.target.result) {
        resolve(event.target.result);
      } else {
        reject(`No notebook found with id: ${id}`);
      }
    };

    request.onerror = function(event) {
      console.error(`단어장을 가져오는 중에 오류가 발생했습니다.: ${event.target.errorCode}`);
      reject(event.target.errorCode);
    };
  });
}
// 단어장 업데이트 함수
function updateIndexedDbNotebook(id, name, color, updatedAt, status) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["notebooks"], "readwrite");
    const store = transaction.objectStore("notebooks");

    const request = store.put({ id, name, color, updatedAt, status });

    request.onsuccess = function() {
      console.log("단어장이 업데이트되었습니다.");
      resolve();
    };

    request.onerror = function(event) {
      console.error("단어장을 업데이트하는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

async function deleteIndexedDbNotebook(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const words = await getIndexedDbWordsByNotebookId(id);
      for (const word of words) {
        await deleteIndexedDbWord(word.id);
      }
      const transaction = INDEXED_DB.transaction(["notebooks"], "readwrite");
      const store = transaction.objectStore("notebooks");
      const request = store.delete(id);
      request.onsuccess = function () {
        console.log("단어장이 삭제되었습니다.");
        resolve(); // 단어장 삭제 성공 시 resolve
      };
      request.onerror = function (event) {
        console.error("단어장을 삭제하는 중에 오류가 발생했습니다.:", event.target.errorCode);
        reject(event.target.errorCode); // 단어장 삭제 오류 시 reject
      };
    } catch (error) {
      console.error("단어 또는 단어장을 삭제하는 중 오류가 발생했습니다.", error);
      reject(error); // 비동기 작업에서 발생한 오류 처리
    }
  });
}

// 단어 추가 함수
function addIndexedDbWord(notebookId, word, meaning, example, description, createdAt, updatedAt, status) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["words"], "readwrite");
    const store = transaction.objectStore("words");

    const request = store.add({ notebookId, word, meaning, example, description, createdAt, updatedAt, status });

    request.onsuccess = function() {
      console.log("단어가 성공적으로 추가되었습니다");
      resolve();
    };

    request.onerror = function(event) {
      console.error("단어를 추가하는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}
// 단어 조회 함수
function getIndexedDbWordsByNotebookId(notebookId) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["words"], "readonly");
    const store = transaction.objectStore("words");
    const index = store.index("notebookId");

    const request = index.getAll(notebookId);

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      console.error("단어를 가져오는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}
// 특정 ID의 단어 조회 함수
function getIndexedDbWordById(id) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["words"], "readonly");
    const store = transaction.objectStore("words");

    const request = store.get(id);

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      console.error("단어를 가져오는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

// 단어 업데이트 함수
function updateIndexedDbWord(id, updatedData) {
  // id, notebookId, word, meaning, example, description, updatedAt, status
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["words"], "readwrite");
    const store = transaction.objectStore("words");

    const getRequest = store.get(id);

    getRequest.onsuccess = function(event) {
      const wordData = event.target.result;
      if (!wordData) {
        reject(`ID ${id}에 해당하는 단어를 찾을 수 없습니다.`);
        return;
      }

      // 업데이트할 데이터만 갱신
      for (const key in updatedData) {
        console.log("KEY",key)
        if (updatedData.hasOwnProperty(key)) {
          console.log("hasOwnProperty,",updatedData[key])
          wordData[key] = updatedData[key];
        }
      }

      const updateRequest = store.put(wordData);

      updateRequest.onsuccess = function() {
        console.log("단어가 성공적으로 업데이트되었습니다.");
        resolve();
      };

      updateRequest.onerror = function(event) {
        console.error("단어를 업데이트하는 중에 오류가 발생했습니다.:", event.target.errorCode);
        reject(event.target.errorCode);
      };
    };

    getRequest.onerror = function(event) {
      console.error("단어를 가져오는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

// 단어 삭제 함수
function deleteIndexedDbWord(id) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["words"], "readwrite");
    const store = transaction.objectStore("words");

    const request = store.delete(id);

    request.onsuccess = function() {
      console.log("단어가 성공적으로 삭제되었습니다.");
      resolve();
    };

    request.onerror = function(event) {
      console.error("단어 삭제 오류: ", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

// 최근 학습 조회
function getRecentLearningData(key) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["recentLearning"], "readonly");
    const store = transaction.objectStore("recentLearning");

    const request = store.get(key);

    request.onsuccess = function(event) {
      if (event.target.result !== undefined) {
        resolve(event.target.result);
      } else {
        reject("데이터가 없습니다.");
      }
    };

    request.onerror = function(event) {
      console.error("데이터를 가져오는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

// 최근 학습 추가 
function addRecentLearningData(key, value) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["recentLearning"], "readwrite");
    const store = transaction.objectStore("recentLearning");

    const request = store.put(value, key);

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      console.error("데이터를 추가하는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

// 최근 학습 수정
function updateRecentLearningData(key, value) {
  console.log(key, value)
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["recentLearning"], "readwrite");
    const store = transaction.objectStore("recentLearning");

    const request = store.put(value, key);

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      console.error("데이터를 수정하는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

// 최근 학습 삭제
function deleteRecentLearningData(key) {
  return new Promise((resolve, reject) => {
    const transaction = INDEXED_DB.transaction(["recentLearning"], "readwrite");
    const store = transaction.objectStore("recentLearning");

    const request = store.delete(key);

    request.onsuccess = function(event) {
      resolve();
    };

    request.onerror = function(event) {
      console.error("데이터를 삭제하는 중에 오류가 발생했습니다.:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}


// IndexedDB 데이터베이스 삭제 함수
function deleteDatabase(dbName) {
  const request = indexedDB.deleteDatabase(dbName);

  request.onsuccess = () => {
    console.log(`Database ${dbName} deleted successfully`);
  };

  request.onerror = (event) => {
    console.error(`Error deleting database ${dbName}:`, event.target.error);
  };

  request.onblocked = () => {
    console.log(`Delete blocked for database ${dbName}`);
  };
}