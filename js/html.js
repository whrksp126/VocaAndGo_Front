

// footer HTML
const footerHtml = `
  <nav>
    <ul>
      <li class="active">
        <i class="ph-fill ph-notepad"></i>
        <span>단어장</span>
      </li>
      <li>
        <i class="ph-fill ph-notepad"></i>
        <span>테스트</span>
      </li>
      <li>
        <i class="ph-fill ph-user"></i>
        <span>마이페이지</span>
      </li>
    </ul>
  </nav>
`

// 모달 기본 틀
const defaultModalHtml = () => `
  <div class="modal">
    <div class="modal_content">
      <div class="modal_top"></div>
      <div class="modal_middle"></div>
      <div class="modal_bottom"></div>
    </div>
  </div>
`

// 모달 TOP
const modalTopHtml = (title) => {
  return `<h1>${title}</h1>`
}

// 모달 BOTTOM AND
const modalBottomHtml = (btns=null) => {
  return `
    ${btns != null ?`
    <div class="buttons">
      ${btns.map((btn)=>`
      <button class="${btn.class}" ${btn.fun}>${btn.text}</button>
      `).join('')}
    </div>
    `:``}
  `
}