const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { resolve } = require('metro-resolver');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable .cjs extension support for Firebase SDK
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

const moduleAliases = {
    '@expo/ui': path.resolve(__dirname, 'node_modules/@expo/ui/src/universal/index.ts'),
    '@firebase/app': path.resolve(__dirname, 'node_modules/@firebase/app/dist/index.cjs.js'),
    '@radix-ui/primitive/is-development': path.resolve(
        __dirname,
        'node_modules/@radix-ui/primitive/dist/internal/is-development.false.mjs',
    ),
};

// Firebase's React Native bundle requires package exports to remain disabled.
// Expo UI is mapped to its public universal component source so its BottomSheet
// can still be resolved under that setting.
config.resolver.resolveRequest = (context, moduleName, platform) => {
    const moduleAlias = moduleAliases[moduleName];
    const isExpoDevToolsImport =
        moduleName === './withDevTools' &&
        context.originModulePath.endsWith('node_modules/expo/src/launch/registerRootComponent.tsx');

    if (isExpoDevToolsImport) {
        return {
            type: 'sourceFile',
            filePath: path.resolve(__dirname, 'lib/expoDevTools.tsx'),
        };
    }

    if (moduleAlias) {
        return { type: 'sourceFile', filePath: moduleAlias };
    }

    return resolve(context, moduleName, platform);
};

module.exports = config;
