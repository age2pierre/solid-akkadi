import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'

import { render } from 'solid-js/web'
import { App } from './App'

render(() => <App />, document.getElementById('root')!)
