import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'
import 'babylonjs-loaders'

import { render } from 'solid-js/web'
import { App } from './App'

render(() => <App />, document.getElementById('root')!)
