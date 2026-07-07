import { I18nProvider } from './i18n/I18nContext'
import { FoodTable } from './components/FoodTable'

function App() {
  return (
    <I18nProvider>
      <FoodTable />
    </I18nProvider>
  )
}

export default App
