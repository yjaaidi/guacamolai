import { fromEvent, Subscription } from 'rxjs';

export class ActivityForm extends HTMLElement {
  #sub = new Subscription();

  connectedCallback() {
    this.innerHTML = `
      <style>
        fieldset {
          display: flex;
          flex-direction: column;
          align-items: start;

          label {
            margin-top: 1rem;
          }
        }

        p {
          min-height: 100px;
          width: 100%;
        }

        .checked {
          font-weight: bold;
        }
      </style>
      <fieldset>
        <legend>Activity Form</legend>
        <label for="#/properties/title">Title</label>
        <input type="text" id="#/properties/title" />

        <label for="#/properties/description">Description</label>
        <quill-editor id="#/properties/description" data-testid="description">
          <p></p>
        </quill-editor>

        <label for="#/properties/metrics/properties/attendees">Attendees</label>
        <nz-input-number id="#/properties/metrics/properties/attendees">
          <input type="number" min="1" step="1" inputmode="decimal" />
        </nz-input-number>

        <label for="#/properties/onlineEvent">Online</label>
        <nz-radio-group id="#/properties/onlineEvent">
          <span data-testid="online-yes">Yes</span>
          <span data-testid="online-no">No</span>
        </nz-radio-group>

        <label for="#/properties/country">Country</label>
        <nz-select id="#/properties/country">
          <input type="text" />
        </nz-select>

        <label for="#/properties/city">City</label>
        <input type="text" id="#/properties/city" />

        <label for="#/properties/activityDate">Date</label>
        <nz-date-picker id="#/properties/activityDate">
          <input type="text" size="12" />
        </nz-date-picker>

        <label for="#/properties/activityUrl">URL</label>
        <input type="text" id="#/properties/activityUrl" />
    
        <div class="steps-action">
          <button>NEXT</button>
        </div>
      </fieldset>
    `;

    this.#initOnline();
  }

  disconnectedCallback() {
    this.#sub.unsubscribe();
  }

  #initOnline() {
    const spanEls = Array.from(
      this.querySelectorAll('#\\#\\/properties\\/onlineEvent span')
    );
    const yesEl = spanEls.find((el) => el.textContent === 'Yes');
    const noEl = spanEls.find((el) => el.textContent === 'No');
    const setOnline = (online) => {
      yesEl.classList.toggle('checked', online);
      noEl.classList.toggle('checked', !online);
    };
    this.#sub.add(fromEvent(yesEl, 'click').subscribe(() => setOnline(true)));
    this.#sub.add(fromEvent(noEl, 'click').subscribe(() => setOnline(false)));
  }
}
