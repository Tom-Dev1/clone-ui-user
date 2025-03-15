import { AuthProvider } from "./hooks/use-auth"
import { AppRouter } from "./routers"

function App() {

  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  )
}

export default App
