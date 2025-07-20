import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import Result from './pages/Result'

// React Router v6.4+ 방식으로 future flags 적용
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/test",
      element: <Test />,
    },
    {
      path: "/result/:id",
      element: <Result />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
)

function App() {
  return <RouterProvider router={router} />
}

export default App