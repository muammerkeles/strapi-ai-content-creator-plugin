import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import OpenAIContentCreator from './components/EditViewCompnents/OpenAIContentCreator';
import GeminiContentCreator from './components/EditViewCompnents/GeminiContentCreator';

export default {
  bootstrap(app) {

    const cmPlugin = app.getPlugin('content-manager');

    if (!cmPlugin) {
      console.error("❌ content-manager plugin not found!");
      return;
    }
    //console.log("✅ content-manager plugin found:", cmPlugin);

    if (cmPlugin) {

      app.getPlugin('content-manager').apis.addEditViewSidePanel([OpenAIContentCreator,GeminiContentCreator]);
    }
  },
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
