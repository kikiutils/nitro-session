export default defineEventHandler((event) => {
    event.context.session.testValue = (event.context.session.testValue || 0) + 1;
});
