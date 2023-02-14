
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const TOOLENUM = {
        PEN: 'PEN',
        ERASER: 'ERASER',
        FILL: 'FILL',
        PICKER: 'PICKER',
        CIRCLE: 'CIRCLRE',
        RECT: 'RECT',
    };
    class Picture {
        constructor(width, height, scale) {
            this.width = width;
            this.height = height;
            this.scale = scale;
            this.pixels = new Array(height);
            for (let i = 0; i < height; i++)
                this.pixels[i] = new Array(width).fill("#E1E4EA");
        }
        setPixels(pixels) {
            this.pixels = pixels;
        }
        getPixels() {
            let newPixels = new Array(this.height);
            for (let i = 0; i < this.height; i++)
                newPixels[i] = this.pixels[i].slice();
            return newPixels;
        }
        redraw(ctx) {
            for (let j = 0; j < this.height; j++)
                for (let i = 0; i < this.width; i++) {
                    ctx.fillStyle = this.pixels[j][i];
                    ctx.fillRect(i * 10, j * 10, this.scale, this.scale);
                }
        }
        drawPoint(p, color, ctx) {
            this.pixels[p.y][p.x] = color;
            ctx.fillStyle = color;
            ctx.fillRect(p.x * 10, p.y * 10, this.scale, this.scale);
        }
        getColor(p) {
            return this.pixels[p.y][p.x];
        }
        drawPoints(points, color, ctx) {
            ctx.fillStyle = color;
            for (let { x, y } of points) {
                this.pixels[y][x] = color;
                ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
            }
        }
    }

    let pictures = [];
    const config = writable({ color: "#000000", background_color: "#E1E3EA", tool: 'PEN' });
    const picture = writable(new Picture(90, 60, 10));
    const pictureHistory = writable(pictures);

    //DONE
    function elt(type, props, ...children) {
        let dom = document.createElement(type);
        if (props)
            Object.assign(dom, props);
        for (let child of children) {
            if (typeof child != "string")
                dom.appendChild(child);
            else
                dom.appendChild(document.createTextNode(child));
        }
        return dom;
    }
    function getPointerPosition(p, domNode) {
        let rect = domNode.getBoundingClientRect();
        return { x: Math.floor((p.clientX - rect.left) / 10),
            y: Math.floor((p.clientY - rect.top) / 10) };
    }
    function getRadius(x, y) {
        return Math.sqrt(Math.pow(x.x - y.x, 2) + Math.pow(x.y - y.y, 2));
    }
    function getClassName(target) {
        return (target.classList[0]);
    }

    /* src/Compononets/PictureCanvas.svelte generated by Svelte v3.55.1 */
    const file$4 = "src/Compononets/PictureCanvas.svelte";

    function create_fragment$4(ctx) {
    	let canvas_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "id", "canvas");
    			attr_dev(canvas_1, "width", width);
    			attr_dev(canvas_1, "height", height);
    			set_style(canvas_1, "border", "1px solid #000");
    			set_style(canvas_1, "background-color", backgroundColor);
    			add_location(canvas_1, file$4, 129, 0, 4475);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(canvas_1, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(canvas_1, "mousemove", /*mousemove_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const scale = 10;
    const width = 900;
    const height = 600;
    const backgroundColor = "#E1E4EA";

    function instance$4($$self, $$props, $$invalidate) {
    	let $pictureHistory;
    	let $picture;
    	let $config;
    	validate_store(pictureHistory, 'pictureHistory');
    	component_subscribe($$self, pictureHistory, $$value => $$invalidate(10, $pictureHistory = $$value));
    	validate_store(picture, 'picture');
    	component_subscribe($$self, picture, $$value => $$invalidate(11, $picture = $$value));
    	validate_store(config, 'config');
    	component_subscribe($$self, config, $$value => $$invalidate(0, $config = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PictureCanvas', slots, []);
    	const around = [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }];
    	let canvas;
    	let ctx;
    	let start;
    	let drawingRect = false;
    	let drawingCircle = false;

    	onMount(() => {
    		canvas = document.querySelector('canvas');
    		ctx = canvas.getContext('2d');
    	});

    	function drawPoint(p, config) {
    		switch (config.tool) {
    			case 'PEN':
    				$picture.drawPoint(p, config['color'], ctx);
    				break;
    			case 'ERASER':
    				$picture.drawPoint(p, config['background_color'], ctx);
    				break;
    		}
    	}

    	function pickColor(p) {
    		let selectedColor = $picture.getColor(p);

    		config.update(n => n = {
    			color: selectedColor,
    			background_color: n.background_color,
    			tool: n.tool
    		});
    	}

    	function drawRect(start, end, color, ctx) {
    		let xStart = Math.min(start.x, end.x);
    		let yStart = Math.min(start.y, end.y);
    		let xEnd = Math.max(start.x, end.x);
    		let yEnd = Math.max(start.y, end.y);
    		let drawn = [];
    		for (let y = yStart; y < yEnd; y++) for (let x = xStart; x < xEnd; x++) drawn.push({ x, y });
    		$picture.drawPoints(drawn, color, ctx);
    	}

    	function drawCircle(start, end, color, ctx) {
    		let r = Math.ceil(getRadius(start, end));
    		let drawn = [];
    		let xStart = Math.min(start.x, end.x) - 2 * r;
    		let yStart = Math.min(start.y, end.y) - 2 * r;
    		let xEnd = Math.max(start.x, end.x) + 2 * r;
    		let yEnd = Math.max(start.y, end.y) + 2 * r;
    		for (let y = yStart; y < yEnd; y++) for (let x = xStart; x < xEnd; x++) if (getRadius(start, { x, y }) <= r) drawn.push({ x, y });
    		$picture.drawPoints(drawn, color, ctx);
    	}

    	function fillColor(point, color, ctx) {
    		let w = width / 10, h = height / 10;
    		let targetColor = $picture.getColor(point);
    		let drawn = [point];

    		for (let done = 0; done < drawn.length; done++) {
    			for (let { dx, dy } of around) {
    				let x = drawn[done].x + dx, y = drawn[done].y + dy;

    				if (x >= 0 && x < w && y >= 0 && y < h && $picture.getColor({ x, y }) == targetColor && !drawn.some(p => p.x == x && p.y == y)) {
    					drawn.push({ x, y });
    				}
    			}
    		}

    		$picture.drawPoints(drawn, color, ctx);
    	}

    	/* handling canvas */
    	function handleClick(event, config) {
    		if (event.button != 0) return;
    		let newPic = new Picture(90, 60, 10);
    		newPic.setPixels($picture.getPixels());
    		$pictureHistory.push(newPic);

    		switch (config.tool) {
    			case 'PICKER':
    				pickColor(getPointerPosition(event, canvas));
    				break;
    			case 'FILL':
    				fillColor(getPointerPosition(event, canvas), config['color'], ctx);
    				break;
    			case 'RECT':
    				if (drawingRect) drawRect(start, getPointerPosition(event, canvas), config['color'], ctx); else start = getPointerPosition(event, canvas);
    				drawingRect = !drawingRect;
    				break;
    			case 'CIRCLRE':
    				if (drawingCircle) drawCircle(start, getPointerPosition(event, canvas), config['color'], ctx); else start = getPointerPosition(event, canvas);
    				drawingCircle = !drawingCircle;
    				break;
    			default:
    				drawPoint(getPointerPosition(event, canvas), config);
    		}
    	}

    	function handleMove(event, config) {
    		if (event.buttons == 0) return;
    		let newPic = new Picture(90, 60, 10);
    		newPic.setPixels($picture.getPixels());
    		$pictureHistory.push(newPic);

    		switch (config.tool) {
    			default:
    				drawPoint(getPointerPosition(event, canvas), config);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PictureCanvas> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => handleClick(e, $config);
    	const mousemove_handler = e => handleMove(e, $config);

    	$$self.$capture_state = () => ({
    		onMount,
    		config,
    		picture,
    		pictureHistory,
    		getPointerPosition,
    		getRadius,
    		Picture,
    		scale,
    		width,
    		height,
    		backgroundColor,
    		around,
    		canvas,
    		ctx,
    		start,
    		drawingRect,
    		drawingCircle,
    		drawPoint,
    		pickColor,
    		drawRect,
    		drawCircle,
    		fillColor,
    		handleClick,
    		handleMove,
    		$pictureHistory,
    		$picture,
    		$config
    	});

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) canvas = $$props.canvas;
    		if ('ctx' in $$props) ctx = $$props.ctx;
    		if ('start' in $$props) start = $$props.start;
    		if ('drawingRect' in $$props) drawingRect = $$props.drawingRect;
    		if ('drawingCircle' in $$props) drawingCircle = $$props.drawingCircle;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$config, handleClick, handleMove, click_handler, mousemove_handler];
    }

    class PictureCanvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PictureCanvas",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Compononets/Tool.svelte generated by Svelte v3.55.1 */
    const file$3 = "src/Compononets/Tool.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (33:8) {#each tools as tool}
    function create_each_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "../../icons/" + /*tool*/ ctx[8] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "" + (/*tool*/ ctx[8] + " img" + " svelte-1q1ghz6"));
    			attr_dev(img, "alt", /*tool*/ ctx[8]);
    			attr_dev(img, "width", "30px");
    			add_location(img, file$3, 33, 12, 1119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "click", /*handleMouseClick*/ ctx[2], false, false, false),
    					listen_dev(img, "keydown", keydown_handler$1, false, false, false),
    					listen_dev(img, "mouseover", /*handleMouseOver*/ ctx[3], false, false, false),
    					listen_dev(img, "focus", focus_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(33:8) {#each tools as tool}",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#each shapes as shape}
    function create_each_block(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "../../icons/" + /*shape*/ ctx[5] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "" + (/*shape*/ ctx[5] + " img" + " svelte-1q1ghz6"));
    			attr_dev(img, "alt", /*shape*/ ctx[5]);
    			attr_dev(img, "width", "30px");
    			add_location(img, file$3, 42, 12, 1521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "click", /*handleMouseClick*/ ctx[2], false, false, false),
    					listen_dev(img, "keydown", keydown_handler_1, false, false, false),
    					listen_dev(img, "mouseover", /*handleMouseOver*/ ctx[3], false, false, false),
    					listen_dev(img, "focus", focus_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:8) {#each shapes as shape}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div1;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let each_value_1 = /*tools*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*shapes*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			img0 = element("img");
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			img1 = element("img");
    			attr_dev(div0, "class", "tools");
    			add_location(div0, file$3, 31, 4, 1057);
    			attr_dev(img0, "class", "seperator svelte-1q1ghz6");
    			if (!src_url_equal(img0.src, img0_src_value = "../../icons/seperator.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "seperator");
    			attr_dev(img0, "width", "30px");
    			attr_dev(img0, "height", "30px");
    			add_location(img0, file$3, 37, 4, 1332);
    			attr_dev(div1, "class", "shapes");
    			add_location(div1, file$3, 40, 4, 1456);
    			attr_dev(img1, "class", "seperator svelte-1q1ghz6");
    			if (!src_url_equal(img1.src, img1_src_value = "../../icons/seperator.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "seperator");
    			attr_dev(img1, "width", "30px");
    			attr_dev(img1, "height", "30px");
    			add_location(img1, file$3, 46, 4, 1741);
    			attr_dev(main, "class", "svelte-1q1ghz6");
    			add_location(main, file$3, 29, 0, 1028);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(main, t0);
    			append_dev(main, img0);
    			append_dev(main, t1);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(main, t2);
    			append_dev(main, img1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tools, handleMouseClick, handleMouseOver*/ 13) {
    				each_value_1 = /*tools*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*shapes, handleMouseClick, handleMouseOver*/ 14) {
    				each_value = /*shapes*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keydown_handler$1 = () => {
    	
    };

    const focus_handler = () => {
    	
    };

    const keydown_handler_1 = () => {
    	
    };

    const focus_handler_1 = () => {
    	
    };

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tool', slots, []);
    	const tools = ["pen", "eraser", "fill", "picker"];
    	const shapes = ["circle", "rect"];
    	let toolsImg;

    	onMount(() => {
    		toolsImg = Array.from(document.querySelectorAll(".img"));
    	});

    	function handleMouseClick(event) {
    		let toolName = getClassName(event.target);

    		toolsImg.map(n => {
    			n.src = `../../icons/${n.classList[0]}.png`;
    		});

    		toolsImg.filter(n => n.classList[0] == toolName)[0].src = `../../icons/${toolName}-selected.png`;
    		toolName = toolName.toUpperCase();

    		config.update(n => n = {
    			color: n.color,
    			background_color: n.background_color,
    			tool: TOOLENUM[toolName]
    		});
    	}

    	function handleMouseOver(event) {
    		let toolName = getClassName(event.target);

    		toolsImg.map(n => {
    			n.style.borderWidth = "0px";
    		});

    		toolsImg.filter(n => n.classList[0] == toolName)[0].style.borderWidth = "1px";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tool> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		config,
    		TOOLENUM,
    		getClassName,
    		tools,
    		shapes,
    		toolsImg,
    		handleMouseClick,
    		handleMouseOver
    	});

    	$$self.$inject_state = $$props => {
    		if ('toolsImg' in $$props) toolsImg = $$props.toolsImg;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tools, shapes, handleMouseClick, handleMouseOver];
    }

    class Tool extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tool",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Compononets/Settings.svelte generated by Svelte v3.55.1 */
    const file$2 = "src/Compononets/Settings.svelte";

    function create_fragment$2(ctx) {
    	let img;
    	let img_src_value;
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			input = element("input");
    			if (!src_url_equal(img.src, img_src_value = "../icons/undo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "undo svelte-3czknu");
    			attr_dev(img, "width", "30");
    			attr_dev(img, "alt", "undo icon");
    			add_location(img, file$2, 22, 0, 566);
    			attr_dev(input, "type", "color");
    			attr_dev(input, "class", "svelte-3czknu");
    			add_location(input, file$2, 23, 0, 680);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*$config*/ ctx[0]['color']);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "click", /*handleUndo*/ ctx[2], false, false, false),
    					listen_dev(img, "keydown", keydown_handler, false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(input, "input", /*handleColorChange*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$config*/ 1) {
    				set_input_value(input, /*$config*/ ctx[0]['color']);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keydown_handler = () => {
    	
    };

    function instance$2($$self, $$props, $$invalidate) {
    	let $picture;
    	let $pictureHistory;
    	let $config;
    	validate_store(picture, 'picture');
    	component_subscribe($$self, picture, $$value => $$invalidate(6, $picture = $$value));
    	validate_store(pictureHistory, 'pictureHistory');
    	component_subscribe($$self, pictureHistory, $$value => $$invalidate(7, $pictureHistory = $$value));
    	validate_store(config, 'config');
    	component_subscribe($$self, config, $$value => $$invalidate(0, $config = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	let canvas;
    	let ctx;

    	onMount(() => {
    		canvas = document.querySelector('canvas');
    		ctx = canvas.getContext('2d');
    	});

    	function handleColorChange(event) {
    		config.update(n => n = {
    			color: event.target.value,
    			background_color: n.background_color,
    			tool: n.tool
    		});
    	}

    	function handleUndo() {
    		$picture.setPixels($pictureHistory.pop().getPixels());
    		$picture.redraw(ctx);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$config['color'] = this.value;
    		config.set($config);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		config,
    		picture,
    		pictureHistory,
    		canvas,
    		ctx,
    		handleColorChange,
    		handleUndo,
    		$picture,
    		$pictureHistory,
    		$config
    	});

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) canvas = $$props.canvas;
    		if ('ctx' in $$props) ctx = $$props.ctx;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$config, handleColorChange, handleUndo, input_input_handler];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Compononets/File.svelte generated by Svelte v3.55.1 */
    const file$1 = "src/Compononets/File.svelte";

    function create_fragment$1(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Save";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Load";
    			attr_dev(button0, "class", "save svelte-7ehrj4");
    			add_location(button0, file$1, 69, 0, 2015);
    			attr_dev(button1, "class", "load svelte-7ehrj4");
    			add_location(button1, file$1, 70, 0, 2074);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleSave*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*handleLoad*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('File', slots, []);
    	let canvas;
    	let ctx;

    	onMount(() => {
    		canvas = document.querySelector('canvas');
    		ctx = canvas.getContext('2d');
    	});

    	function handleSave() {
    		let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    		window.location.href = image;
    	}

    	function handleLoad() {
    		startLoad(({ pixels }) => {
    			picture.subscribe(n => {
    				n.setPixels(pixels);
    				n.redraw(ctx);
    			});
    		});
    	}

    	function startLoad(dispatch) {
    		let input = elt("input", {
    			type: "file",
    			onchange: () => finishLoad(input.files[0], dispatch)
    		});

    		input.click();
    		input.remove();
    	}

    	function finishLoad(file, dispatch) {
    		if (file == null) return;
    		let reader = new FileReader();

    		reader.addEventListener("load", () => {
    			let image = elt("img", {
    				onload: () => dispatch({ pixels: pictureFromImage(image) }),
    				src: reader.result
    			});
    		});

    		reader.readAsDataURL(file);
    	}

    	//Can be better
    	function pictureFromImage(image) {
    		let width = Math.min(900, image.width);
    		let height = Math.min(600, image.height);
    		let canvas = elt("canvas", { width, height });
    		let cx = canvas.getContext("2d");
    		cx.drawImage(image, 0, 0, width, height);
    		let pixels = [];
    		let ret = new Array(height);
    		for (let i = 0; i < height; i++) ret[i] = new Array(width);
    		let { data } = cx.getImageData(0, 0, width, height);

    		function hex(n) {
    			return n.toString(16).padStart(2, "0");
    		}

    		for (let i = 0; i < data.length; i += 4) {
    			let [r, g, b] = data.slice(i, i + 3);
    			pixels.push("#" + hex(r) + hex(g) + hex(b));
    		}

    		for (let j = 0; j < height / 10; j++) for (let i = 0; i < width / 10; i++) ret[j][i] = pixels[(j * width + i) * 10];
    		return ret;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<File> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		picture,
    		elt,
    		canvas,
    		ctx,
    		handleSave,
    		handleLoad,
    		startLoad,
    		finishLoad,
    		pictureFromImage
    	});

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) canvas = $$props.canvas;
    		if ('ctx' in $$props) ctx = $$props.ctx;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [handleSave, handleLoad];
    }

    class File extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.55.1 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div0;
    	let picturecanvas;
    	let t2;
    	let div3;
    	let div1;
    	let tool;
    	let t3;
    	let div2;
    	let settings;
    	let t4;
    	let div4;
    	let file_1;
    	let current;
    	picturecanvas = new PictureCanvas({ $$inline: true });
    	tool = new Tool({ $$inline: true });
    	settings = new Settings({ $$inline: true });
    	file_1 = new File({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Pixinter";
    			t1 = space();
    			div0 = element("div");
    			create_component(picturecanvas.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(tool.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			create_component(settings.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			create_component(file_1.$$.fragment);
    			attr_dev(h1, "class", "svelte-hj6w8l");
    			add_location(h1, file, 7, 1, 247);
    			attr_dev(div0, "class", "canvas svelte-hj6w8l");
    			add_location(div0, file, 9, 1, 269);
    			attr_dev(div1, "class", "tool svelte-hj6w8l");
    			add_location(div1, file, 14, 2, 342);
    			attr_dev(div2, "class", "settings");
    			add_location(div2, file, 15, 2, 378);
    			attr_dev(div3, "class", "tools svelte-hj6w8l");
    			add_location(div3, file, 13, 1, 320);
    			attr_dev(div4, "class", "file svelte-hj6w8l");
    			add_location(div4, file, 18, 1, 431);
    			add_location(main, file, 6, 0, 239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div0);
    			mount_component(picturecanvas, div0, null);
    			append_dev(main, t2);
    			append_dev(main, div3);
    			append_dev(div3, div1);
    			mount_component(tool, div1, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			mount_component(settings, div2, null);
    			append_dev(main, t4);
    			append_dev(main, div4);
    			mount_component(file_1, div4, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(picturecanvas.$$.fragment, local);
    			transition_in(tool.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			transition_in(file_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(picturecanvas.$$.fragment, local);
    			transition_out(tool.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			transition_out(file_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(picturecanvas);
    			destroy_component(tool);
    			destroy_component(settings);
    			destroy_component(file_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ PictureCanvas, Tool, Settings, File });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
