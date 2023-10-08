export default class optionActionComponent {
  _generateMarkup(markupComponentMarkup) {
    return `
      <div class="filter-input-option-option">
          <div class="filter-option-option">
            ${markupComponentMarkup}
          </div>
      </div>
    `;
  }
}
