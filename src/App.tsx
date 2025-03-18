import { AuthProvider } from "./hooks/use-auth"
import { AppRouter } from "./routers"
import { Provider } from "react-redux"
import { store } from "./store"
function App() {

  return (
    <>
      <AuthProvider>
        <Provider store={store}>

          <AppRouter />
        </Provider>
      </AuthProvider>
    </>
  )
}

export default App
