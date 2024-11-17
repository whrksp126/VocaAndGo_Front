// 단어장 추가 버튼 클릭 시
const clickAddVocabularyBook = (event, data={name:"", color:"#FF8DD4"}) => {
  const modal = openDefaultModal();
  modal.top.innerHTML = modalTopHtml(`단어장 추가`);
  modal.middle.innerHTML = setVocabularyBookHtml(data)
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: `onclick="clickSaveVocabulary(event, setVocabularyListHtml)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
  addEventClickColor();
};

const getDailyQuote = async () => {
  try{
    const url = 'https://vocaandgo.ghmate.com/mainpage/'
    const method = 'GET';
    const fetchData = {};
    const result = await fetchDataAsync(url, method, fetchData);
    if(result.code != 200) return document.querySelector('main .daily_quote_container').remove();
    const _dailyQuoteOrigin = document.querySelector('main .daily_quote_container .daily_quote .content .origin');
    const _dailyQuoteMeaning = document.querySelector('main .daily_quote_container .daily_quote .content .meaning');
    _dailyQuoteOrigin.innerHTML = result.data.sentence
    _dailyQuoteMeaning.innerHTML = result.data.meaning
  }catch{
    document.querySelector('main .daily_quote_container').remove();
  }
}
getDailyQuote();
// const init = async () => {
//   const notebooks = await getIndexedDbNotebooks();
//   for(const notebook of notebooks){
//     notebook.words = await getIndexedDbWordsByNotebookId(notebook.id);
//   }
//   console.log('notebooks,',JSON.stringify(notebooks))
// }
// init()


















const setUserNameHtml = async () => {
  const _name = document.querySelector('header .container h2 strong');
  // const user_data = await getIndexedDbUsers();
  const user_data = JSON.parse(localStorage.getItem('user'));
  if(!user_data){
    localStorage.setItem('user', JSON.stringify({
      token: null,
      email: "구글 로그인이 필요합니다.",
      name: "비회원",
      state: "login"
    }))
  }
  console.log('user_data,',user_data)
  _name.innerHTML = `${user_data.name}`;
}
// 단어장 리스트 만들기
const setVocabularyList = async () => {
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = ``;
  const html = await setVocabularyListHtml();
  _ul.innerHTML = html;
}
// 단어장 클릭 시
const clickVocabularyItem = (event, id) => {
  window.location.href=`/html/vocabulary.html?vocabulary_id=${id}`
}
const setInitHtml = async () => {
  // const index_status = await waitIndexDbOpen();
  const index_status = await waitSqliteOpen();
  if(index_status == "on"){
    setUserNameHtml();
    await setVocabularyList();
  }
  if(index_status == "err"){
    alert("데이터 호출 err")
  }
}
setInitHtml();

