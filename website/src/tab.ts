
customElements.define('my-tabs',
  class extends HTMLElement {
    constructor() {
      super();
      let name = this.getAttribute("name");

      const headers = Array.from(this.querySelectorAll(`div[tabHeader]`)).filter(el => el.closest('my-tabs') === this) as HTMLElement[];
      const contents = Array.from(this.querySelectorAll(`div[tabContent]`)).filter(el => el.closest('my-tabs') === this) as HTMLElement[];
      let that = this;
      function selectTab(header: HTMLElement) {
        let tabId = header.getAttribute("tabHeader");
        if (!tabId) return;
        headers.forEach(header => {
          header.toggleAttribute("selected", header.getAttribute("tabHeader") === tabId);
        });
        contents.forEach(content => {
          let visible = (content.getAttribute("tabContent") === tabId);
          content.classList.toggle("hidden", !visible);
        });
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
);
