import Layout from './Layout.vue'
import ImageZoom from './components/ImageZoom.vue'
import './styles.css'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('ImageZoom', ImageZoom)
  }
}
