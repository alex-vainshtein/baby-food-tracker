import { I18nProvider } from './i18n/I18nContext'
import { KitTrackerProvider } from './hooks/KitTrackerContext'
import { FoodTable } from './components/FoodTable'

function App() {
  return (
    <I18nProvider>
      <KitTrackerProvider>
        <FoodTable />
      </KitTrackerProvider>
    </I18nProvider>
  )
}

export default App
