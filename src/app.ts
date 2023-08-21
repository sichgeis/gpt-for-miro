import { createApp } from 'vue';
import App from './App.vue';
import * as Sentry from "@sentry/vue";

const app = createApp(App)

Sentry.init({
    app,
    dsn: "https://7613c5c39c1e9951e5d4520799cbee5e@o4505742105182208.ingest.sentry.io/4505742107017216",
});

app.mount('#root');
