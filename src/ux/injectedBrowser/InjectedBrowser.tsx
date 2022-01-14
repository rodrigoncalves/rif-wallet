import React, { useMemo, useRef, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { Paragraph } from '../../components'
import { ScreenWithWallet } from '../../screens/types'

import { ScreenProps } from '../../screens/injectedBrowser/types'
import { InjectedBrowserAdapter } from '../../lib/walletAdapters/InjectedBrowserAdapter'

import Url from 'url-parse'
import { SquareButton } from '../../components/button/SquareButton'
import { sharedStyles } from '../requestsModal/sharedStyles'
import { Arrow, RefreshIcon } from '../../components/icons'

export const InjectedBrowser: React.FC<
  ScreenWithWallet & ScreenProps<'InjectedBrowser'>
> = ({ wallet, route }) => {
  const { uri } = route.params

  const adapter = useMemo(() => new InjectedBrowserAdapter(wallet), [wallet])

  const webviewRef = useRef<WebView | null>(null)
  const [progress, setProgress] = useState(0)

  const postMessageToWebView = (result: { id: string; result: any }) => {
    if (webviewRef && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(result))
    }
  }

  const onPostMessage = async ({ nativeEvent }: any) => {
    const url = nativeEvent.url
    let data = nativeEvent.data

    if (new Url(url).origin !== new Url(uri).origin) {
      console.error('origin not allowed')
      return
    }

    data = typeof data === 'string' ? JSON.parse(data) : data
    if (!data) {
      return
    }

    const { id, method, params } = data

    try {
      const result = await adapter.handleCall(method, params)

      postMessageToWebView({ id, result })
    } catch (err: any) {
      const message = err ? err.toString() : 'Failed to approve'

      console.error('onPostMessage', message)

      postMessageToWebView({
        id,
        result: {
          error: true,
          message,
        },
      })
    }
  }

  const onError = ({ nativeEvent }: any) => {
    console.error('onError', nativeEvent)
  }

  const onLoadProgress = ({ nativeEvent }: any) => {
    setProgress(nativeEvent.progress)
  }

  return (
    <View style={styles.webview}>
      <View style={styles.webview}>
        <WebView
          decelerationRate={'normal'}
          ref={webviewRef as any}
          source={{
            uri,
          }}
          onMessage={onPostMessage}
          onError={onError}
          onLoadProgress={onLoadProgress}
          onload
          injectedJavaScriptBeforeContentLoaded={JS_BROWSER_INJECTED}
          userAgent={USER_AGENT}
          javascriptEnabled
          useWebkit
          geolocationEnabled={false}
          allowFileAccess={false}
        />
      </View>
      <ProgressBar progress={progress} />
      <View style={styles.buttonsSection}>
        <SquareButton
          disabled={progress !== 1}
          onPress={() => {
            webviewRef.current?.goBack()
          }}
          icon={<Arrow rotate={-90} color={'#000'} />}
        />
        <SquareButton
          disabled={progress !== 1}
          onPress={() => {
            webviewRef.current?.reload()
          }}
          icon={<RefreshIcon color={'#000'} />}
        />
      </View>
    </View>
  )
}

const ProgressBar = ({ progress }: { progress: number }) => (
  <>
    {progress !== 1 && (
      <View style={styles.progressBarWrapper}>
        <Paragraph>Loading... {Math.floor(progress * 100)}%</Paragraph>
      </View>
    )}
  </>
)

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    zIndex: 1,
  },
  progressBarWrapper: {
    backgroundColor: '#fff',
    height: 50,
    width: '100%',
    left: 0,
    right: 0,
    top: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  buttonsSection: {
    ...sharedStyles.row,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
})

const USER_AGENT =
  Platform.OS === 'android'
    ? 'Mozilla/5.0 (Linux; Android 10; Android SDK built for x86 Build/OSM1.180201.023) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/76.0.3809.123 Mobile/15E148 Safari/605.1'

const JS_BROWSER_INJECTED = /* javascript */ `
  (function () {
    let resolver = {};
    let rejecter = {};
    let callNumber = 0;

    window.ethereum = {};
    window.ethereum.isSWallet = true;

    window.ethereum.on = (method, callback) => { if (method) {console.log(method)} }
    window.ethereum.removeListener = (method, callback) => { if (method) {console.log(method)} }
    window.ethereum.removeAllListeners = () => { console.log("removeAllListeners") }

    ${
      Platform.OS === 'ios' ? 'window' : 'document'
    }.addEventListener("message", function(message) {
      try {
        const passData = message.data ? JSON.parse(message.data) : message.data;
        const { id, result } = passData;
        if (result && result.error && rejecter[id]) {
          rejecter[id](new Error(result.message));
        } else if (resolver[id]) {
          resolver[id](result);
        }
      } catch(err) {
        console.log('listener message err: ', err);
      }
    })

    function communicateWithRN (payload) {
      return new Promise((resolve, reject) => {
        console.log('JSON.stringify(payload): ', JSON.stringify(payload));
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        const { id } = payload;
        resolver[id] = resolve;
        rejecter[id] = reject;
      })
    }

    // Override enable function can return the current address to web site
    window.ethereum.enable = () =>
      new Promise((resolve, reject) =>
        sendAsync({ method: "eth_requestAccounts" }).then(response =>
          response.result
            ? resolve(response.result)
            : reject(new Error(response.message || 'provider error'))));

    // Override the sendAsync function so we can listen the web site's call and do our things
    const sendAsync = async (payload, callback) => {
      callNumber = callNumber + 1

      let errRes = null;
      let res = null;
      let result = null;

      const {method, params, jsonrpc, id} = payload;
      const newId = id ? id : callNumber

      try {
        result = await communicateWithRN({
          method: method,
          params: params,
          jsonrpc: jsonrpc,
          id: newId
        });

        res = { id, jsonrpc, method, result };
      } catch(err) {
        errRes = err;
      }

      if (callback) {
        callback(errRes, res);
      } else {
        return res || errRes;
      }
    }

    window.ethereum.send = sendAsync;
    window.ethereum.sendAsync = sendAsync;
    window.ethereum.request = (payload) =>
      new Promise((resolve, reject) =>
        sendAsync(payload).then(response =>
          response.result
            ? resolve(response.result)
            : reject(new Error(response.message || 'provider error'))));
  }) ();
`