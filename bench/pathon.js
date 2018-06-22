const { path, immutablePreset, mutablePreset } = require("../../pathon/es");

const pathonSuite = (iterations, initCounterStore, deepState, initNormalizedState, normalizedCount) => {
    suite("pathon", function () {
        set('iterations', iterations);
        bench("create", function () {
            const rootPath = path('root', {}, immutablePreset);
        });
        const rootPath = path('root', { ...initCounterStore }, immutablePreset);
        const counterPath = rootPath.path('scope').path('counter');
        rootPath.watch(state => state);
        bench("modify", function () {
            counterPath.set(0);
        });
        bench("counter reducer", function () {
            counterPath.set(counterPath.get() + 1);
            counterPath.set(counterPath.get() - 1);
        });

        const deepExamplePath = path(
            "deep-example",
            { ...deepState },
            immutablePreset
        );
        const increment = () => {
            const counterPath = deepExamplePath
                .path("scope0")
                .path("scope1")
                .path("scope2")
                .path("scope3")
                .path("scope4")
                .path("counter");
            counterPath.set(counterPath.get() + 1);
        };
        const decrement = () => {
            const counterPath = deepExamplePath
                .path("scope0")
                .path("scope1")
                .path("scope2")
                .path("scope3")
                .path("scope4")
                .path("counter");
            counterPath.set(counterPath.get() - 1);
        };
        deepExamplePath.watch(state => state);
        bench("counter reducer deep", function () {
            increment();
            decrement();
            deepExamplePath.get();
        });

        const newsExamplePath = path(
            "news-example",
            { ...initNormalizedState },
            immutablePreset
        );
        newsExamplePath.watch(state => state);

        const addNews = (news) => {
            const state = newsExamplePath.get();
            newsExamplePath.set({
                news: { ...state.news, [news.id]: news },
                show: [...state.show, news.id]
            });
        };

        const deleteNews = (id) => {
            const state = newsExamplePath.get();
            const { [id]: _, ...news } = state.news;
            newsExamplePath.set({
                news,
                show: state.show.filter(element => element !== id)
            });
        };
        bench("normalized state", function () {
            for (let i = 0; i < normalizedCount; i++) {
                addNews({ id: i, text: "some news text" + i });
            }
            for (let i = normalizedCount - 1; i >= 0; i--) {
                deleteNews(i);
            }
        });
    });
    suite("pathon mutable", function () {
        set('iterations', iterations);
        bench("create", function () {
            const rootPath = path('root', {}, mutablePreset);
        });
        const rootPath = path('root', { ...initCounterStore }, mutablePreset);
        const counterPath = rootPath.path('scope').path('counter');
        rootPath.watch(state => state);
        bench("modify", function () {
            counterPath.set(0);
        });
        bench("counter reducer", function () {
            counterPath.set(counterPath.get() + 1);
            counterPath.set(counterPath.get() - 1);
        });

        const deepExamplePath = path(
            "deep-example",
            { ...deepState },
            mutablePreset
        );
        const increment = () => {
            const counterPath = deepExamplePath
                .path("scope0")
                .path("scope1")
                .path("scope2")
                .path("scope3")
                .path("scope4")
                .path("counter");
            counterPath.set(counterPath.get() + 1);
        };
        const decrement = () => {
            const counterPath = deepExamplePath
                .path("scope0")
                .path("scope1")
                .path("scope2")
                .path("scope3")
                .path("scope4")
                .path("counter");
            counterPath.set(counterPath.get() - 1);
        };
        deepExamplePath.watch(state => state);
        bench("counter reducer deep", function () {
            increment();
            decrement();
            deepExamplePath.get();
        });

        const newsExamplePath = path(
            "news-example",
            { ...initNormalizedState },
            mutablePreset
        );
        newsExamplePath.watch(state => state);

        const addNews = ({ id, text }) => {
            const state = newsExamplePath.get();
            state.news[id] = { id, text };
            state.show.push(id);
            newsExamplePath.set(state);
        };

        const deleteNews = (id) => {
            const state = newsExamplePath.get();
            delete state.news[id];
            state.show = state.show.filter(element => element !== id);
            newsExamplePath.set(state);
        };
        bench("normalized state", function () {
            for (let i = 0; i < 10; i++) {
                addNews({ id: i, text: "some news text" + i });
            }
            for (let i = 9; i >= 0; i--) {
                deleteNews(i);
            }
        });
    });
};
module.exports.pathonSuite = pathonSuite;
