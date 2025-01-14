import 'tailwindcss/tailwind.css';
import localForage from 'localforage';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Provider, connect, useDispatch } from 'react-redux';

import useSystemThemePreference from 'lib/useSystemThemePreference';
import { useStore } from 'lib/store';
import * as API from 'lib/api';
import 'styles/ATO.css';

const ThemeWrapper = connect(
  (state: any) => ({ theme: state.theme, fontLigaturesEnabled: state.fontLigaturesEnabled }),
)(({
  Component, pageProps, theme, fontLigaturesEnabled,
}: {
  Component: React.ComponentType,
  theme: ('light' | 'dark' | 'system'),
  pageProps: any,
  fontLigaturesEnabled: boolean
}) => {
  const dispatch = useDispatch();
  React.useEffect((async () => {
    const storedTheme = await localForage.getItem('ATO_theme');
    if (storedTheme) {
      dispatch({ type: 'setTheme', theme: storedTheme });
    }
    const storedFontLigatures = await localForage.getItem('ATO_font_ligatures');
    if (typeof storedFontLigatures === 'boolean') {
      dispatch({ type: 'setFontLigaturesEnabled', fontLigaturesEnabled: storedFontLigatures });
    }
    dispatch({ type: 'setLanguagesMetadata', metadata: await API.getMetadata() });
  }) as (() => void), []);
  const systemThemePreference = useSystemThemePreference();
  return (
    <div
      className={
        ((theme === 'light' || (theme === 'system' && systemThemePreference === 'light'))
          ? '' : 'dark ')
        + (fontLigaturesEnabled ? 'ATO_font_ligatures' : 'ATO_no_font_ligatures')
    }
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </div>
  );
});

function MyApp({ Component, pageProps }: { Component: React.ComponentType, pageProps: any }) {
  const store = useStore(pageProps.initialReduxState);
  return (
    <Provider store={store}>
      <ThemeWrapper Component={Component} pageProps={pageProps} />
    </Provider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
