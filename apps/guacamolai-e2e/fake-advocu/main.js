import { ActivityForm } from './activity-form';

function main() {
  const mainEl = document.querySelector('main');

  document.querySelector('#add-activity-btn').addEventListener('click', () => {
    mainEl.innerHTML = '<advocu-activity-form/>';
  });

  customElements.define('advocu-activity-form', ActivityForm);
}

main();
