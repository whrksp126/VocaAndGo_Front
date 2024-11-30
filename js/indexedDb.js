let SQLITE_DB; // sql.js 데이터베이스 인스턴스
const SQLITE_NAME = "heyvoca_sqlite";
const SQLITE_KEY = "sqlite_db";
let SQLITE_VERSION = 1;
let SQLITE_STATUS = "off";
let TABLE_MODELS = null;

// 인덱스 DB 호출 대기
const waitSqliteOpen = async () => {
  if(getDevicePlatform() == "app"){
    return await getSqliteStatus();
  }else{
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (["on", "err"].includes(SQLITE_STATUS)) {
          clearInterval(intervalId);
          resolve(SQLITE_STATUS);
        }
      }, 10);
    });
  }
};

// IndexedDB에서 SQLite DB를 로드
async function loadDB() {
  if(getDevicePlatform() == "app"){

  }else{
    const response = await fetch('../json/sqlite_model.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }

    const result = await response.json(); 
    SQLITE_VERSION = result.version; 
    TABLE_MODELS = result.table_models
    const request = indexedDB.open(SQLITE_NAME, SQLITE_VERSION);
  
    return new Promise((resolve, reject) => {
      request.onsuccess = async (event) => {
        const dbInstance = event.target.result;
        const transaction = dbInstance.transaction(SQLITE_KEY, "readonly");
        const store = transaction.objectStore(SQLITE_KEY);
        const getRequest = store.get(SQLITE_KEY);
  
        getRequest.onsuccess = async () => {
          if (getRequest.result) {
            SQLITE_DB = new SQL.Database(getRequest.result);
            console.log("SQLite 데이터베이스가 로드되었습니다.");
            await syncDatabase(); // 데이터베이스 동기화
          } else {
            console.warn("저장된 데이터가 없습니다. DB를 초기화합니다.");
            await initDB();
          }
          SQLITE_STATUS = "on";
          resolve();
        };
  
        getRequest.onerror = (e) => {
          console.error("IndexedDB 데이터 조회 중 오류:", e);
          reject(e);
        };
      };
  
      request.onupgradeneeded = (event) => {
        const dbInstance = event.target.result;
        dbInstance.createObjectStore(SQLITE_KEY);
      };
  
      request.onerror = (e) => {
        SQLITE_STATUS = "err";
        console.error("IndexedDB 열기 중 오류:", e);
        reject(e);
      };
    });
  }
}

// 초기 DB 세팅
async function initDB() {
  if(getDevicePlatform() == "app"){

  }else{
    SQLITE_DB = new SQL.Database();
  
    // 외래 키 활성화
    enableForeignKeys();
  
    // 최신 테이블 생성
    await syncDatabase();
  
    // 변경 내용을 IndexedDB에 저장
    await saveDB();
  }
}

// 외래 키 활성화
function enableForeignKeys() {
  if(getDevicePlatform() == "app"){

  }else{
    SQLITE_DB.exec("PRAGMA foreign_keys = ON;");
  }
}

// 데이터베이스 동기화
async function syncDatabase() {
  if(getDevicePlatform() == "app"){

  }else{
    const tableModels = getTableModels();
    const existingTables = getExistingTables();
  
    // 테이블 삭제
    const tablesToDelete = getTablesToDelete(existingTables, tableModels);
    deleteTables(tablesToDelete);
  
    // 테이블 생성 및 동기화
    for (const table of tableModels) {
      const tableExists = existingTables.includes(table.name);
      if (!tableExists) {
        createTable(table);
      } else {
        await syncTableWithModel(table);
      }
    }
  }
}



// 최신 테이블 모델 반환
function getTableModels() {
  if(getDevicePlatform() == "app"){

  }else{
    return TABLE_MODELS;

  }
}

// 현재 데이터베이스의 테이블 목록 가져오기
function getExistingTables() {
  if(getDevicePlatform() == "app"){

  }else{
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`;
    const result = SQLITE_DB.exec(query);
    return result[0]?.values.map((row) => row[0]) || [];
  }
}

// 삭제해야 할 테이블 목록 반환
function getTablesToDelete(existingTables, tableModels) {
  if(getDevicePlatform() == "app"){

  }else{
    const modelTableNames = tableModels.map((table) => table.name);
    return existingTables.filter((tableName) => !modelTableNames.includes(tableName));
  }
}

// 테이블 삭제
function deleteTables(tablesToDelete) {
  if(getDevicePlatform() == "app"){

  }else{
    for (const tableName of tablesToDelete) {
      dropTable(tableName);
    }
  }
}

// 테이블 삭제 쿼리 실행
function dropTable(tableName) {
  if(getDevicePlatform() == "app"){

  }else{
    const query = `DROP TABLE IF EXISTS ${tableName};`;
    SQLITE_DB.exec(query);
    console.log(`${tableName} 테이블이 삭제되었습니다.`);
  }
}

// 테이블 생성
function createTable(table) {
  if(getDevicePlatform() == "app"){

  }else{
    const columnDefinitions = table.columns
      .map((column) => `${column.name} ${column.type}`)
      .join(", ");
    const createTableQuery = `CREATE TABLE ${table.name} (${columnDefinitions});`;
    SQLITE_DB.exec(createTableQuery);
    console.log(`${table.name} 테이블이 생성되었습니다.`);
  }
}

// 테이블과 모델 동기화
async function syncTableWithModel(table) {
  if(getDevicePlatform() == "app"){

  }else{
    const query = `PRAGMA table_info(${table.name});`;
    const result = SQLITE_DB.exec(query);
  
    const existingColumns = result[0].values.map((row) => row[1]); // 현재 테이블의 컬럼 이름 목록
    const modelColumns = table.columns.map((col) => col.name); // 모델에서 정의된 컬럼 이름 목록
  
    // 컬럼 비교: 순서 및 누락 확인
    const columnsMatch = JSON.stringify(existingColumns) === JSON.stringify(modelColumns);
  
    if (!columnsMatch) {
      console.log(`컬럼 순서 불일치 또는 누락된 컬럼이 있습니다. ${table.name} 테이블을 재구성합니다.`);
      await recreateTableWithCorrectColumns(table);
    } else {
      console.log(`${table.name} 테이블은 최신 상태입니다.`);
    }
  }
}

// 테이블 재구성 함수: 컬럼 순서 최신화 및 데이터 유지
async function recreateTableWithCorrectColumns(table) {
  if(getDevicePlatform() == "app"){

  }else{
    const tempTableName = `${table.name}_temp`;
    const modelColumnNames = table.columns.map((col) => col.name).join(", ");
  
    // 임시 테이블 생성: 모델 순서대로 데이터 복사
    const createTempTableQuery = `
      CREATE TABLE ${tempTableName} AS SELECT ${modelColumnNames} FROM ${table.name};
    `;
    SQLITE_DB.exec(createTempTableQuery);
    console.log(`${tempTableName} 임시 테이블이 생성되었습니다.`);
  
    // 기존 테이블 삭제
    dropTable(table.name);
  
    // 새 테이블 생성
    createTable(table);
  
    // 임시 테이블의 데이터 복사
    const copyDataQuery = `
      INSERT INTO ${table.name} (${modelColumnNames}) 
      SELECT ${modelColumnNames} FROM ${tempTableName};
    `;
    SQLITE_DB.exec(copyDataQuery);
    console.log(`임시 테이블 데이터를 ${table.name} 테이블로 복사했습니다.`);
  
    // 임시 테이블 삭제
    dropTable(tempTableName);
  }
}

// IndexedDB에 SQLite DB 저장
async function saveDB() {
  if(getDevicePlatform() == "app"){

  }else{
    const dbData = SQLITE_DB.export();
    const request = indexedDB.open(SQLITE_NAME, SQLITE_VERSION);
  
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const dbInstance = event.target.result;
        const transaction = dbInstance.transaction(SQLITE_KEY, "readwrite");
        const store = transaction.objectStore(SQLITE_KEY);
        store.put(dbData, SQLITE_KEY);
  
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
      };
  
      request.onerror = reject;
    });
    
  }
}


// Wordbook 데이터 추가
async function addWordbook(name, color, status = 0) {
  const insertQuery = `INSERT INTO Wordbook (name, color, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`;
  const currentTime = new Date().toISOString();
  const colorJson = JSON.stringify(color);
  const paramse  = [name, colorJson, status, currentTime, currentTime]
  if(getDevicePlatform() == "app"){
    const result = await setSqliteQuery(insertQuery, paramse);
    return await getWordbook(result.insertId);
  }else{
    try {
      SQLITE_DB.run(insertQuery, paramse);
      const result = SQLITE_DB.exec("SELECT last_insert_rowid() AS id");
      const id = result[0].values[0][0];
      await saveDB();
      return await getWordbook(id);
    } catch (error) {
      console.error("Wordbook 추가 중 오류 발생:", error.message);
      throw new Error("Wordbook을 추가하는 데 실패했습니다.");
    }
  }
}


// Wordbook 데이터 수정
async function updateWordbook(id, name, color, status) {
  const currentTime = new Date().toISOString();
  const colorJson = JSON.stringify(color);
  const updateQuery = `
    UPDATE Wordbook
    SET name = ?, color = ?, status = ?, updatedAt = ?
    WHERE id = ?
  `;
  const paramse = [name, colorJson, status, currentTime, id]
  if(getDevicePlatform() == "app"){
    await setSqliteQuery(updateQuery, paramse);
    return await getWordbook(id);
  }else{
    try {
      SQLITE_DB.run(updateQuery, paramse);
      await saveDB();
      return await getWordbook(id);
    } catch (error) {
      console.error("Wordbook 수정 중 오류 발생:", error.message);
      throw new Error("Wordbook을 수정하는 데 실패했습니다.");
    }
  }
}


// Wordbook 데이터 삭제
async function deleteWordbook(id) {
  const deleteQuery = "DELETE FROM Wordbook WHERE id = ?";
  if(getDevicePlatform() == "app"){
    await setSqliteQuery(deleteQuery, [id])
  }else{
    SQLITE_DB.run(deleteQuery, [id]);
    await saveDB();
  }
}

// Wordbook 데이터 조회
async function getWordbook(id = null) {
  let selectQuery;
  let params = [];
  if (id) {
    // 특정 단어장 조회
    selectQuery = "SELECT * FROM Wordbook WHERE id = ?";
    params = [id];
  } else {
    // 전체 단어장 조회
    selectQuery = "SELECT * FROM Wordbook";
  }
  if(getDevicePlatform() == "app"){
    const result = await setSqliteQuery(selectQuery, params)
    alert(JSON.stringify(result))
    if (result?.length > 0) {
      const data = result.map(({ id, name, color, status, createdAt, updatedAt }) => ({
        id,
        name,
        color: color ? JSON.parse(color) : {},
        status,
        createdAt,
        updatedAt,
      }));
      return id ? data[0] : data;
    }
    return id ? null : [];
  }else{
    const result = SQLITE_DB.exec(selectQuery, params);
    if (result.length > 0) {
      const data = result[0].values.map(([id, name, color, status, createdAt, updatedAt]) => ({
        id,
        name,
        color : color ? JSON.parse(color) : {},
        status,
        createdAt,
        updatedAt,
      }));
      return id ? data[0] : data;
    }
    return id ? null : [];
  }
}


// Word 데이터 추가
async function addWord(wordbookId, origin, meaning = [], example = [], description = "", status = 0) {
  const insertQuery = `
    INSERT INTO Word (wordbook_id, origin, meaning, example, description, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const currentTime = new Date().toISOString();
    const meaningJson = JSON.stringify(meaning);
    const exampleJson = JSON.stringify(example);
    const params = [wordbookId, origin, meaningJson, exampleJson, description, status, currentTime, currentTime]
  if(getDevicePlatform() == "app"){
    const result = await setSqliteQuery(insertQuery, params)
    return await getWord(result.insertId);
  }else{
    try {
      SQLITE_DB.run(insertQuery, params);
      const result = SQLITE_DB.exec("SELECT last_insert_rowid() AS id");
      const id = result[0].values[0][0];
      await saveDB();
      return await getWord(id);
    } catch (error) {
      console.error("단어 추가 실패:", error.message);
      throw new Error("단어를 추가하는 데 실패했습니다.");
    }
  }
}
// Word 데이터 수정
async function updateWord(id, updates = {}) {
  const currentTime = new Date().toISOString();
  const existingWord = await getWord(id);
  if (!existingWord) {
    throw new Error(`ID가 ${id}인 단어를 찾을 수 없습니다.`);
  }
  const updatedWord = {
    ...existingWord,
    ...updates, 
    updatedAt: currentTime, 
  };
  const meaningJson = JSON.stringify(updatedWord.meaning);
  const exampleJson = JSON.stringify(updatedWord.example);
  const updateQuery = `
    UPDATE Word
    SET wordbook_id = ?, origin = ?, meaning = ?, example = ?, description = ?, status = ?, updatedAt = ?
    WHERE id = ?
  `;
  const params = [ updatedWord.wordbookId, updatedWord.origin, meaningJson, exampleJson, updatedWord.description, updatedWord.status, updatedWord.updatedAt, id,]
  if(getDevicePlatform() == "app"){
    await setSqliteQuery(updateQuery, params)
    return await getWord(id);
  }else{
    try {
      SQLITE_DB.run(updateQuery, params);
      await saveDB();
      return await getWord(id);
    } catch (error) {
      console.error("단어 수정 실패:", error.message);
      throw new Error("단어를 수정하는 데 실패했습니다.");
    }
  }
}

// Word 데이터 삭제
async function deleteWord(id) {
  const deleteQuery = "DELETE FROM Word WHERE id = ?";
  const params = [id]
  if(getDevicePlatform() == "app"){
    await setSqliteQuery(deleteQuery, params)
  }else{
    SQLITE_DB.run(deleteQuery, params);
    await saveDB();
  }
}
// 특정 Wordbook에 속한 Word 조회 (wordbookId가 없으면 전체 조회)
async function getWordsByWordbook(wordbookId = null) {
  let selectQuery;
  let params = [];

  if (wordbookId) {
    // 특정 단어장의 단어 조회
    selectQuery = "SELECT * FROM Word WHERE wordbook_id = ?";
    params = [wordbookId];
  } else {
    // 전체 단어 조회
    selectQuery = "SELECT * FROM Word";
  }
  if(getDevicePlatform() == "app"){
    const result = await setSqliteQuery(selectQuery, params);
    if (result?.rows?.length > 0) {
      return  result.rows._array.map(({ id, wordbook_id, origin, meaning, example, description, status, createdAt, updatedAt }) => ({
        id,
        wordbookId: wordbook_id,
        word: origin,
        meaning: meaning ? JSON.parse(meaning) : [], 
        example: example ? JSON.parse(example) : [], 
        description,
        status,
        createdAt,
        updatedAt,
      }));
    }
    return [];
  }else{
  
    const result = SQLITE_DB.exec(selectQuery, params);
    if (result.length > 0) {
      return result[0].values.map(([id, wordbook_id, origin, meaning, example, description, status, createdAt, updatedAt]) => ({
        id,
        wordbookId: wordbook_id,
        word: origin,
        meaning: meaning ? JSON.parse(meaning) : [], 
        example: example ? JSON.parse(example) : [], 
        description,
        status,
        createdAt,
        updatedAt,
      }));
    }
    return [];
  }
};

// 단일 Word 데이터 조회
async function getWord(id) {
  const selectQuery = `SELECT * FROM Word WHERE id = ?`;
  const params = [id];

  const formatResult = (row) => {
    const { id, wordbook_id, origin, meaning, example, description, status, createdAt, updatedAt } = row;
    return {
      id,
      wordbookId: wordbook_id,
      origin,
      meaning: meaning ? JSON.parse(meaning) : null,
      example: example ? JSON.parse(example) : null,
      description,
      status,
      createdAt,
      updatedAt,
    };
  };

  if (getDevicePlatform() === "app") {
    const result = await setSqliteQuery(selectQuery, params);
    if (result?.rows?.length > 0) {
      return formatResult(result.rows._array[0]);
    } else {
      console.warn(`ID가 ${id}인 단어를 찾을 수 없습니다.`);
      return null;
    }
  } else {
    try {
      const result = SQLITE_DB.exec(selectQuery, params);
      if (result.length > 0) {
        const [word_id, wordbook_id, origin, meaning, example, description, status, createdAt, updatedAt] = result[0].values[0];
        return formatResult({
          id: word_id,
          wordbook_id,
          origin,
          meaning,
          example,
          description,
          status,
          createdAt,
          updatedAt,
        });
      } else {
        console.warn(`ID가 ${id}인 단어를 찾을 수 없습니다.`);
        return null;
      }
    } catch (error) {
      console.error("단어 조회 중 오류 발생:", error.message);
      throw new Error("단어 조회에 실패했습니다.");
    }
  }
}

// Wordbook 데이터 삭제 (연관 Word 데이터도 삭제)
async function deleteWordbookWithWords(id) {
  const deleteWordbookQuery = "DELETE FROM Wordbook WHERE id = ?";
  const deleteWordsQuery = "DELETE FROM Word WHERE wordbook_id = ?";
  const params = [id];
  if(getDevicePlatform() == "app"){
    await setSqliteQuery(deleteWordbookQuery, params);
    setSqliteQuery(deleteWordsQuery, params)
  }else{
    SQLITE_DB.run(deleteWordbookQuery, params);
    SQLITE_DB.run(deleteWordsQuery,params);
    await saveDB();
  }
}

// 최근 학습 기록 생성
async function createRecentStudy(type, state, urlParams, testList) {
  const currentTime = new Date().toISOString();
  const insertQuery = `
    INSERT INTO RecentStudy (type, state, url_params, test_list, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?);
  `;
  const params = [ type, state, urlParams, JSON.stringify(testList), currentTime, currentTime ]
  if(getDevicePlatform() == "app"){
    await setSqliteQuery(insertQuery, params);
    return await getRecentStudy();
  }else{
    try {
      SQLITE_DB.run(insertQuery, params);
      console.log("RecentStudy 데이터가 성공적으로 추가되었습니다.");
      await saveDB(); // 변경 내용을 IndexedDB에 저장
      console.log("SAVE_DB 성공")
      return await getRecentStudy();
    } catch (error) {
      console.error("RecentStudy 데이터 생성 중 오류:", error.message);
      throw new Error("RecentStudy 데이터를 생성하는 데 실패했습니다.");
    }
  }
}

// 최근 학습 기록 수정
async function updateRecentStudy(id, updates) {
  const currentTime = new Date().toISOString();

  // 기존 데이터 조회
  const existingData = await getRecentStudy(id);
  if (!existingData) {
    throw new Error(`ID가 ${id}인 데이터를 찾을 수 없습니다.`);
  }

  // 업데이트 데이터 병합
  const updatedData = {
    ...existingData,
    ...updates,
    updatedAt: currentTime,
  };

  const updateQuery = `
    UPDATE RecentStudy
    SET type = ?, state = ?, url_params = ?, test_list = ?, updatedAt = ?
    WHERE id = ?;
  `;
  const params = [updatedData.type,updatedData.state,updatedData.url_params,JSON.stringify(updatedData.test_list), updatedData.updatedAt,id,]
  if(getDevicePlatform() == "app"){
    await setSqliteQuery(updateQuery, params)
  }else{
    try {
      SQLITE_DB.run(updateQuery, params);
      await saveDB(); 
      return getRecentStudy()
    } catch (error) {
      console.error("RecentStudy 데이터 수정 중 오류:", error.message);
      throw new Error("RecentStudy 데이터를 수정하는 데 실패했습니다.");
    }
  }
}
// 최신 학습 기록 조회
async function getRecentStudy(id = null) {
  let selectQuery;
  let params = [];

  if (id) {
    // 특정 ID로 데이터 조회
    selectQuery = `SELECT * FROM RecentStudy WHERE id = ?;`;
    params = [id];
  } else {
    // 최신 데이터 조회
    selectQuery = `
      SELECT * FROM RecentStudy
      ORDER BY updatedAt DESC
      LIMIT 1;
    `;
  }

  const formatResult = (row) => {
    const { id, type, state, url_params, test_list, createdAt, updatedAt } = row;
    return {
      id,
      type,
      state,
      url_params,
      test_list: test_list ? JSON.parse(test_list) : null, // JSON 데이터 복원
      createdAt,
      updatedAt,
    };
  };

  if (getDevicePlatform() === "app") {
    const result = await setSqliteQuery(selectQuery, params);
    if (result?.rows?.length > 0) {
      return formatResult(result.rows._array[0]);
    } else {
      console.warn(`데이터를 찾을 수 없습니다.`);
      return null;
    }
  } else {
    try {
      const result = SQLITE_DB.exec(selectQuery, params);
      if (result.length > 0) {
        const [row] = result[0].values;
        const [id, type, state, url_params, test_list, createdAt, updatedAt] = row;
        return formatResult({
          id,
          type,
          state,
          url_params,
          test_list,
          createdAt,
          updatedAt,
        });
      } else {
        console.warn(`데이터를 찾을 수 없습니다.`);
        return null;
      }
    } catch (error) {
      console.error("RecentStudy 데이터 조회 중 오류:", error.message);
      throw new Error("RecentStudy 데이터를 조회하는 데 실패했습니다.");
    }
  }
}
// 최신 학습 기록 전체 조회
async function getAllRecentStudies() {
  const selectQuery = `
    SELECT * FROM RecentStudy;
  `;

  if (getDevicePlatform() === "app") {
    // 앱에서 데이터 조회
    const result = await setSqliteQuery(selectQuery);
    if (result?.rows?.length > 0) {
      return result.rows._array.map(({ id, type, state, url_params, test_list, createdAt, updatedAt }) => ({
        id,
        type,
        state,
        url_params,
        test_list: test_list ? JSON.parse(test_list) : [], // JSON 데이터 복원
        createdAt,
        updatedAt,
      }));
    }
    return [];
  } else {
    try {
      // 웹에서 데이터 조회
      const result = SQLITE_DB.exec(selectQuery);
      if (result.length > 0) {
        return result[0].values.map(([id, type, state, url_params, test_list, createdAt, updatedAt]) => ({
          id,
          type,
          state,
          url_params,
          test_list: test_list ? JSON.parse(test_list) : [], // JSON 데이터 복원
          createdAt,
          updatedAt,
        }));
      }
      return [];
    } catch (error) {
      console.error("RecentStudy 전체 데이터 조회 중 오류:", error.message);
      throw new Error("RecentStudy 데이터를 조회하는 데 실패했습니다.");
    }
  }
}

// 최신 학습 기록 삭제
async function deleteRecentStudy(id) {
  const deleteQuery = `
    DELETE FROM RecentStudy WHERE id = ?;
  `;
  const params = [id];
  if(getDevicePlatform() == "app"){
    await setSqliteQuery(deleteQuery, params);
  }else{
    try {
      SQLITE_DB.run(deleteQuery, params);
      console.log(`ID가 ${id}인 RecentStudy 데이터가 삭제되었습니다.`);
      await saveDB(); // 변경 내용을 IndexedDB에 저장
    } catch (error) {
      console.error("RecentStudy 데이터 삭제 중 오류:", error.message);
      throw new Error("RecentStudy 데이터를 삭제하는 데 실패했습니다.");
    }
  }
}

// 초기 실행
(async () => {
  if(getDevicePlatform() == "app"){

  }else{
    // sql.js 로드
    await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    }).then(SQL => {
      window.SQL = SQL; // 전역에서 사용 가능하도록 설정
    });
    await loadDB();
  }
})();