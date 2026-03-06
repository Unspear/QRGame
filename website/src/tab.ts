export class MyTabElement extends HTMLElement {
    currentTab: string;
    updateListeners: ((currentTab: string) => void)[];
    constructor() {
      super();
      this.currentTab = "";
      this.updateListeners = []
      const headers = Array.from(this.querySelectorAll(`div[tabHeader]`)).filter(el => el.closest('my-tab') === this) as HTMLElement[];
      const contents = Array.from(this.querySelectorAll(`div[tabContent]`)).filter(el => el.closest('my-tab') === this) as HTMLElement[];
      let that = this;
      function selectTab(header: HTMLElement) {
        let tabId = header.getAttribute("tabHeader");
        if (!tabId) return;
        that.currentTab = tabId;
        headers.forEach(header => {
          header.toggleAttribute("selected", header.getAttribute("tabHeader") === tabId);
        });
        contents.forEach(content => {
          let visible = (content.getAttribute("tabContent") === tabId);
          content.classList.toggle("hidden", !visible);
        });
        for (let listener of that.updateListeners) {
          listener(that.currentTab);
        }
      }

      // Add change event listeners to all headers
      headers.forEach(header => {
        header.addEventListener('click', function() {
          selectTab(this);
        });
      });

      selectTab(headers[0]);
    }

  }
customElements.define('my-tab', MyTabElement);
