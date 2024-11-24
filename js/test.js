// 이어 학습 알림 모달
const createContinueLearningModal = () => {
  const modal = openDefaultModal();
  modal.container.classList.add('confirm');
  // modal.container.dataset.id = ID;
  modal.middle.innerHTML = `
    <h3>이어 학습을 진행할까요?</h3>
    <span>시작하려면 이어하기 버튼을 눌러주세요! ✨</span>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "이어하기", fun: `onclick="clickContinueLearningModalBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}
// 이어하기 알림 모달에서 이어하기 버튼 클릭 시
const clickContinueLearningModalBtn = async (event) => {
  const recentStudy = await getRecentStudy();
  window.location.href=`/html/${recentStudy.type.toLowerCase()}_test.html?${recentStudy.url_params}`;
};

const init = async () => {
  const index_status = await waitSqliteOpen();
  if(index_status == "on"){
    const recentStudy = await getRecentStudy();
    if(recentStudy && recentStudy.state == 0) { // 학습 중인 데이터가 있음
      createContinueLearningModal();
    }
  }
  if(index_status == "err"){
    alert("데이터 호출 err")
  }
}
init();