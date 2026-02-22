export class Router {
  private onChange: (view: string) => void;

  constructor(onChange: (view: string) => void) {
    this.onChange = onChange;
    window.addEventListener('hashchange', () => this.handle());
    this.handle(); 
  }

  private handle() {
    let hash = location.hash;

    if (hash.startsWith('#/')) {
      hash = hash.substring(2);
    } else if (hash.startsWith('#')) {
      hash = hash.substring(1);
    }

    if (!hash || hash === '') {
      hash = 'home';
    }

    this.onChange(hash);
  }

  navigate(view: string) {
    location.hash = view;
  }
}