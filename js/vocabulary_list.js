// 단어장 추가 버튼 클릭 시
const clickAddVocabularyBook = (event, data={name:"", color:"FF8DD4"}) => {
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
  const noteBooks = await getIndexedDbNotebooks();
  if(noteBooks.length > 0){
    const html = await setVocabularyListHtml(noteBooks);
    _ul.innerHTML = html;
  }else{
    console.log('단어장 추가 유도 UI');
  }
}
// 단어장 클릭 시
const clickVocabularyItem = (event, id) => {
  window.location.href=`/html/vocabulary.html?vocabulary_id=${id}`
}
const setInitHtml = () => {
  setUserNameHtml();
  setVocabularyList();
}
setInitHtml();