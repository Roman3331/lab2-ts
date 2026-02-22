export class Router {
    constructor(onChange) {
        this.onChange = onChange;
        window.addEventListener('hashchange', () => this.handle());
        this.handle(); // викликаємо одразу при створенні
    }
    handle() {
        let hash = location.hash;
        // Нормалізуємо хеш: #home → home, #/archive → archive, # → home
        if (hash.startsWith('#/')) {
            hash = hash.substring(2);
        }
        else if (hash.startsWith('#')) {
            hash = hash.substring(1);
        }
        if (!hash || hash === '') {
            hash = 'home';
        }
        this.onChange(hash);
    }
    // Додатковий метод, якщо потрібно програмно перейти
    navigate(view) {
        location.hash = view;
    }
}
