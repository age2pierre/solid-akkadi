import './main.css'

import { registerBuiltInLoaders } from '@babylonjs/loaders/dynamic'
import { render } from 'solid-js/web'

registerBuiltInLoaders()

import App from './App'

render(() => <App />, document.getElementById('root') ?? document.body)
