// https://nitro.unjs.io/config
export default defineNitroConfig({
    alias: { '@': '~/' },
    compatibilityDate: '2100-01-01',
    noPublicDir: true,
    serveStatic: false,
    sourceMap: false,
    srcDir: './playground',
    timing: true,
    typescript: {
        strict: true,
        tsConfig: {
            compilerOptions: { paths: { '@/*': ['../../playground/*'] } },
            extends: '@kikiutils/tsconfigs/esnext/esnext.json',
        },
    },
});
