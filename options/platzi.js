class PlatziReactive {
    // Dependencies
    deps = new Map();

    constructor(options) {
        const self = this;

        // Origin
        this.origin = options.data();

        // Target
        this.$data = new Proxy(this.origin, {
            get(target, name) {
                if (!(Reflect.has(target, name))) {
                    console.warn('La propiedad', name, 'no existe');
                    return '';
                }

                self.track(target, name);
                return Reflect.get(target, name);
            },
            set(target, name, value) {
                Reflect.set(target, name, value);
                self.trigger(name);
            }
        });
    }

    track(target, name) {
        if (!(this.deps.has(name))) {
            const effect = () => {
                document.querySelectorAll(`*[p-text=${name}]`).forEach(e => {
                    this.pText(e, target, name);
                });

                document.querySelectorAll(`*[p-bind='src:${name}']`).forEach(e => {
                    this.pBind(e, target, name, 'src');
                });
            };

            this.deps.set(name, effect);
        }
    }

    trigger(name) {
        const effect = this.deps.get(name);
        effect();
    }

    mount() {
        document.querySelectorAll('*[p-text]').forEach(e => {
            this.pText(e, this.$data, e.getAttribute('p-text'));
        });

        document.querySelectorAll('*[p-model]').forEach(e => {
            const name = e.getAttribute('p-model');
            this.pModel(e, this.$data, name);

            e.addEventListener('input', () => {
                Reflect.set(this.$data, name, e.value);
            });
        });

        document.querySelectorAll('*[p-bind]').forEach(e => {
            const [attr, name] = e.getAttribute('p-bind').match(/(\w+)/g);
            this.pBind(e, this.$data, name, attr);

            e.addEventListener('input', () => {
                Reflect.set(this.$data, name, e.value);
            });
        });
    }

    pText(e, target, name) {
        e.innerText = Reflect.get(target, name);
    }

    pModel(e, target, name) {
        e.value = Reflect.get(target, name);
    }

    pBind(e, target, name, attr) {
        e.setAttribute(attr, Reflect.get(target, name));
    }
}

const Platzi = {
    createApp(options) {
        return new PlatziReactive(options);
    }
};